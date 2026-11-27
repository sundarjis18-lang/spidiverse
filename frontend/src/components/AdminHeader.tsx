import React from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  RefreshCw,
  Lock,
  Unlock,
  Radio,
  Clock
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { formatCompetitionTimer } from '../utils/timer';

interface AdminHeaderProps {
  activeSectionTitle: string;
  isUnlocked: boolean;
  competitionTimer?: number;
  onRefresh: () => void;
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;
  onTogglePreviewPlayer?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeSectionTitle,
  isUnlocked,
  competitionTimer = 0,
  onRefresh,
  soundMuted,
  setSoundMuted,
  onTogglePreviewPlayer
}) => {
  const handleSoundToggle = () => {
    const isMuted = sounds.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) sounds.playWebShoot();
  };

  return (
    <header className="h-16 px-6 bg-[#080B18]/90 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
      
      {/* Left: Overseer Title & Section Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] font-mono font-bold tracking-wider uppercase">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>ORCHESTRATOR</span>
          <span className="text-slate-500">/</span>
          <span className="text-white">{activeSectionTitle}</span>
        </div>
      </div>

      {/* Right: Global Lock Status, Live Sync, Audio, Refresh */}
      <div className="flex items-center gap-3">
        
        {/* Global Arena Lock Status Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
          isUnlocked
            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(245,34,69,0.3)]'
        }`}>
          {isUnlocked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>ARENA: UNLOCKED</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>ARENA: LOCKED</span>
            </>
          )}
        </div>

        {/* Live Contest Timer Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
          isUnlocked
            ? 'bg-purple-950/70 border-purple-500/50 text-cyan-300 shadow-[0_0_12px_rgba(139,53,255,0.3)]'
            : 'bg-slate-900/80 border-slate-700 text-slate-400'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isUnlocked ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <span>{formatCompetitionTimer(isUnlocked ? competitionTimer : 0)}</span>
        </div>

        {/* Live Sync Pulse */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#101528] border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>LIVE TELEMETRY</span>
        </div>

        {/* Refresh Telemetry */}
        <button
          type="button"
          onClick={() => { sounds.playWebShoot(); onRefresh(); }}
          title="Refresh telemetry"
          className="p-2 rounded-xl bg-[#101528] border border-slate-800 hover:border-purple-500 text-slate-400 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={handleSoundToggle}
          title={soundMuted ? "Unmute Audio FX" : "Mute Audio FX"}
          className="p-2 rounded-xl bg-[#101528] border border-slate-800 hover:border-purple-500 text-slate-400 hover:text-white transition-all shadow-sm active:scale-95"
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#7C9BFF]" />}
        </button>

        {/* Optional Toggle Preview Player Mode */}
        {onTogglePreviewPlayer && (
          <button
            type="button"
            onClick={onTogglePreviewPlayer}
            title="Preview Player Arena View"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
          >
            <span>Player Mode &rarr;</span>
          </button>
        )}

      </div>

    </header>
  );
};
