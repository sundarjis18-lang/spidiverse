import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Unlock,
  Lock,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Download,
  Printer,
  Sparkles,
  Shield,
  FileCheck,
  Star,
  Users,
  User,
  GraduationCap,
  Trophy,
  RefreshCw
} from 'lucide-react';
import { AdminStudent, LeaderboardEntry } from '../types';
import { api } from '../utils/api';
import { sounds } from '../utils/soundEffects';

interface CertificatesDashboardProps {
  students: AdminStudent[];
  leaderboard: LeaderboardEntry[];
  onToggleCertificates?: (open: boolean) => void;
}

export const CertificatesDashboard: React.FC<CertificatesDashboardProps> = ({
  students = [],
  leaderboard = [],
  onToggleCertificates
}) => {
  // Master Open/Close state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sub-tab: Master Control vs Custom Studio Generator
  const [activeTab, setActiveTab] = useState<'control' | 'studio'>('control');

  // Generator Studio state: Student Name, Department Name, and Place of Rank (1ST, 2nd & 3rd)
  const firstStudent = students.length > 0 ? students[0] : null;
  const [studentName, setStudentName] = useState<string>(firstStudent?.name || 'Peter Parker');
  const [departmentName, setDepartmentName] = useState<string>(firstStudent?.department || 'Computer Science and Engineering');
  const [regNumber, setRegNumber] = useState<string>(firstStudent?.reg_number || 'RA2111003010142');
  const [rankPlace, setRankPlace] = useState<'1ST' | '2ND' | '3RD'>('1ST');

  const [customEventTitle, setCustomEventTitle] = useState('PYRANK 2026: SPIDER-CODE PYTHON DEBUGGING ARENA');
  const [customOrg, setCustomOrg] = useState('PROGRAMMING CLUB & DEPARTMENT OF COMPUTER SCIENCE');
  const [customDate, setCustomDate] = useState('November 28, 2026');
  const [signatory1Name, setSignatory1Name] = useState('Dr. K. R. Sharma');
  const [signatory1Role, setSignatory1Role] = useState('Faculty Coordinator, CSE');
  const [signatory2Name, setSignatory2Name] = useState('Spider-Verse Convener');
  const [signatory2Role, setSignatory2Role] = useState('Programming Club Lead');
  const [themeTemplate, setThemeTemplate] = useState<'cyber' | 'gold' | 'emerald'>('gold');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-sync initial student values when students load
  useEffect(() => {
    if (students.length > 0 && studentName === 'Peter Parker') {
      setStudentName(students[0].name);
      if (students[0].department) setDepartmentName(students[0].department);
      if (students[0].reg_number) setRegNumber(students[0].reg_number);
    }
  }, [students]);

  // Load initial certificates open status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await api.getCertificatesStatus();
        setIsOpen(res.certificates_open);
        if (onToggleCertificates) {
          onToggleCertificates(res.certificates_open);
        }
      } catch (err) {
        console.error('Failed to load certificates status', err);
      }
    };
    loadStatus();
  }, []);

  // Handle Master OPEN Certificates
  const handleOpenCertificates = async () => {
    sounds.playWebShoot();
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await api.openCertificates();
      setIsOpen(true);
      if (onToggleCertificates) {
        onToggleCertificates(true);
      }
      sounds.playSuccess();
      setFeedbackMsg(
        'STATUS UPDATED TO OPEN: Certificates tab is now LIVE and visible on all student sidebars between Rankings and Profile.'
      );
    } catch (err) {
      sounds.playError();
      setFeedbackMsg('Failed to open certificates.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Master CLOSE Certificates
  const handleCloseCertificates = async () => {
    sounds.playWebShoot();
    setLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await api.closeCertificates();
      setIsOpen(false);
      if (onToggleCertificates) {
        onToggleCertificates(false);
      }
      sounds.playSuccess();
      setFeedbackMsg(
        'STATUS UPDATED TO CLOSED: Certificates tab has been HIDDEN from all student sidebars.'
      );
    } catch (err) {
      sounds.playError();
      setFeedbackMsg('Failed to close certificates.');
    } finally {
      setLoading(false);
    }
  };

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleDownloadPNG = async () => {
    sounds.playWebShoot();
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1364; // 2x scaling of 1024x682 template
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load official white & cyber-blue template
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/certificate_template.jpg';
      await new Promise<void>((resolve, reject) => {
        if (img.complete && img.naturalWidth !== 0) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load certificate template'));
        }
      });

      // 1. Draw base official template
      ctx.drawImage(img, 0, 0, 2048, 1364);

      // 2. Draw Dynamic Cursive Student Name above underline (y = 646)
      const effectiveName = studentName.trim() || 'Student Name';
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#0A1931';

      let nameFontSize = 74;
      ctx.font = `italic 700 ${nameFontSize}px 'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Segoe Script', cursive`;
      let nameMetrics = ctx.measureText(effectiveName);
      while (nameMetrics.width > 1050 && nameFontSize > 34) {
        nameFontSize -= 4;
        ctx.font = `italic 700 ${nameFontSize}px 'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Segoe Script', cursive`;
        nameMetrics = ctx.measureText(effectiveName);
      }
      ctx.fillText(effectiveName, 1024, 638);
      ctx.restore();

      // 3. Draw Dynamic Department Name flanked by navy lines (y = 720)
      const effectiveDept = departmentName.trim() || 'Computer Science & Engineering';
      const deptDisplay = effectiveDept.toUpperCase().startsWith('DEPARTMENT OF')
        ? effectiveDept.toUpperCase()
        : `DEPARTMENT OF ${effectiveDept.toUpperCase()}`;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0A1931';

      let deptFontSize = 32;
      ctx.font = `700 ${deptFontSize}px 'Inter', 'Segoe UI', Arial, sans-serif`;
      let deptMetrics = ctx.measureText(deptDisplay);
      while (deptMetrics.width > 950 && deptFontSize > 18) {
        deptFontSize -= 2;
        ctx.font = `700 ${deptFontSize}px 'Inter', 'Segoe UI', Arial, sans-serif`;
        deptMetrics = ctx.measureText(deptDisplay);
      }

      const deptY = 720;
      ctx.fillText(deptDisplay, 1024, deptY);

      // Flanking horizontal lines
      const lineLeftStart = 476;
      const lineLeftEnd = Math.max(lineLeftStart, 1024 - (deptMetrics.width / 2) - 25);
      const lineRightStart = Math.min(1620, 1024 + (deptMetrics.width / 2) + 25);
      const lineRightEnd = 1620;

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#171B38';
      if (lineLeftEnd > lineLeftStart) {
        ctx.moveTo(lineLeftStart, deptY);
        ctx.lineTo(lineLeftEnd, deptY);
      }
      if (lineRightEnd > lineRightStart) {
        ctx.moveTo(lineRightStart, deptY);
        ctx.lineTo(lineRightEnd, deptY);
      }
      ctx.stroke();
      ctx.restore();

      // 4. Draw Rank Distinction Stamp (if applicable: 1ST, 2ND, 3RD)
      ctx.save();
      const badgeX = 1750;
      const badgeY = 320;
      
      let badgeBg = '#F59E0B'; // Gold
      let badgeText = '1ST PLACE CHAMPION';
      if (rankPlace === '2ND') {
        badgeBg = '#00F0FF'; // Cyber Silver/Cyan
        badgeText = '2ND PLACE RUNNER-UP';
      } else if (rankPlace === '3RD') {
        badgeBg = '#10B981'; // Emerald/Bronze
        badgeText = '3RD PLACE DISTINCTION';
      }

      // Draw ribbon badge
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = badgeBg;
      ctx.beginPath();
      ctx.roundRect(badgeX - 160, badgeY - 25, 320, 50, 25);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000000';
      ctx.font = '900 18px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${badgeText} ★`, badgeX, badgeY);
      ctx.restore();

      // Trigger download
      const cleanName = effectiveName.replace(/[^a-zA-Z0-9]/g, '_');
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `PyRank_${rankPlace}_Place_Certificate_${cleanName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      sounds.playSuccess();
    } catch (err) {
      console.error('Failed to export certificate PNG:', err);
      sounds.playError();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      <canvas ref={canvasRef} className="hidden" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Certificates Distribution Controls</span>
          </div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide">
            CERTIFICATES ACCESS MASTER
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Control the visibility of verified certificates across all student sidebars, or generate customized credentials.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-4 py-2 rounded-2xl font-mono text-xs font-bold flex items-center gap-2.5 border transition-all ${isOpen
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
              : 'bg-rose-950/70 border-rose-500/60 text-rose-300 shadow-[0_0_20px_rgba(245,34,69,0.35)]'
              }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                }`}
            ></span>
            <span>{isOpen ? 'CERTIFICATES STATUS: OPEN (LIVE)' : 'CERTIFICATES STATUS: CLOSED (HIDDEN)'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center p-1.5 bg-[#080B18] border border-slate-800 rounded-2xl w-full sm:w-fit gap-2">
        <button
          type="button"
          onClick={() => {
            sounds.playWebShoot();
            setActiveTab('control');
          }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'control'
            ? 'bg-gradient-to-r from-[#087CFF] to-[#00F0FF] text-black shadow-[0_0_20px_rgba(8,124,255,0.4)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificate Access (Open / Close)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playWebShoot();
            setActiveTab('studio');
          }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'studio'
            ? 'bg-gradient-to-r from-[#F52245] via-purple-600 to-[#8B35FF] text-white shadow-[0_0_20px_rgba(245,34,69,0.4)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Certificate Studio</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-2.5 animate-in fade-in ${isOpen
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
            : 'bg-amber-950/90 border-amber-500 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
            }`}
        >
          {isOpen ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Lock className="w-4 h-4 text-amber-400 shrink-0" />}
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: OPEN & CLOSE CONTROLS (Requested replacement of table)
          ========================================================================= */}
      {activeTab === 'control' && (
        <div className="space-y-8">
          {/* Main Master Open / Close Options Box */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-2 border-slate-800 bg-[#080B18]/90 relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                  STUDENT PORTAL VISIBILITY CONTROLLER
                </span>
                <h2 className="font-heading text-2xl font-black text-white">
                  Set Certificate Visibility for Students
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Toggle whether student cadets can see and access the <strong className="text-white">&quot;Certificates&quot;</strong> tab in their dashboard sidebar (positioned above <em className="text-cyan-300 not-italic font-bold">Profile</em> and below <em className="text-cyan-300 not-italic font-bold">Rankings</em>).
                </p>
              </div>

              {/* Status Pill */}
              <div
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border ${isOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(245,34,69,0.4)]'
                  }`}
              >
                {isOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isOpen ? 'VISIBILITY: OPEN' : 'VISIBILITY: CLOSED'}</span>
              </div>
            </div>

            {/* The 2 Core Options: OPEN & CLOSE Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Option 1: OPEN Card */}
              <div
                className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between space-y-5 ${isOpen
                  ? 'bg-gradient-to-br from-emerald-950/60 via-[#0b281f] to-[#080B18] border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                  : 'bg-[#080B18]/60 border-slate-800 hover:border-emerald-500/50'
                  }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <Unlock className="w-6 h-6" />
                    </div>
                    {isOpen && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        ● CURRENTLY ACTIVE
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-black text-white">
                      OPTION 1: OPEN CERTIFICATES
                    </h3>
                    <p className="text-xs font-mono text-slate-300 mt-1 leading-relaxed">
                      Publish certificates to all student cadets. The <strong className="text-white">&quot;Certificates&quot;</strong> tab immediately appears in the student sidebar (above Profile and below Rankings), allowing students to preview and download their official certificate.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading || isOpen}
                  onClick={handleOpenCertificates}
                  className={`w-full py-3.5 px-6 rounded-2xl font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isOpen
                    ? 'bg-emerald-950/40 text-emerald-500 border border-emerald-500/30 cursor-default'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 active:scale-95 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer'
                    }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isOpen ? 'CERTIFICATES ALREADY OPEN' : 'CLICK TO OPEN CERTIFICATES'}</span>
                </button>
              </div>

              {/* Option 2: CLOSE Card */}
              <div
                className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between space-y-5 ${!isOpen
                  ? 'bg-gradient-to-br from-rose-950/60 via-[#2a0e16] to-[#080B18] border-rose-500 shadow-[0_0_40px_rgba(245,34,69,0.3)]'
                  : 'bg-[#080B18]/60 border-slate-800 hover:border-rose-500/50'
                  }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(245,34,69,0.4)]">
                      <Lock className="w-6 h-6" />
                    </div>
                    {!isOpen && (
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/60 text-rose-300 font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        ● CURRENTLY ACTIVE
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-black text-white">
                      OPTION 2: CLOSE CERTIFICATES
                    </h3>
                    <p className="text-xs font-mono text-slate-300 mt-1 leading-relaxed">
                      Withdraw and hide certificates. Removes the <strong className="text-white">&quot;Certificates&quot;</strong> tab from all student sidebars so cadets cannot see or download certificates until you choose to open them again.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading || !isOpen}
                  onClick={handleCloseCertificates}
                  className={`w-full py-3.5 px-6 rounded-2xl font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${!isOpen
                    ? 'bg-rose-950/40 text-rose-500 border border-rose-500/30 cursor-default'
                    : 'bg-gradient-to-r from-[#F52245] via-rose-600 to-red-700 hover:brightness-110 active:scale-95 text-white shadow-[0_0_25px_rgba(245,34,69,0.4)] cursor-pointer'
                    }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>{!isOpen ? 'CERTIFICATES ALREADY CLOSED' : 'CLICK TO CLOSE CERTIFICATES'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Demonstration Preview Card of Student Sidebar */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-[#080B18]/70 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 max-w-lg">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                STUDENT SIDEBAR SIMULATION
              </span>
              <h3 className="font-heading text-lg font-bold text-white">
                How It Appears to Students Right Now:
              </h3>
              <p className="text-xs font-mono text-slate-400">
                {isOpen
                  ? 'Certificates are OPEN. Students see the "Certificates" option right below Rankings and right above Profile.'
                  : 'Certificates are CLOSED. The "Certificates" option is hidden from student sidebars.'}
              </p>
            </div>

            {/* Simulated Sidebar Widget */}
            <div className="w-60 bg-[#080B18] border border-slate-800 rounded-2xl p-3 space-y-1 font-mono text-xs">
              <div className="px-3 py-2 text-slate-500 rounded-xl">Dashboard</div>
              <div className="px-3 py-2 text-slate-500 rounded-xl">Web Matrix</div>
              <div className="px-3 py-2 text-slate-500 rounded-xl">Rankings</div>

              {isOpen ? (
                <div className="px-3 py-2 bg-gradient-to-r from-cyan-950/80 to-[#087CFF]/20 text-cyan-300 border border-cyan-500/60 rounded-xl font-bold flex items-center justify-between shadow-[0_0_15px_rgba(0,240,255,0.25)] animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>Certificates</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold uppercase">
                    OPEN
                  </span>
                </div>
              ) : (
                <div className="px-3 py-1.5 text-rose-500/60 border border-dashed border-rose-500/30 rounded-xl text-[10px] text-center font-bold">
                  [Certificates Hidden]
                </div>
              )}

              <div className="px-3 py-2 text-slate-500 rounded-xl">Profile</div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GENERATION STUDIO (Customize & Download)
          ========================================================================= */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Form (5 cols) */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 bg-[#080B18]/80 space-y-5">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Certificate Studio Configurator</span>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Student Name <span className="text-rose-400">*</span></span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Editable</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Enter Student Name (e.g. Peter Parker)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 focus:border-[#00F0FF] text-xs text-white font-mono outline-none transition-all shadow-inner"
              />
            </div>

            {/* Department Name */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Department Name <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="text"
                value={departmentName}
                onChange={e => setDepartmentName(e.target.value)}
                placeholder="Enter Department Name (e.g. Computer Science and Engineering)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 focus:border-[#00F0FF] text-xs text-white font-mono outline-none transition-all shadow-inner"
              />
            </div>

            {/* Place of Rank Droplist: 1ST, 2nd & 3rd */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Place of Rank <span className="text-rose-400">*</span></span>
              </label>
              <div className="relative">
                <select
                  value={rankPlace}
                  onChange={e => {
                    const val = e.target.value as '1ST' | '2ND' | '3RD';
                    setRankPlace(val);
                    if (val === '1ST') setThemeTemplate('gold');
                    else if (val === '2ND') setThemeTemplate('cyber');
                    else if (val === '3RD') setThemeTemplate('emerald');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-amber-500/60 focus:border-amber-400 text-xs font-mono font-bold text-amber-300 outline-none cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  <option value="1ST">1ST (1st Place - Gold Champion)</option>
                  <option value="2ND">2nd (2nd Place - Silver Distinction)</option>
                  <option value="3RD">3rd (3rd Place - Bronze Distinction)</option>
                </select>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleDownloadPNG}
                className="flex-1 py-3 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[#087CFF] to-[#00F0FF] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(8,124,255,0.4)] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Live Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Official Certificate Live Preview
            </span>

            {/* Official White & Cyber-Blue Certificate Preview Card */}
            <div
              id="printable-certificate"
              className="relative w-full aspect-[1.5015/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(8,124,255,0.25)] border-2 border-cyan-500/40 bg-white select-none"
            >
              {/* Clean Official Certificate Template Background */}
              <img
                src="/certificate_template.jpg"
                alt="PyRank Official Certificate Template"
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Dynamic Cursive Student Name */}
              <div
                className="absolute pointer-events-none text-center"
                style={{
                  top: '41.5%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '76%',
                }}
              >
                <span
                  className="block font-bold tracking-normal text-[#0A1931]"
                  style={{
                    fontFamily: "'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Segoe Script', cursive",
                    fontSize: 'clamp(16px, 3.2vw, 42px)',
                    lineHeight: 1.15,
                  }}
                >
                  {studentName.trim() || 'Student Name'}
                </span>
              </div>

              {/* Dynamic Department Name */}
              <div
                className="absolute pointer-events-none flex items-center justify-center gap-2 sm:gap-3 px-3"
                style={{
                  top: '52.8%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                }}
              >
                <div className="h-[1.5px] sm:h-[2px] bg-[#171B38] flex-1 max-w-[130px]" />
                <span
                  className="font-sans font-bold text-[#0A1931] uppercase tracking-wider shrink-0 px-1"
                  style={{
                    fontSize: 'clamp(7px, 1.3vw, 15px)',
                  }}
                >
                  {departmentName.trim()
                    ? departmentName.toUpperCase().startsWith('DEPARTMENT OF')
                      ? departmentName.toUpperCase()
                      : `DEPARTMENT OF ${departmentName.toUpperCase()}`
                    : 'DEPARTMENT OF COMPUTER SCIENCE'}
                </span>
                <div className="h-[1.5px] sm:h-[2px] bg-[#171B38] flex-1 max-w-[130px]" />
              </div>

              {/* Rank Distinction Ribbon Stamp */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: '23%',
                  right: '3.5%',
                  transform: 'translateY(-50%)',
                }}
              >
                <div
                  className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-heading font-black tracking-wider uppercase border shadow-lg flex items-center gap-1.5 ${
                    rankPlace === '1ST'
                      ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : rankPlace === '2ND'
                      ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                      : 'bg-emerald-400 text-black border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  }`}
                >
                  <Trophy className="w-3 h-3 text-black" />
                  <span>{rankPlace === '1ST' ? '1ST PLACE CHAMPION' : rankPlace === '2ND' ? '2ND PLACE RUNNER-UP' : '3RD PLACE DISTINCTION'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
