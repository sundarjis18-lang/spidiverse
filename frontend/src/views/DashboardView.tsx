import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  ShieldCheck,
  Flame,
  Award,
  Lock,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Challenge, User } from '../types';
import { sounds } from '../utils/soundEffects';
import { QUEST_BADGES, QuestBadgeInfo } from '../utils/badges';

interface DashboardViewProps {
  user: User;
  challenges: Challenge[];
  globalUnlocked?: boolean;
  onSelectChallenge: (challengeId: number) => void;
  onOpenProgression: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  globalUnlocked = true,
  onOpenProgression
}) => {
  const [sessionSeconds, setSessionSeconds] = useState(user.time_spent_seconds || 480);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<QuestBadgeInfo | null>(null);

  // Live timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPoints = user?.points || 0;
  const completedCount = user?.completed_challenges?.length || 0;

  // Quest Badges Logic
  const completedIds = Array.isArray(user?.completed_challenges) ? user.completed_challenges : [];

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">

      {/* 4 Performance Metric Cards (Matching Middle Row of Reference Panel 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Points */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-amber-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Total Score</p>
            <p className="text-2xl font-heading font-black text-white mt-0.5">
              {totalPoints} <span className="text-xs font-mono font-normal text-slate-500">/ 1800</span>
            </p>
          </div>
        </div>

        {/* Checkpoints Restored */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-emerald-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Restored Nodes</p>
            <p className="text-2xl font-heading font-black text-emerald-400 mt-0.5">
              {completedCount} <span className="text-xs font-mono font-normal text-slate-500">/ 10</span>
            </p>
          </div>
        </div>

        {/* Active Combat Timer */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-purple-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Mission Timer</p>
            <p className="text-xl font-heading font-bold text-white mt-0.5 font-mono">
              {formatTimer(sessionSeconds)}
            </p>
          </div>
        </div>

        {/* Global Rank */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-[#087CFF]/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#087CFF]/10 border border-[#087CFF]/40 flex items-center justify-center text-[#087CFF] shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Multiverse Tier</p>
            <p className="text-2xl font-heading font-black text-[#00F0FF] mt-0.5">
              #4 <span className="text-xs font-mono font-normal text-slate-500">Cadet</span>
            </p>
          </div>
        </div>

      </div>

      {/* =========================================================================
          QUEST BADGES COLLECTION (10 Quest Badges Showcase Shelf)
          ========================================================================= */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-[#090D1F]/70 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/70 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>QUEST BADGES COLLECTION</span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {completedCount}/10 EARNED
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Every solved debugging mission awards a unique cyber hex badge equipped to your permanent profile.
              </p>
            </div>
          </div>
        </div>

        {/* 10 Badges Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 pt-2">
          {Object.values(QUEST_BADGES).map((badge) => {
            const isCompleted = completedIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                onClick={() => { sounds.playWebShoot(); setSelectedBadgeModal(badge); }}
                className={`p-2.5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-between cursor-pointer group text-center relative ${
                  isCompleted
                    ? 'bg-[#10182B] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:border-emerald-400 hover:scale-105'
                    : 'bg-[#080B18]/60 border-slate-800/80 hover:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                {/* Badge Image */}
                <div className="relative w-16 h-18 sm:w-18 sm:h-20 my-1 flex items-center justify-center">
                  <img
                    src={badge.image}
                    alt={badge.title}
                    className={`w-full h-full object-contain filter ${
                      isCompleted ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'grayscale contrast-75'
                    }`}
                  />
                  {!isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-slate-400 bg-black/60 rounded-full p-0.5" />
                    </div>
                  )}
                </div>

                {/* Badge Number & Status */}
                <div className="w-full mt-1">
                  <span className="text-[10px] font-mono font-bold block text-white truncate">
                    #{String(badge.id).padStart(2, '0')}
                  </span>
                  <span className={`text-[9px] font-mono font-bold block truncate mt-0.5 ${
                    isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {isCompleted ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access to Web Matrix */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-[#087CFF]/30 bg-gradient-to-r from-[#10182B] via-[#0e1628] to-[#080B18] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-[#00F0FF] shrink-0 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>WEB MATRIX ARENA ACCESS</span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                globalUnlocked 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {globalUnlocked ? 'ARENA READY' : 'FROZEN BY OVERSEER'}
              </span>
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1 max-w-xl leading-relaxed">
              {globalUnlocked 
                ? 'All 10 dimensional coding nodes are accessible on the Web Matrix navigation grid. Select any checkpoint to solve Python debugging quests.'
                : 'The competition arena is currently locked by the Overseer. Checkpoint nodes will unlock simultaneously when the competition begins.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => { sounds.playWebShoot(); onOpenProgression(); }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-[#087CFF] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(139,53,255,0.4)] flex items-center justify-center gap-2 shrink-0"
        >
          <Compass className="w-4 h-4 text-[#00F0FF]" />
          <span>OPEN WEB MATRIX MAP</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Full Badge Preview Inspector Modal */}
      {selectedBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-sm w-full rounded-3xl p-6 sm:p-7 border-2 border-indigo-500/60 shadow-[0_0_60px_rgba(99,102,241,0.4)] relative text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative w-48 h-52 mx-auto my-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F52245] via-[#8B35FF] to-[#00F0FF] blur-xl opacity-50 animate-pulse"></div>
              <img
                src={selectedBadgeModal.image}
                alt={selectedBadgeModal.title}
                className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] relative z-10 rounded-2xl"
              />
            </div>

            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">
              QUEST #{selectedBadgeModal.id} • {selectedBadgeModal.difficulty}
            </span>
            <h3 className="font-heading text-xl font-black text-white mt-1">
              {selectedBadgeModal.title}
            </h3>
            <p className="text-xs font-mono text-slate-300 mt-2 leading-relaxed">
              {selectedBadgeModal.description}
            </p>

            <div className="mt-3 inline-block px-3 py-1 rounded-xl bg-[#087CFF]/15 border border-[#087CFF]/40 text-[#00F0FF] font-mono text-xs font-bold">
              +{selectedBadgeModal.points} ARENA POINTS
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition-all"
              >
                Close Badge Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
