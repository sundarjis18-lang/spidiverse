import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Hash,
  Sparkles,
  ChevronRight,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Zap,
  Flame
} from 'lucide-react';
import { User } from '../types';
import { api } from '../utils/api';
import { SPIDER_AVATARS } from '../utils/mockData';
import { sounds } from '../utils/soundEffects';
import { DigitalRainCanvas } from '../components/DigitalRainCanvas';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [showForgot, setShowForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Admin Credentials Modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminModalUser, setAdminModalUser] = useState('');
  const [adminModalPass, setAdminModalPass] = useState('');
  const [adminModalError, setAdminModalError] = useState('');
  const [adminModalLoading, setAdminModalLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  // Handle Quick Demo Login
  const handleQuickLogin = async (demoEmail: string, demoPass: string = 'spiderpass', demoName?: string, demoReg?: string) => {
    sounds.playWebShoot();
    if (demoName) setName(demoName);
    if (demoReg) setRegNumber(demoReg);
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setErrorMessage('');
    try {
      const user = await api.login(demoEmail, demoPass, demoReg, demoName);
      sounds.playSuccess();
      onLoginSuccess(user);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed');
      sounds.playError();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (!password) {
        throw new Error('Please enter your Security Passcode.');
      }
      if (!name && !regNumber && !email) {
        throw new Error('Please enter your Student Name or Register Number.');
      }

      const inputUsername = (name || regNumber || email).trim();

      // Case-sensitive check for Admin access (username: spiderman, password: pg123)
      if (inputUsername.toLowerCase() === 'spiderman') {
        if (inputUsername !== 'spiderman' || password !== 'pg123') {
          throw new Error('Invalid Admin credentials.');
        }
      }

      sounds.playWebShoot();
      const ident = email.trim() || regNumber.trim() || name.trim();
      const user = await api.login(ident, password, regNumber.trim(), name.trim());
      sounds.playSuccess();
      onLoginSuccess(user);
    } catch (err: unknown) {
      sounds.playError();
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    sounds.playSuccess();
    setTimeout(() => {
      setShowForgot(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2500);
  };

  const handleAdminModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminModalError('');
    setAdminModalLoading(true);

    try {
      const u = adminModalUser.trim();
      const p = adminModalPass.trim();

      if (!u || !p) {
        throw new Error('Please enter both Admin Username and Passcode.');
      }

      if (u !== 'spiderman') {
        throw new Error('ACCESS DENIED: Invalid Admin credentials.');
      }

      if (p !== 'pg123') {
        throw new Error('ACCESS DENIED: Invalid Admin credentials.');
      }

      sounds.playWebShoot();
      const adminUser = await api.login('spiderman', p, 'spiderman', 'spiderman');
      sounds.playSuccess();
      setShowAdminModal(false);
      onLoginSuccess(adminUser);
    } catch (err: unknown) {
      sounds.playError();
      setAdminModalError(err instanceof Error ? err.message : 'Admin authentication failed.');
    } finally {
      setAdminModalLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* Background Matrix Digital Rain Layer */}
      <DigitalRainCanvas opacity={0.25} />

      {/* Main Container - 2 Column Split Layout matching Reference */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* Left Column: Hooded Cyber Spider-Man Artwork & Holographic Lore */}
        <div className="lg:col-span-6 relative flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* Cyberpunk Character Frame */}
          <div className="relative w-full max-w-md sm:max-w-lg aspect-[4/5] rounded-3xl overflow-hidden border-2 border-[#F52245]/50 shadow-[0_0_50px_rgba(245,34,69,0.35)] group">
            <img
              src="/spider_login_hero.jpg"
              alt="Hooded Cyber Spider-Man"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
            />
            {/* Ambient Hologram Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B18] via-transparent to-transparent opacity-90"></div>

            {/* Glowing Corner Accents */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#080B18]/80 border border-[#F52245] text-[#F52245] text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-[#F52245] animate-ping"></span>
              MULTIVERSE LINK ACTIVE
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded font-mono text-[11px] font-bold bg-[#F52245]/30 text-rose-300 border border-[#F52245]/60 uppercase">
                  AGENT STATUS: STANDBY
                </span>
                <span className="text-xs font-mono text-cyan-400">SECTOR 616</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-white leading-tight">
                THE MULTIVERSE IS CALLING, AGENT.
              </h2>
              <p className="text-xs font-mono text-slate-300 mt-1.5 leading-relaxed">
                10 corrupted quantum neural subroutines threaten total dimensional collapse. Deploy your Python debugging capabilities.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Cyberpunk Login / Registration Card */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#087CFF]/40 shadow-[0_0_50px_rgba(8,124,255,0.25)] relative overflow-hidden">

            {/* Header / Brand */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl p-1 bg-gradient-to-br from-[#F52245] to-[#087CFF] shadow-[0_0_20px_rgba(245,34,69,0.5)]">
                  <img src="/spider_emblem.jpg" alt="Spider" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-black text-white">
                    ARENA DISPATCH
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Enter security clearance token
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-purple-900/30 border border-purple-500/50 text-purple-300 font-mono text-[10px] font-bold uppercase">
                v2.0 HUD
              </span>
            </div>

            {/* Quick Demo Deploy Roster */}


            {/* ADMIN ACCESS */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  sounds.playWebShoot();
                  setShowAdminModal(true);
                  setAdminModalError('');
                  setAdminModalUser('');
                  setAdminModalPass('');
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 hover:border-purple-500/60 border border-purple-500/30 text-xs text-purple-200 transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
                  <span className="font-mono font-bold">Overseer / Admin Clearance</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-500/30">
                  Authenticate →
                </span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Student Name */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1 uppercase">
                    Student Name <span className="text-slate-500 font-normal">(e.g. Peter Parker / spiderman)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4 text-[#087CFF]" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Peter Parker or spiderman"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080B18]/90 border border-slate-700 focus:border-[#F52245] text-xs text-white placeholder-slate-500 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Student Register Number */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1 uppercase">
                    Student Register Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4 text-[#087CFF]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. RA2111003010142 or spiderman"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080B18]/90 border border-slate-700 focus:border-[#087CFF] text-xs text-white placeholder-slate-500 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* College Email ID */}
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1 uppercase">
                    College Email ID <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 text-[#087CFF]" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@spiderverse.edu"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080B18]/90 border border-slate-700 focus:border-[#F52245] text-xs text-white placeholder-slate-500 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Security Passcode / Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase">
                      Security Passcode / Password <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[11px] text-[#087CFF] hover:text-[#00F0FF] transition-colors font-mono"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-[#087CFF]" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080B18]/90 border border-slate-700 focus:border-[#F52245] text-xs text-white placeholder-slate-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3 px-6 rounded-xl font-heading font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-[#F52245] via-[#8B35FF] to-[#087CFF] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(245,34,69,0.4)] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>ACCESS MISSION CONTROL</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {
        showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-[#087CFF]/50 shadow-[0_0_40px_rgba(8,124,255,0.4)]">
              <div className="flex items-center gap-2 mb-3 text-[#00F0FF]">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-heading text-lg font-bold text-white">Reset Security Key</h3>
              </div>
              <p className="text-xs text-slate-300 font-mono mb-4">
                Enter your college email address. A one-time neural bypass token will be dispatched.
              </p>

              {forgotSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Bypass link dispatched! Check your college email.</span>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3 font-mono text-xs">
                  <div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="student@college.edu"
                      className="w-full px-3 py-2 rounded-xl bg-[#080B18] border border-slate-700 text-white outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg font-heading font-bold uppercase bg-[#087CFF] text-white"
                    >
                      Send Token
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      }

      {/* Admin Credentials Modal */}
      {
        showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-7 border-2 border-purple-500/60 shadow-[0_0_60px_rgba(139,53,255,0.45)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-950/80 border border-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(139,53,255,0.5)]">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold block">
                    RESTRICTED ACCESS
                  </span>
                  <h3 className="font-heading text-xl font-black text-white">
                    Admin Verification
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-mono mb-4 leading-relaxed">
                Please enter your administrator username and password. Credentials are strictly case-sensitive.
              </p>

              {adminModalError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{adminModalError}</span>
                </div>
              )}

              <form onSubmit={handleAdminModalSubmit} className="space-y-3.5 font-mono text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Username <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4 text-purple-400" />
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={adminModalUser}
                      onChange={(e) => setAdminModalUser(e.target.value)}
                      placeholder="Enter admin username"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#080B18] border border-purple-500/40 focus:border-purple-400 text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 text-purple-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={adminModalPass}
                      onChange={(e) => setAdminModalPass(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#080B18] border border-purple-500/40 focus:border-purple-400 text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-mono text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adminModalLoading}
                    className="px-5 py-2.5 rounded-xl font-heading font-bold uppercase text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-[#087CFF] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(139,53,255,0.4)] flex items-center gap-1.5"
                  >
                    {adminModalLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Authenticate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

    </div >
  );
};
