import React from 'react';
import {
  Clock,
  FileText,
  Users,
  Trophy,
  Award,
  LogOut,
  Shield
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export type AdminSection = 'controls' | 'problems' | 'participants' | 'leaderboard' | 'certificates';

interface AdminSidebarProps {
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
  onSignOut: () => void;
  adminName?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  setActiveSection,
  onSignOut,
  adminName = 'admin'
}) => {
  const menuItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
    { id: 'controls', label: 'Contest Controls', icon: Clock },
    { id: 'problems', label: 'Problems Manager', icon: FileText },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
    { id: 'certificates', label: 'Certificates', icon: Award }
  ];

  return (
    <aside className="w-64 bg-[#080B18] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none">
      
      {/* Top Header & Navigation Items */}
      <div className="flex flex-col">
        {/* Brand / Title Banner */}
        <div className="p-4 sm:p-5 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black border border-[#087CFF]/50 flex items-center justify-center shadow-[0_0_15px_rgba(8,124,255,0.4)] p-0.5 shrink-0">
            <img src="/pyrank_icon.png" alt="PyRank" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-heading font-black text-sm tracking-wider bg-gradient-to-r from-white via-[#00F0FF] to-[#087CFF] bg-clip-text text-transparent block leading-tight">
              PYRANK
            </span>
            <span className="text-[10px] font-mono text-purple-400 font-bold tracking-widest uppercase block mt-0.5">
              SPIDER-CODE ADMIN
            </span>
          </div>
        </div>

        {/* Menu Navigation (Exact match to screenshot) */}
        <nav className="p-4 space-y-2 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sounds.playWebShoot();
                  setActiveSection(item.id);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#141A33] border border-indigo-500/40 text-[#7C9BFF] shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#7C9BFF]' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Sign Out (Exact match to screenshot) */}
      <div className="p-4 border-t border-slate-800/80 space-y-3.5">
        
        {/* Profile Row: [A] admin ORCHESTRATOR */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-[#182038] border border-slate-700/80 flex items-center justify-center font-bold text-slate-200 text-sm shadow-sm shrink-0">
            A
          </div>
          <div className="truncate">
            <span className="font-bold text-white text-sm block leading-tight truncate">
              {adminName}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              ORCHESTRATOR
            </span>
          </div>
        </div>

        {/* Sign Out Pill Button (Exact match to screenshot) */}
        <button
          type="button"
          onClick={onSignOut}
          className="w-full py-2.5 px-4 rounded-xl bg-[#101528] hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

      </div>

    </aside>
  );
};
