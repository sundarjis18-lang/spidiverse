import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Medal, 
  ShieldCheck, 
  Share2, 
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { User, Challenge } from '../types';
import { sounds } from '../utils/soundEffects';

interface VictoryViewProps {
  user: User;
  challenges: Challenge[];
  onReturnToDashboard: () => void;
}

export const VictoryView: React.FC<VictoryViewProps> = ({
  user,
  challenges,
  onReturnToDashboard
}) => {
  // Cinematic confetti storm on load
  useEffect(() => {
    sounds.playVictory();
    
    // Multi-stage confetti
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F52245', '#087CFF', '#8B35FF', '#00F0FF', '#FFD700']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F52245', '#087CFF', '#8B35FF', '#00F0FF', '#FFD700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Background Cinematic Spider Emblem */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <img 
          src="/spider_emblem.jpg" 
          alt="Cinematic Spider" 
          className="w-[800px] h-[800px] object-cover rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        
        {/* Victory Emblem Badge */}
        <div className="inline-block relative group animate-bounce">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-2 bg-gradient-to-br from-[#F52245] via-amber-400 to-[#087CFF] shadow-[0_0_60px_rgba(245,34,69,0.8)] border-2 border-white mx-auto">
            <img 
              src="/spider_emblem.jpg" 
              alt="Spider Emblem" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#080B18] border-2 border-amber-400 text-amber-400 font-heading font-black text-xs uppercase tracking-widest shadow-lg whitespace-nowrap">
            MULTIVERSE SAVED
          </div>
        </div>

        {/* Headings */}
        <div>
          <h1 className="font-heading text-4xl sm:text-6xl font-black text-white tracking-wide">
            THE SPIDER-VERSE IS SAVED!
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-slate-300 font-mono max-w-2xl mx-auto">
            You have successfully restored all 10 corrupted systems and defeated Kingpin's Symbiote Virus.
          </p>
        </div>

        {/* 4 Victory Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 text-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Score</span>
            <p className="font-heading font-black text-3xl text-amber-400 mt-1">
              1,800 <span className="text-xs font-mono font-normal text-slate-400">/ 1800</span>
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/40 text-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Checkpoints</span>
            <p className="font-heading font-black text-3xl text-emerald-400 mt-1">
              10 / 10
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#087CFF]/40 text-center shadow-[0_0_20px_rgba(8,124,255,0.2)]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Arena Rank</span>
            <p className="font-heading font-black text-3xl text-[#00F0FF] mt-1">
              #1
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-purple-500/40 text-center shadow-[0_0_20px_rgba(139,53,255,0.2)]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Status</span>
            <p className="font-heading font-black text-2xl text-purple-300 mt-1">
              GRANDMASTER
            </p>
          </div>
        </div>

        {/* 10 Checkpoints Complete Checklist Strip */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 max-w-3xl mx-auto">
          <p className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-3 text-left">
            10 Restored Systems Telemetry:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono text-left">
            {challenges.map(ch => (
              <div key={ch.id} className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">Node #{ch.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: Return to Mission Control */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => { sounds.playWebShoot(); onReturnToDashboard(); }}
            className="px-8 py-4 rounded-2xl font-heading font-bold text-sm tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-[#087CFF] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(139,53,255,0.4)] flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Return to Mission Control</span>
          </button>
        </div>

      </div>

    </div>
  );
};

