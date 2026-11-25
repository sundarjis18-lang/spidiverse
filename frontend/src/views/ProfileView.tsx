import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Award, 
  Zap, 
  Cpu, 
  Crown, 
  Lock,
  Code,
  Calendar,
  Sparkles
} from 'lucide-react';
import { StudentProfileData, User } from '../types';
import { api } from '../utils/api';
import { SPIDER_AVATARS } from '../utils/mockData';
import { sounds } from '../utils/soundEffects';

interface ProfileViewProps {
  user: User;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user.id, user.points]);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile(user.id);
      setProfile(data);
    } catch {}
  };

  const avatarInfo = SPIDER_AVATARS[user.avatar] || SPIDER_AVATARS.classic;

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-[#087CFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const completedCount = user?.completed_challenges?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Profile Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#087CFF]/30 relative overflow-hidden shadow-[0_0_40px_rgba(8,124,255,0.15)]">
        
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F52245]/15 to-[#8B35FF]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
          
          {/* Avatar Icon */}
          <div className="relative group cursor-pointer" onClick={() => sounds.playWebShoot()}>
            <div 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1.5 flex items-center justify-center text-4xl font-heading font-black shadow-2xl transition-transform group-hover:scale-105"
              style={{ 
                backgroundColor: `${avatarInfo.color}22`, 
                border: `2px solid ${avatarInfo.color}`,
                boxShadow: `0 0 25px ${avatarInfo.color}55`
              }}
            >
              <span style={{ color: avatarInfo.color }}>
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#080B18] border border-slate-700 text-[10px] font-mono text-white font-bold whitespace-nowrap">
              {avatarInfo.badge}
            </div>
          </div>

          {/* Student Info */}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#F52245]/20 text-[#F52245] border border-[#F52245]/40 uppercase tracking-wider">
                Spider-Verse Cadet
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {avatarInfo.label}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-black text-white">
              {user.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-slate-400">
              <span>Reg: <strong className="text-slate-200">{profile.user.masked_reg}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-slate-200">{user.email}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Deployed Session
              </span>
            </div>
          </div>

          {/* Overall Score Badge */}
          <div className="p-4 rounded-2xl bg-[#080B18]/80 border border-amber-500/40 text-center min-w-[140px] shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            <p className="text-[10px] font-mono uppercase text-slate-400">Total Score</p>
            <p className="font-heading font-black text-3xl text-amber-400 mt-0.5">
              {user.points}
            </p>
            <p className="text-[10px] font-mono text-slate-500">out of 1800 pts</p>
          </div>

        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30">
          <p className="text-xs font-mono text-slate-400 uppercase">Missions Cleared</p>
          <p className="text-2xl font-heading font-extrabold text-emerald-400 mt-1">
            {completedCount} <span className="text-xs font-normal text-slate-500 font-mono">/ 10</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#087CFF]/30">
          <p className="text-xs font-mono text-slate-400 uppercase">Multiverse Rank</p>
          <p className="text-2xl font-heading font-extrabold text-[#00F0FF] mt-1">
            #{profile.user.rank} <span className="text-xs font-normal text-slate-500 font-mono">Tier</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30">
          <p className="text-xs font-mono text-slate-400 uppercase">Mission Time Spent</p>
          <p className="text-2xl font-heading font-extrabold text-white mt-1 font-mono">
            {profile.user.time_spent}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30">
          <p className="text-xs font-mono text-slate-400 uppercase">Recovery Rate</p>
          <p className="text-2xl font-heading font-extrabold text-amber-400 mt-1">
            {completedCount * 10}%
          </p>
        </div>
      </div>

      {/* Achievement Badges Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              SPECIAL ACHIEVEMENT BADGES
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Earned by mastering challenges and restoring critical multiverse nodes.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#00F0FF] px-3 py-1 rounded-full bg-[#087CFF]/20 border border-[#087CFF]/40">
            {profile.achievements.filter(a => a.unlocked).length} / {profile.achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all ${
                ach.unlocked
                  ? 'glass-panel border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                  : 'bg-[#080B18]/60 border-slate-800 opacity-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  ach.unlocked 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                }`}>
                  {ach.unlocked ? (
                    ach.icon === 'crown' ? <Crown className="w-6 h-6" /> :
                    ach.icon === 'cpu' ? <Cpu className="w-6 h-6" /> :
                    ach.icon === 'code' ? <Code className="w-6 h-6" /> :
                    ach.icon === 'shield' ? <Shield className="w-6 h-6" /> :
                    <Zap className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-white text-sm">
                      {ach.name}
                    </h4>
                    {ach.unlocked && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        EARNED
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 font-mono">
                    {ach.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Skill Matrix */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          DEBUGGING PROFICIENCY MATRIX
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(profile.skill_stats).map(([skill, val]) => (
            <div key={skill} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                {skill.replace('_', ' ')}
              </span>
              <div className="flex justify-between items-end mb-2">
                <span className="font-heading font-bold text-white text-lg">{val}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#087CFF] to-[#00F0FF] rounded-full"
                  style={{ width: `${val}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

