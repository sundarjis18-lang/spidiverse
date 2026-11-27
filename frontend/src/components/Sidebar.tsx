import React from 'react';
import {
  LayoutDashboard,
  Terminal,
  Layers,
  Trophy,
  Award,
  User as UserIcon,
  Flame,
  Zap,
  Shield,
  LogOut,
  Compass
} from 'lucide-react';
import { User } from '../types';
import { SPIDER_AVATARS } from '../utils/mockData';
import { sounds } from '../utils/soundEffects';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  certificatesOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  certificatesOpen = false
}) => {
  const avatarInfo = (user && user.avatar && SPIDER_AVATARS[user.avatar]) || SPIDER_AVATARS.classic;
  const completedCount = user?.completed_challenges?.length || 0;
  const levelNumber = Math.max(1, completedCount + 2);
  const xpPercent = Math.min(100, Math.round(((user?.points || 0) / 1800) * 100));

  const isViewingAdmin = activeTab === 'admin' || user?.role === 'admin';

  // Remove Dashboard, Web Matrix, and Coding Arena when in admin panel
  const navItems = isViewingAdmin
    ? [
      { id: 'leaderboard', label: 'Rankings', icon: Trophy },
      { id: 'profile', label: 'Profile', icon: UserIcon }
    ]
    : [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'progression', label: 'Web Matrix', icon: Compass },
      { id: 'leaderboard', label: 'Rankings', icon: Trophy },
      ...(certificatesOpen ? [{ id: 'certificates', label: 'Certificates', icon: Award }] : []),
      { id: 'profile', label: 'Profile', icon: UserIcon }
    ];

  return (
    <aside className="w-64 bg-[#080B18]/95 border-r border-[#087CFF]/20 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 backdrop-blur-2xl">

      {/* Top Brand Logo */}
      <div>
        <div
          onClick={() => { sounds.playWebShoot(); setActiveTab('dashboard'); }}
          className="p-4 sm:p-5 flex items-center gap-3 cursor-pointer group border-b border-slate-800/80 hover:bg-slate-900/40 transition-colors"
        >
          <div className="relative w-11 h-11 rounded-2xl p-1 bg-gradient-to-br from-[#087CFF] via-[#00F0FF] to-[#8B35FF] shadow-[0_0_20px_rgba(8,124,255,0.4)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-black rounded-xl p-0.5 flex items-center justify-center overflow-hidden">
              <img src="/pyrank_icon.png" alt="PyRank Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <span className="font-heading font-black text-lg tracking-wider bg-gradient-to-r from-white via-[#00F0FF] to-[#087CFF] bg-clip-text text-transparent block leading-tight">
              PYRANK
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SPIDER-CODE
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playWebShoot();
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-mono text-xs font-semibold tracking-wider transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-[#8B35FF]/30 to-[#087CFF]/30 text-white border border-[#8B35FF]/60 shadow-[0_0_20px_rgba(139,53,255,0.35)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Level & XP Progress Card (Matching Panel 2) */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        {!isViewingAdmin && (
          <div className="p-3.5 rounded-2xl bg-[#10182B]/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                LEVEL {levelNumber} CADET
              </span>
              <span className="text-[10px] font-mono text-[#00F0FF] font-bold">
                {xpPercent}% XP
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F52245] via-[#8B35FF] to-[#087CFF] transition-all duration-700"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2">
              {user.points} / 1800 Arena PTS
            </p>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 rounded-xl text-xs font-mono text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/40 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect Session</span>
        </button>
      </div>

    </aside>
  );
};

