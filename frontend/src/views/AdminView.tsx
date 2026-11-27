import React, { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  Unlock,
  Lock,
  Shield,
  ShieldAlert,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Crown,
  Medal,
  Flame,
  UserCheck,
  RefreshCw,
  Trash2,
  Code2,
  FileText,
  Radio,
  Zap,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { AdminOverviewData, Challenge, LeaderboardEntry, User } from '../types';
import { api } from '../utils/api';
import { sounds } from '../utils/soundEffects';
import { INITIAL_CHALLENGES } from '../utils/mockData';
import { AdminSection } from '../components/AdminSidebar';
import { formatCompetitionTimer } from '../utils/timer';

interface AdminViewProps {
  user?: User | null;
  onAdminAuthenticated?: (adminUser: User) => void;
  challenges: Challenge[];
  onRefreshChallenges: () => void;
  activeSection?: AdminSection;
  setActiveSection?: (section: AdminSection) => void;
  competitionTimer?: number;
  onTimerReset?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  user,
  onAdminAuthenticated,
  challenges,
  onRefreshChallenges,
  activeSection: propActiveSection,
  setActiveSection: propSetActiveSection,
  competitionTimer = 0,
  onTimerReset
}) => {
  const [internalSection, setInternalSection] = useState<AdminSection>('controls');
  const activeSection = propActiveSection || internalSection;
  const setActiveSection = propSetActiveSection || setInternalSection;

  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchProblem, setSearchProblem] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Inspector modal for problem details
  const [inspectedProblem, setInspectedProblem] = useState<Challenge | null>(null);

  // Modals state
  const [lockModal, setLockModal] = useState<{ open: boolean; action: 'unlock' | 'lock' | null }>({
    open: false,
    action: null
  });
  const [resetTimerModalOpen, setResetTimerModalOpen] = useState(false);
  const [resetAllModal, setResetAllModal] = useState(false);
  const [removePlayerModal, setRemovePlayerModal] = useState<{ open: boolean; player: { id: number; name: string; reg_number: string } | null }>({
    open: false,
    player: null
  });

  // Overseer gate state for non-admin users
  const [gateUsername, setGateUsername] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
      const interval = setInterval(() => {
        loadData(true);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [user?.role]);

  const loadData = async (silent: boolean = false) => {
    try {
      const [overviewData, lbData] = await Promise.all([
        api.getAdminOverview(),
        api.getLeaderboard()
      ]);
      setOverview(overviewData);
      setLeaderboard(lbData || []);
    } catch (err) {
      if (!silent) console.error('Error loading admin data:', err);
    }
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');
    setGateLoading(true);

    try {
      const u = gateUsername.trim();
      const p = gatePassword.trim();

      if (u !== 'spiderman') {
        throw new Error('ACCESS DENIED: Invalid Overseer credentials.');
      }

      if (p !== 'pg123') {
        throw new Error('ACCESS DENIED: Invalid Overseer credentials.');
      }

      const adminUser = await api.login('spiderman', p, 'spiderman', 'spiderman');
      sounds.playSuccess();
      if (onAdminAuthenticated) {
        onAdminAuthenticated(adminUser);
      }
      loadData();
    } catch (err: unknown) {
      sounds.playError();
      setGateError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setGateLoading(false);
    }
  };

  const handleGlobalLockToggle = async (action: 'unlock' | 'lock') => {
    setLoadingAction(true);
    setLockModal({ open: false, action: null });
    try {
      if (action === 'unlock') {
        await api.unlockAllChallenges();
        sounds.playSuccess();
        setStatusMsg('GLOBAL ARENA UNLOCKED: All 10 challenges are now unlocked and competition timer is running.');
      } else {
        await api.lockAllChallenges();
        sounds.playWebShoot();
        setStatusMsg('GLOBAL ARENA LOCKED: All 10 challenges have been frozen. Competition timer frozen at current moment.');
      }
      await loadData();
      onRefreshChallenges();
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err: unknown) {
      sounds.playError();
      setStatusMsg(err instanceof Error ? err.message : 'Action failed.');
      setTimeout(() => setStatusMsg(''), 5000);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetCompetitionTimer = async () => {
    setLoadingAction(true);
    setResetTimerModalOpen(false);
    try {
      await api.resetCompetitionTimer();
      sounds.playSuccess();
      onTimerReset?.();
      setStatusMsg('COMPETITION TIMER RESET: The timer has been successfully reset to 00:00.');
      await loadData();
      onRefreshChallenges();
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err: unknown) {
      sounds.playError();
      setStatusMsg(err instanceof Error ? err.message : 'Timer reset failed.');
      setTimeout(() => setStatusMsg(''), 5000);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemovePlayer = async () => {
    if (!removePlayerModal.player) return;
    const { id, name } = removePlayerModal.player;
    setLoadingAction(true);
    setRemovePlayerModal({ open: false, player: null });

    try {
      sounds.playWebShoot();
      await api.deleteStudent(id);
      sounds.playSuccess();
      setStatusMsg(`PLAYER REMOVED: "${name}" has been removed by Admin. Their panel is terminated and redirected to login.`);
      await loadData();
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err: unknown) {
      sounds.playError();
      setStatusMsg(err instanceof Error ? err.message : 'Failed to remove player.');
      setTimeout(() => setStatusMsg(''), 5000);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetAllPlayers = async () => {
    setLoadingAction(true);
    setResetAllModal(false);

    try {
      sounds.playWebShoot();
      await api.resetAllStudents();
      sounds.playSuccess();
      setStatusMsg('RESET COMPLETE: All registered players have been removed from the arena and their active panels returned to login.');
      await loadData();
      setTimeout(() => setStatusMsg(''), 5000);
    } catch (err: unknown) {
      sounds.playError();
      setStatusMsg(err instanceof Error ? err.message : 'Failed to reset players.');
      setTimeout(() => setStatusMsg(''), 5000);
    } finally {
      setLoadingAction(false);
    }
  };

  // If not admin, enforce Overseer Security Gate
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="glass-panel rounded-3xl p-8 border-2 border-purple-500/50 shadow-[0_0_60px_rgba(139,53,255,0.35)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,53,255,0.4)]">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold block">
                SECURITY CLEARANCE REQUIRED
              </span>
              <h2 className="font-heading text-2xl font-black text-white">
                OVERSEER PROTOCOL /admin
              </h2>
            </div>
          </div>

          <p className="text-xs font-mono text-slate-300 mb-6 leading-relaxed">
            The Competition Control Dashboard provides challenge unlock authority, player management, and live telemetry. Access requires strict case-sensitive Spider-Man Overseer credentials.
          </p>

          {gateError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleGateSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1.5 uppercase">
                Admin Username <span className="text-rose-400">* (Case-Sensitive)</span>
              </label>
              <input
                type="text"
                required
                value={gateUsername}
                onChange={(e) => setGateUsername(e.target.value)}
                placeholder="spiderman"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B18]/90 border border-purple-500/40 focus:border-purple-400 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1.5 uppercase">
                Overseer Password <span className="text-rose-400">* (Case-Sensitive)</span>
              </label>
              <input
                type="password"
                required
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B18]/90 border border-purple-500/40 focus:border-purple-400 text-xs text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={gateLoading}
              className="w-full mt-2 py-3 px-6 rounded-xl font-heading font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-[#087CFF] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(139,53,255,0.4)] flex items-center justify-center gap-2"
            >
              {gateLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>VALIDATE OVERSEER CLEARANCE</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isUnlocked = Boolean(overview.global_unlocked);

  const filteredStudents = overview.students.filter(s =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.reg_number.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const displayChallenges = (challenges && challenges.length >= 10 ? challenges : INITIAL_CHALLENGES).slice(0, 10);
  const filteredChallenges = displayChallenges.filter(ch =>
    ch.title.toLowerCase().includes(searchProblem.toLowerCase()) ||
    ch.difficulty.toLowerCase().includes(searchProblem.toLowerCase()) ||
    ch.category.toLowerCase().includes(searchProblem.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-8 font-sans max-w-7xl mx-auto">

      {/* Status Toast Notification */}
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: CONTEST CONTROLS (Clock icon in AdminSidebar)
          ========================================================================= */}
      {activeSection === 'controls' && (
        <div className="space-y-8">

          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>Contest Master Controls</span>
            </div>
            <h1 className="font-heading text-3xl font-black text-white tracking-wide">
              GLOBAL COMPETITION CONTROLS
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Global challenge unlock authority, arena emergency locks, and live competition statistics.
            </p>
          </div>

          {/* Master Global Lock Card */}
          <div className={`rounded-3xl p-6 sm:p-8 border-2 transition-all relative overflow-hidden ${isUnlocked
              ? 'bg-gradient-to-r from-[#080B18] via-[#0b281f] to-[#080B18] border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.25)]'
              : 'bg-gradient-to-r from-[#080B18] via-[#2a0e16] to-[#080B18] border-[#F52245]/60 shadow-[0_0_50px_rgba(245,34,69,0.25)]'
            }`}>
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

              {/* Status Details */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${isUnlocked
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(245,34,69,0.4)]'
                    }`}>
                    {isUnlocked ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>ARENA STATUS: UNLOCKED / LIVE</span>
                      </>
                    ) : competitionTimer > 0 ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>ARENA STATUS: LOCKED / FROZEN</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>ARENA STATUS: LOCKED / STANDBY</span>
                      </>
                    )}
                  </span>

                  {/* Real-time Global Competition Arena Timer */}
                  <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 border transition-all ${isUnlocked
                      ? 'bg-purple-950/80 border-purple-500/60 text-cyan-300 shadow-[0_0_15px_rgba(139,53,255,0.4)]'
                      : competitionTimer > 0
                        ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-slate-900/80 border-slate-700 text-slate-400'
                    }`}>
                    <Clock className={`w-3.5 h-3.5 ${isUnlocked ? 'text-cyan-400 animate-pulse' : competitionTimer > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>TIMER: {formatCompetitionTimer(competitionTimer)}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : competitionTimer > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isUnlocked ? 'RUNNING' : competitionTimer > 0 ? 'FROZEN' : 'STANDBY'}
                    </span>
                  </span>

                  <span className="text-xs font-mono text-slate-400">10 Challenges Governed</span>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-wide">
                  ONE-CLICK GLOBAL CHALLENGE AUTHORITY
                </h2>

                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  {isUnlocked
                    ? 'All 10 challenges are currently UNLOCKED across every student dashboard simultaneously. Competition timer is live and ticking.'
                    : competitionTimer > 0
                      ? `All 10 challenges are FROZEN. Students cannot submit new solutions. Competition timer is paused at ${formatCompetitionTimer(competitionTimer)}.`
                      : 'All 10 challenges are PRIORLY LOCKED. Students cannot open or attempt any challenge until you click UNLOCK.'}
                </p>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  disabled={loadingAction || isUnlocked}
                  onClick={() => setLockModal({ open: true, action: 'unlock' })}
                  className={`px-6 py-4 rounded-2xl font-heading font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all ${isUnlocked
                      ? 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
                      : 'text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-[#087CFF] hover:brightness-125 shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95'
                    }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>UNLOCK ALL CHALLENGES</span>
                </button>

                <button
                  type="button"
                  disabled={loadingAction || !isUnlocked}
                  onClick={() => setLockModal({ open: true, action: 'lock' })}
                  className={`px-6 py-4 rounded-2xl font-heading font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all ${!isUnlocked
                      ? 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed opacity-60'
                      : 'text-white bg-gradient-to-r from-[#F52245] via-rose-600 to-purple-700 hover:brightness-125 shadow-[0_0_30px_rgba(245,34,69,0.5)] active:scale-95'
                    }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>LOCK (FREEZE TIME)</span>
                </button>

                <button
                  type="button"
                  disabled={loadingAction}
                  onClick={() => setResetTimerModalOpen(true)}
                  className="px-5 py-4 rounded-2xl font-heading font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 bg-[#10182B] hover:bg-slate-800/80 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 shadow-md transition-all active:scale-95"
                  title="Reset arena competition timer back to 00:00"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>RESET TIMER</span>
                </button>
              </div>

            </div>
          </div>

          {/* 4 Overview Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="glass-panel p-5 rounded-2xl border border-[#087CFF]/40 bg-[#0A0E22]/60">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Registered</p>
                <div className="w-8 h-8 rounded-xl bg-[#087CFF]/15 border border-[#087CFF]/40 flex items-center justify-center text-[#087CFF]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-heading font-black text-white mt-2">{overview.total_registered}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Cadets in database</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/40 bg-[#0A0E22]/60">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Currently Active</p>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <p className="text-3xl font-heading font-black text-emerald-400 mt-2">{overview.currently_active}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Live in Arena</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 bg-[#0A0E22]/60">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Students Started</p>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-heading font-black text-amber-400 mt-2">{overview.students_started}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Attempted &ge; 1 challenge</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-purple-500/40 bg-[#0A0E22]/60">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Completed All 10</p>
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-heading font-black text-purple-300 mt-2">{overview.students_completed_all}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">Finished competition</p>
            </div>

          </div>

          {/* Quick Nav Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { sounds.playWebShoot(); setActiveSection('problems'); }}
              className="p-5 rounded-2xl bg-[#101528] hover:bg-[#151D3B] border border-slate-800 hover:border-indigo-500/50 text-left transition-all group shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-all">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">Problems Manager &rarr;</h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">Inspect all 10 Python challenges, code, and test cases.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => { sounds.playWebShoot(); setActiveSection('participants'); }}
              className="p-5 rounded-2xl bg-[#101528] hover:bg-[#151D3B] border border-slate-800 hover:border-[#087CFF]/50 text-left transition-all group shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-[#087CFF]/40 flex items-center justify-center text-[#087CFF] group-hover:scale-105 transition-all">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">Participants Directory &rarr;</h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">Search, individual remove, and reset all competitors.</p>
                </div>
              </div>
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: PROBLEMS MANAGER (FileText icon in AdminSidebar)
          ========================================================================= */}
      {activeSection === 'problems' && (
        <div className="space-y-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Problem Nodes</span>
              </div>
              <h1 className="font-heading text-3xl font-black text-white tracking-wide">
                PROBLEMS MANAGER (10 CHALLENGES)
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                All 10 competition challenges. Priorly locked until Admin unlocks globally.
              </p>
            </div>

            {/* Problem Search Bar */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-indigo-400" />
              </div>
              <input
                type="text"
                value={searchProblem}
                onChange={(e) => setSearchProblem(e.target.value)}
                placeholder="Search by title, difficulty, category..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10182B] border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:border-indigo-400 outline-none"
              />
            </div>
          </div>

          {/* Problem Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChallenges.map((ch, idx) => {
              const chNumber = String(ch.id || idx + 1).padStart(2, '0');
              const isDiffHard = ch.difficulty === 'Hard';
              const isDiffInter = ch.difficulty === 'Intermediate';

              return (
                <div
                  key={ch.id || idx}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 bg-[#0B0F20]/70 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-sm text-[#087CFF] shrink-0">
                          {chNumber}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-white text-base">
                            {ch.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${isDiffHard
                                ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                                : isDiffInter
                                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                                  : 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                              }`}>
                              {ch.difficulty}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60">
                              {ch.category}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-[#00F0FF]">
                              {ch.points} PTS
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lock Status */}
                      <div>
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono text-[11px] font-bold">
                            <Unlock className="w-3 h-3 text-emerald-400" />
                            <span>UNLOCKED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 font-mono text-[11px] font-bold">
                            <Lock className="w-3 h-3 text-rose-400" />
                            <span>LOCKED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-mono text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {ch.story || ch.description}
                    </p>
                  </div>

                  {/* Actions: Inspect Details */}
                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      Function: <code className="text-slate-300">{ch.function_name || ch.functionName || 'solve'}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => setInspectedProblem(ch)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500/60 text-slate-300 hover:text-indigo-300 font-mono text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Code &amp; Tests</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: PARTICIPANTS (Users icon in AdminSidebar)
          ========================================================================= */}
      {activeSection === 'participants' && (
        <div className="space-y-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Roster Management</span>
              </div>
              <h1 className="font-heading text-3xl font-black text-white tracking-wide">
                PARTICIPANTS DIRECTORY
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Total registered participants: <strong className="text-white">{overview.total_registered}</strong>. Removing players terminates their session back to login.
              </p>
            </div>

            {/* Action Tools: Search & Reset All */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4 text-blue-400" />
                </div>
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Search name, reg no, or email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10182B] border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:border-blue-400 outline-none"
                />
              </div>

              {/* RESET ALL PLAYERS BUTTON */}
              <button
                type="button"
                disabled={loadingAction || overview.students.length === 0}
                onClick={() => setResetAllModal(true)}
                className="px-4 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-rose-950/70 hover:bg-rose-600 border border-rose-500/60 hover:border-rose-400 text-rose-200 hover:text-white transition-all shadow-[0_0_15px_rgba(245,34,69,0.25)] flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>RESET ALL PLAYERS</span>
              </button>

            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl bg-[#090D1C]/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080B18]/90 text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Player Cadet</th>
                    <th className="py-4 px-6">College Register No.</th>
                    <th className="py-4 px-6">College Email</th>
                    <th className="py-4 px-6">Registration Date</th>
                    <th className="py-4 px-6 text-center">Account Status</th>
                    <th className="py-4 px-6 text-center">Completion Time</th>
                    <th className="py-4 px-6 text-right">Points</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                        No registered players found matching &quot;{searchStudent}&quot;.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => {
                      const isFinished = student.completed_count >= 10;
                      const isStarted = student.completed_count > 0 || student.points > 0;

                      return (
                        <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-heading font-bold text-white text-sm block">
                              {student.name}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-slate-300 font-mono font-semibold">
                            {student.reg_number}
                          </td>

                          <td className="py-4 px-6 text-slate-400 font-mono">
                            {student.email}
                          </td>

                          <td className="py-4 px-6 text-slate-400 text-[11px]">
                            {student.registration_date || student.created_at || 'Registered'}
                          </td>

                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isFinished
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50'
                                : isStarted
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/50'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isFinished ? 'bg-emerald-400' : isStarted ? 'bg-amber-400' : 'bg-slate-500'
                                }`}></span>
                              <span>{student.account_status || (isFinished ? 'Completed (10/10)' : isStarted ? `In Arena (${student.completed_count}/10)` : 'Standby')}</span>
                            </span>
                          </td>

                          {/* Completion Time */}
                          <td className="py-4 px-6 text-center text-slate-300 font-mono">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                              isFinished
                                ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                                : 'bg-slate-800/60 border border-slate-700/60 text-slate-300'
                            }`}>
                              <Clock className={`w-3.5 h-3.5 ${isFinished ? 'text-emerald-400' : 'text-cyan-400 animate-pulse'}`} />
                              <span>
                                {isFinished
                                  ? (student.time_spent || formatCompetitionTimer(student.time_spent_seconds || 0))
                                  : formatCompetitionTimer(competitionTimer)}
                              </span>
                              {isFinished && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase">
                                  FINAL
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right font-bold text-white">
                            {student.points} pts
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => setRemovePlayerModal({ open: true, player: { id: student.id, name: student.name, reg_number: student.reg_number } })}
                              title={`Remove player ${student.name} from competition`}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white font-mono text-[10px] transition-all flex items-center gap-1.5 ml-auto active:scale-95"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 4: LIVE LEADERBOARD (Award icon in AdminSidebar)
          ========================================================================= */}
      {activeSection === 'leaderboard' && (
        <div className="space-y-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Standings</span>
              </div>
              <h1 className="font-heading text-3xl font-black text-white tracking-wide">
                LIVE REAL-TIME LEADERBOARD
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Contains registered students only. Ranked automatically by highest points, with completion time tie-breaker.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#10182B] border border-amber-500/30 text-amber-300 font-mono text-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Max Score: 1,800 PTS</span>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl bg-[#090D1C]/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080B18]/90 text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6 text-center w-20">Rank</th>
                    <th className="py-4 px-6">Student Cadet</th>
                    <th className="py-4 px-6">College Register No.</th>
                    <th className="py-4 px-6 text-center">Nodes Cleared</th>
                    <th className="py-4 px-6 text-center">Completion Time</th>
                    <th className="py-4 px-6 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono text-xs">
                        No participants currently on the leaderboard.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map(entry => {
                      const isTop1 = entry.rank === 1;
                      const isTop2 = entry.rank === 2;
                      const isTop3 = entry.rank === 3;

                      return (
                        <tr
                          key={entry.id}
                          className={`transition-colors ${isTop1
                              ? 'bg-amber-500/10 hover:bg-amber-500/15'
                              : isTop2
                                ? 'bg-slate-300/5 hover:bg-slate-300/10'
                                : isTop3
                                  ? 'bg-amber-700/10 hover:bg-amber-700/15'
                                  : 'hover:bg-slate-800/30'
                            }`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-6 text-center">
                            {isTop1 ? (
                              <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span>#1</span>
                              </div>
                            ) : isTop2 ? (
                              <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-slate-300/20 border border-slate-300/50 text-slate-200 font-bold">
                                <Medal className="w-3.5 h-3.5 text-slate-300" />
                                <span>#2</span>
                              </div>
                            ) : isTop3 ? (
                              <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl bg-amber-700/20 border border-amber-700/50 text-amber-200 font-bold">
                                <Medal className="w-3.5 h-3.5 text-amber-600" />
                                <span>#3</span>
                              </div>
                            ) : (
                              <span className="font-bold text-slate-400 text-sm">
                                #{entry.rank}
                              </span>
                            )}
                          </td>

                          {/* Student Name */}
                          <td className="py-4 px-6">
                            <span className="font-heading font-bold text-white text-sm block">
                              {entry.name}
                            </span>
                          </td>

                          {/* Register Number */}
                          <td className="py-4 px-6 text-slate-300 font-mono">
                            {entry.reg_number || entry.masked_reg}
                          </td>

                          {/* Challenges Completed */}
                          <td className="py-4 px-6 text-center">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-bold">
                              {entry.completed_count} / 10
                            </span>
                          </td>

                          {/* Completion Time */}
                          <td className="py-4 px-6 text-center text-slate-300 font-mono">
                            <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                              entry.is_finished || entry.completed_count >= 10
                                ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                                : 'bg-[#10182B] border border-cyan-500/30 text-cyan-300'
                            }`}>
                              <Clock className={`w-3.5 h-3.5 ${
                                entry.is_finished || entry.completed_count >= 10 ? 'text-emerald-400' : 'text-cyan-400 animate-pulse'
                              }`} />
                              <span>
                                {entry.is_finished || entry.completed_count >= 10
                                  ? entry.completion_time
                                  : formatCompetitionTimer(competitionTimer)}
                              </span>
                              {(entry.is_finished || entry.completed_count >= 10) && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase">
                                  FINAL
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Total Points */}
                          <td className="py-4 px-6 text-right">
                            <span className="font-heading font-black text-base text-[#00F0FF]">
                              {entry.points}{' '}
                              <span className="text-[10px] font-normal font-mono text-slate-400">
                                PTS
                              </span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          CONFIRMATION MODAL: GLOBAL UNLOCK / LOCK ALL
          ========================================================================= */}
      {lockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border-2 border-purple-500/60 shadow-[0_0_60px_rgba(139,53,255,0.4)] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${lockModal.action === 'unlock'
                  ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : 'bg-rose-950/80 border border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(245,34,69,0.5)]'
                }`}>
                {lockModal.action === 'unlock' ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold block">
                  CONFIRMATION REQUIRED
                </span>
                <h3 className="font-heading text-xl font-black text-white">
                  {lockModal.action === 'unlock' ? 'Unlock All 10 Challenges?' : 'Lock All 10 Challenges?'}
                </h3>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-6 leading-relaxed">
              {lockModal.action === 'unlock'
                ? 'This will immediately unlock all 10 Python debugging challenges simultaneously across all active registered student panels. Students will be able to attempt any challenge.'
                : 'This will freeze all 10 challenges simultaneously. No new challenge attempts will be permitted. All existing student scores, rankings, and completed progress will be strictly preserved.'}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setLockModal({ open: false, action: null })}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => lockModal.action && handleGlobalLockToggle(lockModal.action)}
                className={`px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-white transition-all shadow-lg active:scale-95 ${lockModal.action === 'unlock'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-gradient-to-r from-[#F52245] to-rose-700 hover:brightness-110 shadow-[0_0_20px_rgba(245,34,69,0.5)]'
                  }`}
              >
                {lockModal.action === 'unlock' ? 'CONFIRM UNLOCK ALL' : 'CONFIRM LOCK ALL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION MODAL: RESET TIMER TO 00:00
          ========================================================================= */}
      {resetTimerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border-2 border-amber-500/60 shadow-[0_0_60px_rgba(245,158,11,0.3)] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-950/80 border border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase font-bold block">
                  ARENA TIMER OVERRIDE
                </span>
                <h3 className="font-heading text-xl font-black text-white">
                  Reset Arena Timer to 00:00?
                </h3>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 leading-relaxed mb-6">
              This will immediately reset the global competition timer back to <strong>00:00</strong> across all 60 LAN student dashboards and admin monitors.
              <br /><br />
              <span className="text-emerald-400">✓ All student scores, badges, and code submissions are 100% preserved.</span>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setResetTimerModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono transition-all"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleResetCompetitionTimer}
                className="px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all active:scale-95"
              >
                CONFIRM RESET (00:00)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION MODAL: RESET ALL PLAYERS
          ========================================================================= */}
      {resetAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border-2 border-rose-500/80 shadow-[0_0_60px_rgba(245,34,69,0.4)] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,34,69,0.5)]">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-rose-400 tracking-widest uppercase font-bold block">
                  DESTRUCTIVE ACTION WARNING
                </span>
                <h3 className="font-heading text-xl font-black text-white">
                  Remove All Registered Players?
                </h3>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">ALL {overview.students.length} registered players</strong> from the arena?
              <br /><br />
              • All student accounts and submission histories will be permanently deleted.
              • All active player panels will be automatically terminated and redirected to the login page.
              • This action is immediate and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setResetAllModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResetAllPlayers}
                className="px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#F52245] via-rose-600 to-red-700 hover:brightness-110 shadow-[0_0_25px_rgba(245,34,69,0.5)] active:scale-95 transition-all"
              >
                CONFIRM REMOVE ALL PLAYERS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRMATION MODAL: INDIVIDUAL PLAYER REMOVAL
          ========================================================================= */}
      {removePlayerModal.open && removePlayerModal.player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-7 border-2 border-rose-500/70 shadow-[0_0_50px_rgba(245,34,69,0.4)] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,34,69,0.5)]">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-rose-400 tracking-widest uppercase font-bold block">
                  REMOVE PLAYER
                </span>
                <h3 className="font-heading text-lg font-black text-white">
                  Confirm Removal
                </h3>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-6 leading-relaxed">
              Remove player <strong className="text-white">&quot;{removePlayerModal.player.name}&quot;</strong> ({removePlayerModal.player.reg_number})?
              <br /><br />
              Their student account and progress will be deleted. If currently logged in, their panel will immediately close and return to the login screen.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemovePlayerModal({ open: false, player: null })}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemovePlayer}
                className="px-5 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#F52245] to-rose-700 hover:brightness-110 shadow-[0_0_20px_rgba(245,34,69,0.5)] active:scale-95 transition-all"
              >
                REMOVE PLAYER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INSPECTOR MODAL: PROBLEM DETAILS
          ========================================================================= */}
      {inspectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-7 border-2 border-indigo-500/60 shadow-[0_0_50px_rgba(99,102,241,0.35)] relative">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
                  Challenge #{inspectedProblem.id} • {inspectedProblem.category}
                </span>
                <h3 className="font-heading text-xl font-black text-white mt-1">
                  {inspectedProblem.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-500/40">
                    {inspectedProblem.difficulty}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00F0FF]">
                    {inspectedProblem.points} PTS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedProblem(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 font-mono text-xs">
              <div>
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Instructions &amp; Objective:
                </h4>
                <p className="text-slate-300 leading-relaxed bg-[#080B18] p-3 rounded-xl border border-slate-800">
                  {inspectedProblem.instructions || inspectedProblem.description}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Starter Buggy Code:
                </h4>
                <pre className="bg-[#080B18] p-3 rounded-xl border border-slate-800 text-rose-300 overflow-x-auto text-[11px]">
                  {inspectedProblem.starter_code || inspectedProblem.starterCode || '# No code'}
                </pre>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Test Cases ({inspectedProblem.test_cases?.length || inspectedProblem.testCases?.length || 0}):
                </h4>
                <div className="space-y-2">
                  {(inspectedProblem.test_cases || inspectedProblem.testCases || []).map((tc: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#080B18] border border-slate-800 flex items-center justify-between text-[11px]">
                      <span>Input: <code className="text-emerald-300">{tc.input}</code></span>
                      <span>Expected: <code className="text-[#00F0FF]">{tc.expected}</code></span>
                      {tc.hidden && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">HIDDEN</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedProblem(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
