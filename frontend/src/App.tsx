import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { AdminSidebar, AdminSection } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { SpiderWebCanvas } from './components/SpiderWebCanvas';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { ArenaView } from './views/ArenaView';
import { ProgressionView } from './views/ProgressionView';
import { LeaderboardView } from './views/LeaderboardView';
import { ProfileView } from './views/ProfileView';
import { VictoryView } from './views/VictoryView';
import { AdminView } from './views/AdminView';
import { Shield } from 'lucide-react';

import { User, Challenge } from './types';
import { api, getStoredUser, setStoredUser, normalizeChallenge } from './utils/api';
import { INITIAL_CHALLENGES, MOCK_USER } from './utils/mockData';
import { sounds } from './utils/soundEffects';

export function App() {
  // Always show login page first on link open, then transition to dashboard
  const [user, setUser] = useState<User | null>(null);
  const [globalUnlocked, setGlobalUnlocked] = useState<boolean>(true);
  const [competitionTimer, setCompetitionTimer] = useState<number>(0);
  const [adminSection, setAdminSection] = useState<AdminSection>('controls');
  const [previewPlayerMode, setPreviewPlayerMode] = useState<boolean>(false);

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    return INITIAL_CHALLENGES.map(normalizeChallenge);
  });
  const getTabFromUrl = (): string => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin' || path === '/admin/' || window.location.hash === '#/admin') {
      return 'admin';
    }
    if (path === '/arena' || window.location.hash === '#/arena') return 'arena';
    if (path === '/matrix' || path === '/progression' || window.location.hash === '#/matrix') return 'progression';
    if (path === '/leaderboard' || window.location.hash === '#/leaderboard') return 'leaderboard';
    if (path === '/profile' || window.location.hash === '#/profile') return 'profile';
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<string>(getTabFromUrl);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    const targetPath = tab === 'dashboard' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!globalUnlocked) {
      return; // Freeze timer at the current moment when locked
    }
    const ticker = setInterval(() => {
      setCompetitionTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, [globalUnlocked]);

  useEffect(() => {
    loadChallenges();
    const timer = setInterval(() => {
      loadChallenges(true);
      // Check if active student player has been removed by admin
      if (user && user.role !== 'admin' && typeof user.id === 'number') {
        api.verifySession(user.id).then(res => {
          if (res && res.valid === false) {
            sounds.playError();
            alert('SESSION TERMINATED: Your player account has been removed by Admin. Please log in or register again.');
            handleLogout();
          }
        }).catch(() => { });
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [user?.id, user?.points, user?.role]);

  const loadChallenges = async (silent: boolean = false) => {
    try {
      const [data, statusData] = await Promise.all([
        api.getChallenges(user?.id),
        api.getCompetitionStatus()
      ]);
      if (statusData && typeof statusData.unlocked === 'boolean') {
        setGlobalUnlocked(statusData.unlocked);
        if (typeof statusData.elapsed_seconds === 'number') {
          if (!statusData.unlocked) {
            // When locked, freeze at server's exact elapsed time
            setCompetitionTimer(statusData.elapsed_seconds);
          } else {
            setCompetitionTimer(prev => {
              const serverSec = statusData.elapsed_seconds!;
              if (Math.abs(prev - serverSec) > 2) {
                return serverSec;
              }
              return prev;
            });
          }
        }
      }
      if (data && Array.isArray(data) && data.length > 0) {
        setChallenges(data.map(normalizeChallenge));
      }
    } catch (err: any) {
      if (err?.message?.includes('PLAYER_REMOVED') || err?.status === 401) {
        if (user && user.role !== 'admin') {
          sounds.playError();
          alert('SESSION TERMINATED: Your player account has been removed by Admin.');
          handleLogout();
          return;
        }
      }
      if (!silent) console.error('Error loading challenges:', err);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      const initial = getTabFromUrl();
      setActiveTab(initial === 'admin' ? 'admin' : 'dashboard');
    }
    loadChallenges();
  };

  const handleLogout = () => {
    sounds.playWebShoot();
    localStorage.removeItem('spider_code_user');
    setUser(null);
    setActiveTab('dashboard');
    setSelectedChallengeId(null);
  };

  const handleSelectChallenge = (challengeId: number) => {
    if (!globalUnlocked && user?.role !== 'admin') {
      sounds.playError();
      alert('ARENA LOCKED: All 10 challenges are currently locked by the Overseer. Stand by for the competition start signal.');
      return;
    }
    const completedList = user?.completed_challenges || [];
    if (completedList.includes(challengeId) && user?.role !== 'admin') {
      sounds.playError();
      alert(`QUEST #${challengeId} LOCKED: You have already completed this quest and received its badge! Completed quests are sealed.`);
      return;
    }
    setSelectedChallengeId(challengeId);
    setActiveTab('arena');
  };

  const handleChallengeCompleted = (challengeId: number, questPoints: number, overallPenalty: number = 0, newTotalPoints?: number) => {
    if (!user) return;

    const currentCompleted = user.completed_challenges || [];
    const newCompleted = currentCompleted.includes(challengeId)
      ? currentCompleted
      : [...currentCompleted, challengeId];

    const finalPoints = typeof newTotalPoints === 'number'
      ? newTotalPoints
      : Math.max(0, (user.points || 0) + questPoints - overallPenalty);

    const updatedUser: User = {
      ...user,
      points: finalPoints,
      completed_challenges: newCompleted
    };
    setUser(updatedUser);
    setStoredUser(updatedUser);

    loadChallenges();

    if (newCompleted.length >= 10) {
      setTimeout(() => {
        setActiveTab('victory');
      }, 1500);
    }
  };

  const handleNextChallenge = (nextId: number) => {
    sounds.playWebShoot();
    setSelectedChallengeId(nextId);
    setActiveTab('arena');
  };

  const safeChallenges = (challenges && challenges.length > 0 ? challenges : INITIAL_CHALLENGES).map(normalizeChallenge);
  const activeChallenge = safeChallenges.find(c => Number(c.id) === Number(selectedChallengeId)) || safeChallenges[0];

  return (
    <div className="min-h-screen bg-[#080B18] text-[#F5F7FF] flex font-sans selection:bg-[#F52245] selection:text-white relative overflow-x-hidden">

      {/* Background Interactive Spider-Web Network */}
      <SpiderWebCanvas interactive={true} density={35} opacity={0.2} />

      {/* Cyber Grid Pattern Overlay */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-30 z-0"></div>

      {!user ? (
        // Full Page Login Screen
        <div className="relative z-10 w-full flex items-center justify-center min-h-screen">
          <LoginView onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : user.role === 'admin' && !previewPlayerMode ? (
        // =========================================================================
        // DEDICATED ADMIN DASHBOARD (Matches User's Reference Admin Layout)
        // =========================================================================
        <div className="relative z-10 flex w-full min-h-screen">
          {/* Dedicated Admin Sidebar matching exact uploaded image */}
          <AdminSidebar
            activeSection={adminSection}
            setActiveSection={setAdminSection}
            onSignOut={handleLogout}
            adminName={user.name || 'admin'}
          />

          {/* Admin Main Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#080B18]/70">
            {/* Dedicated Admin Header */}
            <AdminHeader
              activeSectionTitle={
                adminSection === 'controls' ? 'Contest Controls' :
                  adminSection === 'problems' ? 'Problems Manager' :
                    adminSection === 'participants' ? 'Participants' :
                      adminSection === 'certificates' ? 'Certificates' : 'Live Leaderboard'
              }
              isUnlocked={globalUnlocked}
              competitionTimer={competitionTimer}
              onRefresh={loadChallenges}
              soundMuted={soundMuted}
              setSoundMuted={setSoundMuted}
              onTogglePreviewPlayer={() => {
                sounds.playWebShoot();
                setPreviewPlayerMode(true);
              }}
            />

            {/* Admin Content Area */}
            <main className="flex-1 overflow-y-auto">
              <AdminView
                user={user}
                onAdminAuthenticated={(adminUser) => {
                  setUser(adminUser);
                  setStoredUser(adminUser);
                }}
                challenges={safeChallenges}
                onRefreshChallenges={loadChallenges}
                activeSection={adminSection}
                setActiveSection={setAdminSection}
                competitionTimer={competitionTimer}
                onTimerReset={() => setCompetitionTimer(0)}
              />
            </main>
          </div>
        </div>
      ) : (
        // =========================================================================
        // DEDICATED PLAYER / STUDENT DASHBOARD (Esports Arena Layout)
        // =========================================================================
        <div className="relative z-10 flex flex-col w-full min-h-screen">

          {/* Admin Preview Mode Floating Banner */}
          {user.role === 'admin' && previewPlayerMode && (
            <div className="bg-purple-950/95 border-b border-purple-500/50 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-purple-200 z-50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>
                  <strong>ADMIN PREVIEW MODE:</strong> You are currently previewing the arena through the Cadet Player experience.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playWebShoot();
                  setPreviewPlayerMode(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#087CFF] hover:brightness-110 text-white font-bold text-xs font-heading uppercase tracking-wider transition-all"
              >
                Return to Admin Dashboard &rarr;
              </button>
            </div>
          )}

          <div className="flex flex-1 w-full min-h-0">
            {/* Player Left Sidebar */}
            <Sidebar
              user={user}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                if (tab !== 'arena') setSelectedChallengeId(null);
              }}
              onLogout={handleLogout}
            />

            {/* Player Main Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#080B18]/70">
              {/* Player Top Navigation Bar */}
              <TopHeader
                user={user}
                onOpenProfile={() => setActiveTab('profile')}
                soundMuted={soundMuted}
                setSoundMuted={setSoundMuted}
                competitionTimer={competitionTimer}
                globalUnlocked={globalUnlocked}
              />

              {/* Player Views Content Router */}
              <main className="flex-1 overflow-y-auto">
                {activeTab === 'dashboard' ? (
                  <DashboardView
                    user={user}
                    challenges={safeChallenges}
                    globalUnlocked={globalUnlocked}
                    competitionTimer={competitionTimer}
                    onSelectChallenge={handleSelectChallenge}
                    onOpenProgression={() => setActiveTab('progression')}
                  />
                ) : activeTab === 'arena' && activeChallenge ? (
                  <ArenaView
                    user={user}
                    challenge={activeChallenge}
                    globalUnlocked={globalUnlocked}
                    competitionTimer={competitionTimer}
                    onBackToDashboard={() => setActiveTab('dashboard')}
                    onChallengeCompleted={handleChallengeCompleted}
                    onNextChallenge={handleNextChallenge}
                  />
                ) : activeTab === 'progression' ? (
                  <ProgressionView
                    user={user}
                    challenges={safeChallenges}
                    onSelectChallenge={handleSelectChallenge}
                  />
                ) : activeTab === 'leaderboard' ? (
                  <LeaderboardView user={user} />
                ) : activeTab === 'profile' ? (
                  <ProfileView user={user} />
                ) : activeTab === 'victory' ? (
                  <VictoryView
                    user={user}
                    challenges={safeChallenges}
                    onReturnToDashboard={() => setActiveTab('dashboard')}
                  />
                ) : activeTab === 'admin' ? (
                  <AdminView
                    user={user}
                    onAdminAuthenticated={(adminUser) => {
                      setUser(adminUser);
                      setStoredUser(adminUser);
                      setPreviewPlayerMode(false);
                    }}
                    challenges={safeChallenges}
                    onRefreshChallenges={loadChallenges}
                    activeSection={adminSection}
                    setActiveSection={setAdminSection}
                  />
                ) : (
                  <DashboardView
                    user={user}
                    challenges={safeChallenges}
                    globalUnlocked={globalUnlocked}
                    onSelectChallenge={handleSelectChallenge}
                    onOpenProgression={() => setActiveTab('progression')}
                  />
                )}
              </main>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default App;
