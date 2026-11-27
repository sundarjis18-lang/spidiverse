import React from 'react';
import {
  Search,
  Bell,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';
import { User } from '../types';
import { SPIDER_AVATARS } from '../utils/mockData';
import { sounds } from '../utils/soundEffects';
import { formatCompetitionTimer } from '../utils/timer';

interface TopHeaderProps {
  user: User;
  onOpenProfile: () => void;
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;
  competitionTimer?: number;
  globalUnlocked?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  onOpenProfile,
  soundMuted,
  setSoundMuted,
  competitionTimer = 0,
  globalUnlocked = true
}) => {
  const avatarInfo = (user && user.avatar && SPIDER_AVATARS[user.avatar]) || SPIDER_AVATARS.classic;
  const isFinished = Array.isArray(user?.completed_challenges) && user.completed_challenges.length >= 10;
  const displayTimer = isFinished ? (user.time_spent_seconds || competitionTimer) : competitionTimer;

  const handleSoundToggle = () => {
    const isMuted = sounds.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) sounds.playWebShoot();
  };

  return (
    <header className="h-16 px-6 bg-[#080B18]/80 border-b border-[#087CFF]/15 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">

      {/* Search Input Bar (Matching Panel 2) */}
      <div className="relative w-full max-w-md hidden sm:block">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-[#087CFF]" />
        </div>
        <input
          type="text"
          placeholder="Search missions, algorithms, subroutines..."
          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#10182B]/90 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:border-[#087CFF] focus:ring-1 focus:ring-[#087CFF] outline-none transition-all"
        />
      </div>

      {/* Right Controls: Points, Timer, Audio, Notifications, Profile */}
      <div className="flex items-center gap-3.5 ml-auto">

        {/* Global Competition Timer Pill */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono text-xs font-bold transition-all ${
          isFinished
            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : globalUnlocked
              ? 'bg-[#10182B] border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
              : competitionTimer > 0
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-[#10182B] border-slate-800 text-slate-500'
          }`}>
          <Clock className={`w-3.5 h-3.5 ${
            isFinished ? 'text-emerald-400' : globalUnlocked ? 'text-[#00F0FF] animate-pulse' : competitionTimer > 0 ? 'text-amber-400' : 'text-slate-600'
          }`} />
          <span>{formatCompetitionTimer(displayTimer)}</span>
          {isFinished ? (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold uppercase">
              FINAL
            </span>
          ) : !globalUnlocked ? (
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
              competitionTimer > 0 ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
            }`}>
              {competitionTimer > 0 ? 'FROZEN' : 'LOCKED'}
            </span>
          ) : null}
        </div>

        {/* Points Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#10182B] border border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
          <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-heading font-extrabold text-xs text-white">
            {user.points} <span className="text-[10px] text-amber-400 font-mono">PTS</span>
          </span>
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={handleSoundToggle}
          title={soundMuted ? "Unmute Audio FX" : "Mute Audio FX"}
          className="p-2.5 rounded-2xl bg-[#10182B] border border-slate-800 hover:border-[#087CFF] text-slate-400 hover:text-white transition-all"
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#00F0FF]" />}
        </button>

        {/* Profile Avatar & Badge */}
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-3 pl-2 py-1 pr-3 rounded-2xl bg-[#10182B] border border-slate-800 hover:border-[#087CFF] cursor-pointer transition-all"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md"
            style={{ backgroundColor: `${avatarInfo.color}33`, color: avatarInfo.color, border: `1.5px solid ${avatarInfo.color}` }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold leading-tight text-white truncate max-w-[120px]">
              {user.name}
            </p>
            <p className="text-[10px] font-mono text-cyan-400 leading-none">
              {avatarInfo.badge}
            </p>
          </div>
        </div>

      </div>

    </header>
  );
};

