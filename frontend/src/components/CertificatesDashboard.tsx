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
  Mail,
  Send,
  Key,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  ExternalLink
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

  // Sub-tab: Master Control vs Custom Studio Generator vs Email Delivery Setup
  const [activeTab, setActiveTab] = useState<'control' | 'studio' | 'email'>('control');

  // SMTP Configuration state
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('251300588077@srcas.ac.in');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('PyRank Arena <251300588077@srcas.ac.in>');
  const [smtpIsConfigured, setSmtpIsConfigured] = useState(false);
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpMsg, setSmtpMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Generator Studio state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? String(students[0].id) : ''
  );
  const [certType, setCertType] = useState<'participation' | 'merit' | 'completion'>('participation');
  const [customEventTitle, setCustomEventTitle] = useState('PYRANK 2026: SPIDER-CODE PYTHON DEBUGGING ARENA');
  const [customOrg, setCustomOrg] = useState('PROGRAMMING CLUB & DEPARTMENT OF COMPUTER SCIENCE');
  const [customDate, setCustomDate] = useState('November 27, 2026');
  const [signatory1Name, setSignatory1Name] = useState('Dr. K. R. Sharma');
  const [signatory1Role, setSignatory1Role] = useState('Faculty Coordinator, CSE');
  const [signatory2Name, setSignatory2Name] = useState('Spider-Verse Convener');
  const [signatory2Role, setSignatory2Role] = useState('Programming Club Lead');
  const [themeTemplate, setThemeTemplate] = useState<'cyber' | 'gold' | 'emerald'>('cyber');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load initial certificates open status and SMTP config on mount
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

    api.getSmtpConfig().then(cfg => {
      if (cfg) {
        if (cfg.smtp_host) setSmtpHost(cfg.smtp_host);
        if (cfg.smtp_port) setSmtpPort(cfg.smtp_port);
        if (cfg.smtp_user) {
          setSmtpUser(cfg.smtp_user);
          setTestEmailAddress(cfg.smtp_user);
        }
        if (cfg.smtp_from) setSmtpFrom(cfg.smtp_from);
        setSmtpIsConfigured(cfg.is_configured);
      }
    }).catch(() => { });
  }, []);

  // Save SMTP configuration
  const handleSaveSmtp = async () => {
    sounds.playWebShoot();
    setSmtpLoading(true);
    setSmtpMsg(null);
    try {
      const res = await api.saveSmtpConfig({
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        smtp_user: smtpUser.trim(),
        smtp_pass: smtpPass.trim(),
        smtp_from: smtpFrom.trim() || smtpUser.trim()
      });
      sounds.playSuccess();
      setSmtpIsConfigured(res.is_configured);
      setSmtpMsg({ type: 'success', text: res.message || 'SMTP Credentials successfully saved!' });
      setTimeout(() => setSmtpMsg(null), 5000);
    } catch (err: any) {
      sounds.playError();
      setSmtpMsg({ type: 'error', text: err?.message || 'Failed to save SMTP configuration.' });
    } finally {
      setSmtpLoading(false);
    }
  };

  // Test SMTP configuration by sending an email
  const handleTestSmtp = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      sounds.playError();
      setSmtpMsg({ type: 'error', text: 'Please enter a valid recipient email address for testing.' });
      return;
    }
    sounds.playWebShoot();
    setIsTestingEmail(true);
    setSmtpMsg(null);
    try {
      const res = await api.testSmtpConfig(testEmailAddress.trim());
      sounds.playSuccess();
      setSmtpMsg({ type: 'success', text: res.message || `Test email successfully sent to ${testEmailAddress}!` });
      setTimeout(() => setSmtpMsg(null), 6000);
    } catch (err: any) {
      sounds.playError();
      setSmtpMsg({ type: 'error', text: err?.message || 'SMTP connection failed. Please verify credentials.' });
    } finally {
      setIsTestingEmail(false);
    }
  };

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

  const currentStudioStudent: AdminStudent | undefined =
    students.find(s => String(s.id) === selectedStudentId) || students[0];

  const handleDownloadPNG = () => {
    if (!currentStudioStudent) return;
    sounds.playWebShoot();
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGradient = ctx.createRadialGradient(960, 540, 100, 960, 540, 1000);
    if (themeTemplate === 'gold') {
      bgGradient.addColorStop(0, '#1c1508');
      bgGradient.addColorStop(1, '#080602');
    } else if (themeTemplate === 'emerald') {
      bgGradient.addColorStop(0, '#061c14');
      bgGradient.addColorStop(1, '#020a06');
    } else {
      bgGradient.addColorStop(0, '#0c1630');
      bgGradient.addColorStop(1, '#040712');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Frame
    ctx.strokeStyle = themeTemplate === 'gold' ? '#F59E0B' : themeTemplate === 'emerald' ? '#10B981' : '#00F0FF';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 1820, 980);

    // Text Header
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = themeTemplate === 'gold' ? '#FCD34D' : themeTemplate === 'emerald' ? '#6EE7B7' : '#00F0FF';
    ctx.fillText('OFFICIAL VERIFIED CREDENTIAL • PYRANK • SECTOR 616', 960, 130);

    ctx.font = '900 32px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(customEventTitle, 960, 180);

    ctx.font = '600 18px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(customOrg, 960, 215);

    // Award Title
    let awardTitle = 'CERTIFICATE OF PARTICIPATION';
    if (certType === 'merit') awardTitle = 'CERTIFICATE OF MERIT & EXCELLENCE';
    if (certType === 'completion') awardTitle = 'CERTIFICATE OF QUANTUM MASTERY';

    ctx.font = '900 50px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = themeTemplate === 'gold' ? '#FDE68A' : themeTemplate === 'emerald' ? '#A7F3D0' : '#00F0FF';
    ctx.fillText(awardTitle, 960, 320);

    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('THIS IS PROUDLY PRESENTED TO', 960, 375);

    // Recipient Name
    ctx.font = '900 64px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(currentStudioStudent.name.toUpperCase(), 960, 460);

    // Reg Number & Department
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillStyle = themeTemplate === 'gold' ? '#FCD34D' : themeTemplate === 'emerald' ? '#6EE7B7' : '#38BDF8';
    const deptStr = currentStudioStudent.department ? `DEPARTMENT OF ${currentStudioStudent.department.toUpperCase()} • ` : '';
    ctx.fillText(`${deptStr}COLLEGE REGISTER NO: ${currentStudioStudent.reg_number}`, 960, 510);

    // Citation
    ctx.font = '400 22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(
      'for commendable performance and active participation in the PyRank Spider-Code Python Debugging Challenge,',
      960,
      580
    );
    ctx.fillText(
      'demonstrating solid algorithmic thinking, analytical capabilities, and high-pressure debugging skills.',
      960,
      614
    );

    // Signatures
    const sigY = 880;
    ctx.font = 'italic 30px "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = themeTemplate === 'gold' ? '#FCD34D' : themeTemplate === 'emerald' ? '#6EE7B7' : '#38BDF8';
    ctx.fillText(signatory1Name, 500, sigY - 15);
    ctx.fillText(signatory2Name, 1420, sigY - 15);

    ctx.beginPath();
    ctx.moveTo(350, sigY);
    ctx.lineTo(650, sigY);
    ctx.moveTo(1270, sigY);
    ctx.lineTo(1570, sigY);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(signatory1Name, 500, sigY + 28);
    ctx.fillText(signatory2Name, 1420, sigY + 28);

    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(signatory1Role, 500, sigY + 50);
    ctx.fillText(signatory2Role, 1420, sigY + 50);

    ctx.fillText(`ISSUED ON: ${customDate}`, 960, 890);

    // Trigger download
    const cleanName = currentStudioStudent.name.replace(/[^a-zA-Z0-9]/g, '_');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `PyRank_${certType}_Certificate_${cleanName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    sounds.playSuccess();
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

        <button
          type="button"
          onClick={() => {
            sounds.playWebShoot();
            setActiveTab('email');
          }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'email'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email Delivery (Gmail / SMTP)</span>
          {smtpIsConfigured && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
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

            {/* Recipient */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1 uppercase">
                Select Recipient Cadet
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-white font-mono outline-none focus:border-[#00F0FF]"
              >
                {students.map(s => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name} ({s.reg_number}) - {s.department || 'General'}
                  </option>
                ))}
              </select>
            </div>

            {/* Certificate Type */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
                Certificate Distinction
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCertType('participation')}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border ${certType === 'participation'
                    ? 'bg-cyan-950/80 border-[#00F0FF] text-cyan-300'
                    : 'bg-[#080B18] border-slate-700 text-slate-400'
                    }`}
                >
                  Participation
                </button>
                <button
                  type="button"
                  onClick={() => setCertType('merit')}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border ${certType === 'merit'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-[#080B18] border-slate-700 text-slate-400'
                    }`}
                >
                  Merit
                </button>
                <button
                  type="button"
                  onClick={() => setCertType('completion')}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border ${certType === 'completion'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-[#080B18] border-slate-700 text-slate-400'
                    }`}
                >
                  10/10 Master
                </button>
              </div>
            </div>

            {/* Custom Titles */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1 uppercase">
                  Event Title
                </label>
                <input
                  type="text"
                  value={customEventTitle}
                  onChange={e => setCustomEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-white font-mono outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1 uppercase">
                  Organizing Body
                </label>
                <input
                  type="text"
                  value={customOrg}
                  onChange={e => setCustomOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-white font-mono outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Signatories */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">
                  Signatory 1
                </label>
                <input
                  type="text"
                  value={signatory1Name}
                  onChange={e => setSignatory1Name(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#080B18] border border-slate-700 text-xs text-white font-mono mb-1"
                />
                <input
                  type="text"
                  value={signatory1Role}
                  onChange={e => setSignatory1Role(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#080B18] border border-slate-700 text-[11px] text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">
                  Signatory 2
                </label>
                <input
                  type="text"
                  value={signatory2Name}
                  onChange={e => setSignatory2Name(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#080B18] border border-slate-700 text-xs text-white font-mono mb-1"
                />
                <input
                  type="text"
                  value={signatory2Role}
                  onChange={e => setSignatory2Role(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#080B18] border border-slate-700 text-[11px] text-slate-400 font-mono"
                />
              </div>
            </div>

            {/* Export Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="flex-1 py-3 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[#087CFF] to-[#00F0FF] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 px-5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2"
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
              Certificate Live Preview
            </span>

            <div className="w-full aspect-[1.55/1] rounded-3xl p-6 sm:p-8 border-2 border-[#00F0FF]/80 shadow-[0_0_50px_rgba(0,240,255,0.25)] relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#0d1633] via-[#080d22] to-[#040714] select-none">
              <div className="text-center space-y-1 relative z-10">
                <span className="font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">
                  SECTOR 616 • OFFICIAL CREDENTIAL
                </span>
                <h2 className="font-heading font-black text-sm text-white uppercase tracking-wider">
                  {customEventTitle}
                </h2>
                <div className="w-32 h-0.5 bg-[#00F0FF] mx-auto my-1"></div>
              </div>

              <div className="text-center my-auto space-y-1 relative z-10">
                <span className="font-heading font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#00F0FF] uppercase tracking-widest block">
                  {certType === 'merit'
                    ? 'CERTIFICATE OF MERIT & EXCELLENCE'
                    : certType === 'completion'
                      ? 'CERTIFICATE OF QUANTUM MASTERY'
                      : 'CERTIFICATE OF PARTICIPATION'}
                </span>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                  THIS IS PROUDLY PRESENTED TO
                </span>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide py-0.5">
                  {currentStudioStudent ? currentStudioStudent.name.toUpperCase() : 'CADET NAME'}
                </h1>
                <p className="font-mono text-xs font-bold text-cyan-300">
                  {currentStudioStudent?.department ? `DEPARTMENT OF ${currentStudioStudent.department.toUpperCase()} • ` : ''}
                  COLLEGE REG NO: {currentStudioStudent?.reg_number || 'RA0000'}
                </p>
              </div>

              <div className="flex items-end justify-between pt-3 border-t border-slate-800 text-center relative z-10">
                <div className="w-32">
                  <span className="font-serif italic text-sm text-cyan-300 block">{signatory1Name}</span>
                  <div className="w-full h-0.5 bg-slate-700 my-0.5"></div>
                  <span className="font-heading font-bold text-[9px] text-white block">{signatory1Name}</span>
                  <span className="font-mono text-[8px] text-slate-400 block">{signatory1Role}</span>
                </div>
                <div className="text-center font-mono text-[9px] text-slate-400">
                  {customDate}
                </div>
                <div className="w-32">
                  <span className="font-serif italic text-sm text-cyan-300 block">{signatory2Name}</span>
                  <div className="w-full h-0.5 bg-slate-700 my-0.5"></div>
                  <span className="font-heading font-bold text-[9px] text-white block">{signatory2Name}</span>
                  <span className="font-mono text-[8px] text-slate-400 block">{signatory2Role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: EMAIL DELIVERY & SMTP CONFIGURATION
          ========================================================================= */}
      {activeTab === 'email' && (
        <div className="space-y-6 animate-in fade-in">

          {/* Status and Overview Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-[#0A0F26]/90 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border ${smtpIsConfigured
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${smtpIsConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                  <span>{smtpIsConfigured ? 'LIVE SMTP ACTIVE • READY TO DELIVER EMAILS' : 'SMTP NOT CONFIGURED • ACTION REQUIRED'}</span>
                </span>
              </div>
              <h2 className="font-heading text-xl font-black text-white">
                Direct Email Certificate Dispatch Setup
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Connect your Gmail or college email account using a standard 16-character Google App Password. Once saved, student certificate mail requests will automatically land in real inboxes with high-res PNG certificates attached.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080B18] border border-slate-800 text-xs font-mono space-y-1.5 shrink-0">
              <div className="text-slate-400">Current Relay: <strong className="text-white">{smtpHost}:{smtpPort}</strong></div>
              <div className="text-slate-400">Active Sender: <strong className="text-cyan-300">{smtpUser || 'None (Unset)'}</strong></div>
            </div>
          </div>

          {/* Feedback banner */}
          {smtpMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-2.5 animate-in fade-in ${smtpMsg.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(245,34,69,0.3)]'
              }`}>
              {smtpMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{smtpMsg.text}</span>
            </div>
          )}

          {/* Configuration Form Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Cols: Form */}
            <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-[#087CFF]/30 bg-[#090E22]/90 space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="font-heading font-black text-base text-white uppercase tracking-wider">
                  Sender Account Credentials
                </h3>
              </div>

              <div className="space-y-4">
                {/* Sender Email */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Sender Gmail / Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 text-cyan-400" />
                    </div>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="e.g. yourcollege.event@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 focus:border-cyan-400 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Google App Password */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Google App Password (16 Characters) <span className="text-rose-400">*</span></span>
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-sans normal-case"
                    >
                      <span>Generate Google App Password</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4 text-purple-400" />
                    </div>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="Enter 16-character app password (e.g. abcd efgh ijkl mnop)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 focus:border-purple-400 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                    Note: For security, your actual password is encrypted and stored locally in the database.
                  </span>
                </div>

                {/* Server Host & Port */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 focus:border-cyan-400 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                      SMTP Port (TLS)
                    </label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(Number(e.target.value))}
                      placeholder="587"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 focus:border-cyan-400 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Sender Display Name */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    value={smtpFrom}
                    onChange={(e) => setSmtpFrom(e.target.value)}
                    placeholder="PyRank Arena Mission Control <organizer@domain.edu>"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 focus:border-cyan-400 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={smtpLoading || !smtpUser.trim() || !smtpPass.trim()}
                  onClick={handleSaveSmtp}
                  className="px-6 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {smtpLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>SAVE EMAIL CREDENTIALS</span>
                </button>
              </div>
            </div>

            {/* Right 1 Col: Test Email & Guide */}
            <div className="space-y-6">

              {/* Test Connection Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-[#090D1C]/90 space-y-4">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">
                    Verify Email Delivery
                  </h4>
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                  Send a live test dispatch to any email address to verify that your credentials work.
                </p>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Test Recipient Email
                  </label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="e.g. yourpersonal@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080B18] border border-slate-700 focus:border-emerald-400 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="button"
                  disabled={isTestingEmail || !testEmailAddress.trim()}
                  onClick={handleTestSmtp}
                  className="w-full py-2.5 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isTestingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>DISPATCHING TEST...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>SEND TEST EMAIL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instructions Card */}
              <div className="p-5 rounded-3xl bg-purple-950/20 border border-purple-500/30 text-xs font-mono text-purple-200 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-300">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>How to get a Google App Password:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                  <li>Open your <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google Account Security</a>.</li>
                  <li>Enable <strong>2-Step Verification</strong> if not already active.</li>
                  <li>In the search box at the top, type <strong>"App passwords"</strong>.</li>
                  <li>Give it an app name like <strong className="text-white">PyRank</strong> and click Create.</li>
                  <li>Copy the 16-character code (ignore spaces) and paste it into the field above.</li>
                </ol>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};
