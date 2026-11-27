import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  Crown,
  Activity,
  Cpu,
  Radio
} from 'lucide-react';
import { LeaderboardEntry, User } from '../types';
import { api } from '../utils/api';
import { sounds } from '../utils/soundEffects';

interface LeaderboardViewProps {
  user: User;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch { }
    setLoading(false);
  };

  const filtered = leaderboard.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.masked_reg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = user?.completed_challenges?.length || 0;
  const myRankEntry = leaderboard.find(e => e.id === user.id) || {
    rank: 4,
    id: user.id,
    name: user.name,
    masked_reg: (user.reg_number || '').slice(0, 4) + '••••' + (user.reg_number || '').slice(-4),
    avatar: user.avatar,
    points: user.points,
    completed_count: completedCount,
    completion_time: `${Math.floor((user.time_spent_seconds || 0) / 60)}m ${(user.time_spent_seconds || 0) % 60}s`,
    time_seconds: user.time_spent_seconds || 0
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">

      {/* Holographic Header Frame (Matching Panel 4 of Reference) */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#10182B] via-[#0b1426] to-[#10182B] border-2 border-[#00F0FF]/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] text-center overflow-hidden">

        {/* Neon HUD Corner Brackets */}
        <div className="absolute top-3 left-4 text-[#00F0FF] font-mono text-xs flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#00F0FF] animate-pulse" />
          <span>ARENA TELEMETRY // 2077</span>
        </div>
        <div className="absolute top-3 right-4 px-2.5 py-0.5 rounded-full bg-purple-900/40 border border-purple-500/60 text-purple-300 font-mono text-[10px] font-bold">
          MULTIVERSE E-SPORTS PROTOCOL
        </div>

        <div className="py-4">
          <span className="text-xs font-mono font-bold tracking-widest text-[#00F0FF] uppercase block mb-1">
            GLOBAL ESPORTS SEASON 1 RANKINGS
          </span>
          <h1 className="font-heading text-4xl sm:text-6xl font-black text-white tracking-widest uppercase">
            LEADERBOARD
          </h1>
          <p className="mt-2 text-slate-300 font-mono text-xs sm:text-sm max-w-xl mx-auto">
            Live rankings calculated by total quantum points and nodes restored.
          </p>
        </div>

        {/* Ambient Holographic Waves */}
        <div className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-[#00F0FF]/10 to-transparent pointer-events-none"></div>
      </div>

      {/* "My Standing" Live HUD Strip */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-[#00F0FF]/40 bg-gradient-to-r from-[#087CFF]/15 via-[#8B35FF]/15 to-[#F52245]/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(8,124,255,0.2)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00F0FF]/20 border-2 border-[#00F0FF] flex items-center justify-center font-heading font-black text-2xl text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.5)]">
            #{myRankEntry.rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00F0FF]">
                Active Agent Cadet
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <h3 className="font-heading text-xl font-bold text-white">
              {user.name} <span className="text-slate-400 font-mono text-sm font-normal">({myRankEntry.masked_reg})</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Score</span>
            <p className="font-heading font-black text-2xl text-amber-400">{user.points} pts</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Nodes Fixed</span>
            <p className="font-heading font-black text-2xl text-emerald-400">{completedCount}/10</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search competitor by name or reg..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#10182B] border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:border-[#00F0FF] outline-none"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-white">{filtered.length}</strong> Agents
        </div>
      </div>

      {/* Massive Holographic Leaderboard Console (Matching Panel 4 Layout) */}
      <div className="rounded-3xl border-2 border-[#00F0FF]/30 bg-[#080B18]/90 overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#00F0FF]/20 bg-[#10182B]/90 text-[11px] text-[#00F0FF] uppercase tracking-wider font-heading">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Player Name</th>
                <th className="py-4 px-6">Register Number</th>
                <th className="py-4 px-6 text-center">Nodes Cleared</th>
                <th className="py-4 px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map(entry => {
                const isMe = entry.id === user.id;
                const is1 = entry.rank === 1;
                const is2 = entry.rank === 2;
                const is3 = entry.rank === 3;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-all ${isMe
                        ? 'bg-[#00F0FF]/15 border-l-4 border-l-[#00F0FF] text-white font-bold'
                        : is1
                          ? 'bg-amber-500/10 hover:bg-amber-500/15 text-slate-200'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {is1 ? (
                          <div className="w-7 h-7 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(251,191,36,0.8)]">
                            #1
                          </div>
                        ) : is2 ? (
                          <div className="w-7 h-7 rounded-xl bg-slate-300 text-black flex items-center justify-center font-black shadow-[0_0_12px_rgba(203,213,225,0.6)]">
                            #2
                          </div>
                        ) : is3 ? (
                          <div className="w-7 h-7 rounded-xl bg-amber-700 text-white flex items-center justify-center font-black shadow-[0_0_12px_rgba(180,83,9,0.6)]">
                            #3
                          </div>
                        ) : (
                          <span className="font-heading font-black text-slate-400 text-sm ml-1">
                            #{entry.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${is1 ? 'bg-amber-500/20 text-amber-300 border border-amber-400' : 'bg-slate-800 text-white'
                          }`}>
                          {entry.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-white text-sm">
                            {entry.name}
                          </p>
                          {isMe && <span className="text-[10px] text-[#00F0FF] uppercase">YOUR RANK</span>}
                        </div>
                      </div>
                    </td>

                    {/* Masked Reg */}
                    <td className="py-4 px-6 text-slate-400">
                      {entry.masked_reg}
                    </td>

                    {/* Nodes Cleared */}
                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        {entry.completed_count} / 10
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-6 text-right font-heading font-black text-amber-400 text-sm sm:text-base">
                      {entry.points} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
