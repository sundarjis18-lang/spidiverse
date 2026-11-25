import React from 'react';
import { 
  Lock, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Flame, 
  Zap, 
  Sparkles, 
  Skull, 
  ShieldAlert, 
  Layers
} from 'lucide-react';
import { Challenge, User } from '../types';
import { sounds } from '../utils/soundEffects';

interface ProgressionViewProps {
  user: User;
  challenges: Challenge[];
  onSelectChallenge: (challengeId: number) => void;
}

export const ProgressionView: React.FC<ProgressionViewProps> = ({
  user,
  challenges,
  onSelectChallenge
}) => {
  const completedCount = user?.completed_challenges?.length || 0;
  const completedIds = user?.completed_challenges || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#087CFF]/20 border border-[#087CFF]/40 text-[#00F0FF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Layers className="w-3.5 h-3.5" />
          Quantum Dimensional Map
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-black text-white tracking-wide">
          SPIDER-WEB <span className="bg-gradient-to-r from-[#F52245] via-[#8B35FF] to-[#087CFF] bg-clip-text text-transparent">PROGRESSION MATRIX</span>
        </h1>
        <p className="mt-3 text-slate-300 font-mono text-sm">
          Sequential neural checkpoints connecting Earth-616 across the multiverse grid. Complete each node to unlock the next corrupted system.
        </p>
      </div>

      {/* Progress Summary Card */}
      <div className="glass-panel p-6 rounded-3xl border border-[#087CFF]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_35px_rgba(8,124,255,0.15)]">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F52245] to-[#8B35FF] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(245,34,69,0.5)]">
            <img 
              src="/spider_emblem.jpg" 
              alt="Spider Emblem" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              Agent Neural Link: {completedCount}/10 Restored
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              {completedCount === 10 
                ? 'All multiverse anchors stabilized! Spider-Verse is fully secure.' 
                : `Next objective: Checkpoint #${String(completedCount + 1).padStart(2, '0')}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex-1 md:w-64">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Restoration Progress</span>
              <span className="text-[#00F0FF] font-bold">{completedCount * 10}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#F52245] via-[#8B35FF] to-[#087CFF] transition-all duration-700"
                style={{ width: `${completedCount * 10}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Node Web Pathway (Vertical Timeline / Metro Layout with Spider Web Graphics) */}
      <div className="relative py-8">
        
        {/* Central glowing energy cable connecting nodes */}
        <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-[#10B981] via-[#F59E0B] to-[#F52245] shadow-[0_0_15px_rgba(245,34,69,0.5)] z-0 rounded-full"></div>

        {/* Challenge Nodes */}
        <div className="space-y-8 relative z-10">
          {challenges.map((ch, idx) => {
            const isBoss = ch.id === 10;
            const isCompleted = ch.is_completed || completedIds.includes(ch.id);
            const isPlayable = ch.is_unlocked && !isCompleted;
            const isLocked = !isPlayable;
            const isLeft = idx % 2 === 0;

            const tierAccent = ch.difficulty === 'Beginner'
              ? { text: 'text-emerald-400', border: 'border-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]', bg: 'bg-emerald-950/30' }
              : ch.difficulty === 'Intermediate'
              ? { text: 'text-amber-400', border: 'border-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]', bg: 'bg-amber-950/30' }
              : { text: 'text-rose-400', border: 'border-rose-500', glow: 'shadow-[0_0_20px_rgba(245,34,69,0.5)]', bg: 'bg-rose-950/30' };

            return (
              <div 
                key={ch.id}
                className={`flex flex-col sm:flex-row items-center gap-6 sm:gap-12 ${
                  isLeft ? 'sm:flex-row-reverse' : ''
                }`}
              >
                {/* Content Card (Left or Right depending on isLeft) */}
                <div className={`w-full sm:w-1/2 pl-14 sm:pl-0 ${isLeft ? 'sm:text-right' : 'sm:text-left'}`}>
                  <div 
                    onClick={() => {
                      if (isCompleted) {
                        sounds.playError();
                        alert(`QUEST #${ch.id} LOCKED: You have already completed this quest and earned its badge! Re-attempting completed quests is restricted.`);
                        return;
                      }
                      if (isPlayable) {
                        sounds.playWebShoot();
                        onSelectChallenge(ch.id);
                      }
                    }}
                    className={`p-5 rounded-2xl glass-panel border transition-all duration-300 ${
                      isCompleted
                        ? 'border-emerald-500/40 bg-emerald-950/20 opacity-80 cursor-not-allowed'
                        : isBoss 
                        ? 'border-[#F52245] animate-boss-aura bg-rose-950/20 cursor-pointer' 
                        : isPlayable
                        ? 'border-[#087CFF]/50 hover:border-[#087CFF] hover:shadow-[0_0_20px_rgba(8,124,255,0.3)] cursor-pointer'
                        : 'border-slate-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'sm:justify-end' : 'sm:justify-start'}`}>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/50 bg-emerald-950/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>QUEST LOCKED • BADGE RECEIVED</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${tierAccent.text} border ${tierAccent.border}/40 bg-black/40`}>
                          {ch.difficulty} (Checkpoint #{String(ch.id).padStart(2, '0')})
                        </span>
                      )}
                      {isBoss && !isCompleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600 font-heading font-black text-white animate-pulse">
                          BOSS
                        </span>
                      )}
                    </div>

                    <h4 className="font-heading text-lg font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                      {ch.title}
                    </h4>

                    <p className="mt-1 text-xs text-slate-300 font-mono line-clamp-2">
                      {ch.description}
                    </p>

                    <div className={`mt-3 flex items-center gap-3 text-xs font-mono ${isLeft ? 'sm:justify-end' : 'sm:justify-start'}`}>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        +{ch.points} pts
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{ch.category}</span>
                      {isCompleted && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-emerald-400 font-bold">SECTOR SEALED</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center Node Indicator */}
                <div 
                  onClick={() => {
                    if (isCompleted) {
                      sounds.playError();
                      alert(`QUEST #${ch.id} LOCKED: You have already completed this quest and earned its badge! Re-attempting completed quests is restricted.`);
                      return;
                    }
                    if (isPlayable) {
                      sounds.playWebShoot();
                      onSelectChallenge(ch.id);
                    }
                  }}
                  className={`absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center font-heading font-black text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border-2 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-not-allowed'
                      : isBoss
                      ? 'w-14 h-14 bg-gradient-to-br from-[#F52245] to-purple-900 border-2 border-white text-white shadow-[0_0_30px_rgba(245,34,69,0.9)] animate-bounce cursor-pointer'
                      : isPlayable
                      ? 'bg-[#087CFF] text-white border-2 border-cyan-300 shadow-[0_0_20px_rgba(8,124,255,0.7)] animate-pulse cursor-pointer'
                      : 'bg-slate-900 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <div className="flex flex-col items-center">
                      <Lock className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-slate-600" />
                  ) : isBoss ? (
                    <Skull className="w-7 h-7 text-white" />
                  ) : (
                    <span>{ch.id}</span>
                  )}
                </div>

                {/* Empty opposite side spacer for desktop layout balance */}
                <div className="hidden sm:block sm:w-1/2"></div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
