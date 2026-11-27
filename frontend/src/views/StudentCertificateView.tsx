import React, { useState, useRef } from 'react';
import {
  Award,
  Download,
  Printer,
  Shield,
  Star,
  CheckCircle2,
  Sparkles,
  Layers,
  Flame,
  ArrowRight,
  Mail,
  Send,
  User as UserIcon,
  GraduationCap,
  X,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { User } from '../types';
import { api } from '../utils/api';
import { sounds } from '../utils/soundEffects';

interface StudentCertificateViewProps {
  user: User;
}

export const StudentCertificateView: React.FC<StudentCertificateViewProps> = ({ user }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic user-customizable details
  const [studentName, setStudentName] = useState<string>(user.name || '');
  const [department, setDepartment] = useState<string>(user.department || '');

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [targetEmail, setTargetEmail] = useState<string>(user.email || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

  const completedCount = user.completed_challenges?.length || 0;
  const isMasterClearer = completedCount >= 10;
  const certType = isMasterClearer ? 'Mastery' : 'Participation';
  const certTitle = isMasterClearer
    ? 'CERTIFICATE OF QUANTUM MASTERY'
    : 'CERTIFICATE OF PARTICIPATION';

  const certHash = `PYR-2026-${(user.reg_number || 'RA0000').toUpperCase()}-${Math.abs((user.id || 1) * 7919).toString(16).toUpperCase()}`;

  // Shared drawing function for both Download and Email attachment
  const drawCertificateToCanvas = (canvas: HTMLCanvasElement) => {
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const bgGradient = ctx.createRadialGradient(960, 540, 100, 960, 540, 1000);
    bgGradient.addColorStop(0, '#0c1630');
    bgGradient.addColorStop(1, '#040712');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // Outer & Inner Borders
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 1820, 980);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(8,124,255,0.3)';
    ctx.strokeRect(70, 70, 1780, 940);

    // Corner Ornaments
    const drawBracket = (x: number, y: number, dirX: number, dirY: number) => {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00F0FF';
      ctx.moveTo(x + dirX * 40, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dirY * 40);
      ctx.stroke();
    };
    drawBracket(50, 50, 1, 1);
    drawBracket(1870, 50, -1, 1);
    drawBracket(50, 1030, 1, -1);
    drawBracket(1870, 1030, -1, -1);

    // Header text
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = '#00F0FF';
    ctx.fillText('OFFICIAL VERIFIED CREDENTIAL • PYRANK • SECTOR 616', 960, 130);

    ctx.font = '900 32px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PYRANK 2026: SPIDER-CODE PYTHON DEBUGGING ARENA', 960, 180);

    ctx.font = '600 18px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('PROGRAMMING CLUB & DEPARTMENT OF COMPUTER SCIENCE', 960, 215);

    // Separator line
    ctx.beginPath();
    ctx.moveTo(560, 245);
    ctx.lineTo(1360, 245);
    ctx.strokeStyle = '#087CFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Award Title
    ctx.font = '900 50px "Inter", "Segoe UI", sans-serif';
    const titleGrad = ctx.createLinearGradient(600, 0, 1320, 0);
    titleGrad.addColorStop(0, '#00F0FF');
    titleGrad.addColorStop(0.5, '#FFFFFF');
    titleGrad.addColorStop(1, '#8B35FF');
    ctx.fillStyle = titleGrad;
    ctx.fillText(certTitle, 960, 320);

    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('THIS IS PROUDLY CONFERRED UPON', 960, 375);

    // Recipient Name (uses customizable studentName)
    const effectiveName = (studentName.trim() || user.name || 'Spider Cadet').toUpperCase();
    ctx.font = '900 64px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(effectiveName, 960, 460);

    // Department & Reg Number (uses customizable department)
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillStyle = '#38BDF8';
    const effectiveDept = department.trim() || user.department || '';
    const deptStr = effectiveDept ? `DEPARTMENT OF ${effectiveDept.toUpperCase()} • ` : '';
    ctx.fillText(`${deptStr}COLLEGE REGISTER NO: ${user.reg_number || 'RA0000'}`, 960, 510);

    // Citation
    ctx.font = '400 22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#CBD5E1';
    const citation = isMasterClearer
      ? 'for demonstrating complete mastery over all 10 corrupted quantum neural subroutines, neutralizing all dimensional threats with Python precision and achieving 100% completion in the Arena.'
      : 'for commendable performance and active participation in the PyRank Spider-Code Python Debugging Challenge, demonstrating solid algorithmic thinking and high-pressure debugging skills.';

    // Word wrap
    const words = citation.split(' ');
    let line = '';
    let textY = 580;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1200 && n > 0) {
        ctx.fillText(line, 960, textY);
        line = words[n] + ' ';
        textY += 34;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 960, textY);

    // Seal
    const sealY = 720;
    ctx.beginPath();
    ctx.arc(960, sealY, 52, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,240,255,0.15)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00F0FF';
    ctx.stroke();

    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillStyle = '#00F0FF';
    ctx.fillText('★ VERIFIED ★', 960, sealY - 10);
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PYRANK ARENA', 960, sealY + 8);
    ctx.fillText('2026', 960, sealY + 24);

    // Signatures
    const sigY = 880;
    ctx.font = 'italic 30px "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('Dr. K. R. Sharma', 500, sigY - 15);
    ctx.fillText('Spider-Verse Convener', 1420, sigY - 15);

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
    ctx.fillText('Dr. K. R. Sharma', 500, sigY + 28);
    ctx.fillText('Spider-Verse Convener', 1420, sigY + 28);

    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('Faculty Coordinator, CSE', 500, sigY + 50);
    ctx.fillText('Programming Club Lead', 1420, sigY + 50);

    ctx.fillText('ISSUED ON: November 27, 2026', 960, 890);

    // Verification token footer
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`AUTHENTICITY TOKEN: ${certHash} • VERIFY AT HTTPS://PYRANK.SPIDERVERSE.EDU/VERIFY`, 960, 1000);
  };

  // Download High-Resolution PNG (1920x1080)
  const handleDownloadPNG = () => {
    sounds.playWebShoot();
    const canvas = canvasRef.current || document.createElement('canvas');
    drawCertificateToCanvas(canvas);

    const effectiveName = studentName.trim() || user.name || 'cadet';
    const cleanName = effectiveName.replace(/[^a-zA-Z0-9]/g, '_');
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `PyRank_${certType}_Certificate_${cleanName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    sounds.playSuccess();
  };

  const handlePrint = () => {
    sounds.playWebShoot();
    window.print();
  };

  // Dispatch certificate to email
  const handleSendEmail = async () => {
    if (!targetEmail || !targetEmail.includes('@') || !targetEmail.includes('.')) {
      sounds.playError();
      setEmailErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    sounds.playWebShoot();
    setIsSending(true);
    setEmailErrorMsg(null);
    setEmailSuccessMsg(null);

    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      drawCertificateToCanvas(canvas);
      const base64Png = canvas.toDataURL('image/png');

      const res = await api.sendCertificateEmail({
        user_id: user.id,
        recipient_email: targetEmail.trim(),
        student_name: studentName.trim() || user.name,
        department: department.trim() || user.department || 'General',
        reg_number: user.reg_number,
        cert_type: certType,
        cert_hash: certHash,
        png_base64: base64Png
      });

      sounds.playSuccess();
      setEmailSuccessMsg(res.message || `Official certificate successfully sent to ${targetEmail}!`);
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      sounds.playError();
      setEmailErrorMsg(err?.message || 'Failed to dispatch email. Please check network connection.');
    } finally {
      setIsSending(false);
    }
  };

  // Compose in Gmail / Webmail
  const handleOpenInWebmail = () => {
    sounds.playWebShoot();
    const effectiveName = (studentName.trim() || user.name || 'Spider Cadet').toUpperCase();
    const effectiveDept = department.trim() || user.department || 'Computer Science';
    const subject = encodeURIComponent(`Official ${certType} Certificate - PyRank 2026: ${effectiveName}`);
    const body = encodeURIComponent(
`Dear ${effectiveName},

Congratulations on your performance in the PyRank 2026: Spider-Code Python Debugging Arena!

OFFICIAL CREDENTIAL DETAILS:
• Cadet Name: ${effectiveName}
• Department: Department of ${effectiveDept.toUpperCase()}
• Register No: ${user.reg_number || 'RA0000'}
• Credential: ${certTitle}
• Authenticity Token: ${certHash}
• Verification URL: https://pyrank.spiderverse.edu/verify

Issued by:
Programming Club & Department of Computer Science
PyRank Sector 616`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail || user.email || '')}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const displayEffectiveName = (studentName.trim() || user.name || 'Spider Cadet').toUpperCase();
  const displayEffectiveDept = department.trim() || user.department || '';

  return (
    <div className="p-6 sm:p-8 space-y-6 font-sans max-w-5xl mx-auto">
      {/* Hidden offscreen canvas for PNG rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>OFFICIAL CREDENTIAL RELEASED</span>
          </div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide">
            YOUR OFFICIAL CERTIFICATE
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Verified achievement credential for participation in PyRank: Spider-Code Python Debugging Arena.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sounds.playWebShoot();
              setEmailModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-pink-600 to-[#F52245] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,34,69,0.35)] flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Send to Mail</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPNG}
            className="px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[#087CFF] to-[#00F0FF] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(8,124,255,0.4)] flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SPACE TO FILL DETAILS: NAME & DEPARTMENT + SEND TO MAIL OPTION
          ========================================================================= */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-[#087CFF]/30 bg-[#0A0F26]/90 shadow-[0_0_30px_rgba(8,124,255,0.15)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-5">

          {/* Input fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Student Name Input */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-cyan-400" />
                <span>Full Name for Certificate</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#101736] border border-slate-700 focus:border-[#00F0FF] text-xs font-heading font-bold text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Updates recipient name on live certificate & downloads
              </span>
            </div>

            {/* Department Input */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#00F0FF]" />
                <span>College Department</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science, IT, AI & DS..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#101736] border border-slate-700 focus:border-[#00F0FF] text-xs font-mono text-cyan-200 placeholder-slate-500 outline-none transition-all shadow-inner"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Appears under your name as: DEPARTMENT OF {department.toUpperCase() || '...'}
              </span>
            </div>

          </div>

          {/* SEND TO MAIL Action Button */}
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => {
                sounds.playWebShoot();
                setEmailModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-pink-600 to-[#F52245] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,34,69,0.4)] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>SEND TO MAIL</span>
            </button>
          </div>

        </div>
      </div>

      {/* The Certificate Landscape Card (Printable) */}
      <div className="glass-panel w-full aspect-[1.55/1] rounded-3xl p-6 sm:p-10 border-2 border-[#00F0FF]/60 shadow-[0_0_60px_rgba(0,240,255,0.25)] relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#0c1630] via-[#080d22] to-[#040714] select-none">

        {/* Inner Double Border Frame */}
        <div className="absolute inset-4 rounded-2xl border border-[#087CFF]/30 pointer-events-none"></div>

        {/* Corner Accents */}
        <div className="absolute top-3 left-3 text-cyan-400 font-mono text-sm pointer-events-none">╔</div>
        <div className="absolute top-3 right-3 text-cyan-400 font-mono text-sm pointer-events-none">╗</div>
        <div className="absolute bottom-3 left-3 text-cyan-400 font-mono text-sm pointer-events-none">╚</div>
        <div className="absolute bottom-3 right-3 text-cyan-400 font-mono text-sm pointer-events-none">╝</div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <img src="/pyrank_icon.png" alt="watermark" className="w-96 h-96 object-contain" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 text-center space-y-1">
          <div className="flex items-center justify-between px-2 mb-1">
            <div className="flex items-center gap-2">
              <img src="/pyrank_icon.png" alt="PyRank" className="w-8 h-8 object-contain" />
              <span className="font-heading font-black text-sm tracking-wider text-white">PYRANK</span>
            </div>
            <span className="font-mono text-[9px] font-bold text-cyan-400 tracking-widest uppercase">
              SECTOR 616 • OFFICIAL CREDENTIAL
            </span>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xs tracking-wider text-slate-300">
                PROGRAMMING CLUB
              </span>
            </div>
          </div>

          <h2 className="font-heading font-black text-base sm:text-lg text-white tracking-wider uppercase">
            PYRANK 2026: SPIDER-CODE PYTHON DEBUGGING ARENA
          </h2>
          <p className="font-mono text-[10px] text-slate-400">
            PROGRAMMING CLUB & DEPARTMENT OF COMPUTER SCIENCE
          </p>

          <div className="w-48 h-0.5 bg-[#00F0FF] mx-auto my-2 shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
        </div>

        {/* Center Recipient Content */}
        <div className="relative z-10 text-center my-auto space-y-1.5">
          <span className="font-heading font-black text-xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#00F0FF] uppercase tracking-widest block drop-shadow-md">
            {certTitle}
          </span>

          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
            THIS IS PROUDLY CONFERRED UPON
          </span>

          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-wide py-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            {displayEffectiveName}
          </h1>

          <p className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
            {displayEffectiveDept ? `DEPARTMENT OF ${displayEffectiveDept.toUpperCase()} • ` : ''}
            COLLEGE REGISTER NO: {user.reg_number || 'RA0000'}
          </p>

          <p className="font-sans text-xs text-slate-300 max-w-xl mx-auto leading-relaxed pt-1">
            {isMasterClearer
              ? 'for demonstrating complete mastery over all 10 corrupted quantum neural subroutines, neutralizing all dimensional threats with Python precision and achieving 100% completion in the Arena.'
              : 'for active and commendable participation in the PyRank Spider-Code Python Debugging Challenge, demonstrating solid algorithmic thinking, analytical capabilities, and high-pressure debugging skills.'}
          </p>
        </div>

        {/* Bottom Signatures & Date */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-end justify-between px-4">
          {/* Signatory 1 */}
          <div className="text-center w-40">
            <span className="font-serif italic text-lg text-cyan-300 block leading-tight">
              Dr. K. R. Sharma
            </span>
            <div className="w-full h-0.5 bg-slate-700 my-1"></div>
            <span className="font-heading font-bold text-[10px] text-white block">
              Dr. K. R. Sharma
            </span>
            <span className="font-mono text-[8px] text-slate-400 block">
              Faculty Coordinator, CSE
            </span>
          </div>

          {/* Center Medallion / Date */}
          <div className="text-center flex flex-col items-center">
            <div className="w-11 h-11 rounded-full border border-[#00F0FF] bg-cyan-950/40 text-cyan-300 flex flex-col items-center justify-center mb-1 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Star className="w-4 h-4 fill-current text-cyan-400" />
              <span className="text-[7px] font-mono font-bold">VERIFIED</span>
            </div>
            <span className="font-mono text-[9px] text-slate-400 block">
              November 27, 2026
            </span>
          </div>

          {/* Signatory 2 */}
          <div className="text-center w-40">
            <span className="font-serif italic text-lg text-cyan-300 block leading-tight">
              Spider-Verse Convener
            </span>
            <div className="w-full h-0.5 bg-slate-700 my-1"></div>
            <span className="font-heading font-bold text-[10px] text-white block">
              Spider-Verse Convener
            </span>
            <span className="font-mono text-[8px] text-slate-400 block">
              Programming Club Lead
            </span>
          </div>
        </div>

        {/* Footer Hash */}
        <div className="relative z-10 text-center mt-2 text-[8px] font-mono text-slate-500">
          AUTHENTICITY TOKEN: {certHash} • VERIFY AT HTTPS://PYRANK.SPIDERVERSE.EDU/VERIFY
        </div>
      </div>

      {/* =========================================================================
          SEND TO MAIL PROMPT MODAL
          ========================================================================= */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 border-2 border-purple-500/60 shadow-[0_0_60px_rgba(139,53,255,0.4)] relative overflow-hidden bg-[#0A0E24]">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(139,53,255,0.4)]">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase font-bold block">
                    OFFICIAL CREDENTIAL DISPATCH
                  </span>
                  <h3 className="font-heading font-black text-xl text-white">
                    SEND CERTIFICATE TO MAIL
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-5 leading-relaxed">
              Your official certificate for <strong className="text-white">{displayEffectiveName}</strong> ({displayEffectiveDept ? `Dept of ${displayEffectiveDept}` : 'Cadet'}) will be dispatched immediately to the email address entered below.
            </p>

            {/* Email Input Field */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Recipient Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-purple-400" />
                  </div>
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="Enter email (e.g. student@gmail.com)..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#101528] border border-slate-700 focus:border-purple-400 text-xs font-mono text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              {/* Credential Summary Box */}
              <div className="p-3.5 rounded-xl bg-[#080B18]/80 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Name:</span>
                  <span className="text-white font-bold">{displayEffectiveName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="text-cyan-300 font-bold">{displayEffectiveDept || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Register No:</span>
                  <span className="text-slate-300 font-bold">{user.reg_number || 'RA0000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate Type:</span>
                  <span className="text-emerald-400 font-bold">{certType}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-1.5 mt-1">
                  <span className="text-slate-500">Official Sender:</span>
                  <span className="text-purple-300 font-bold font-mono">251300588077@srcas.ac.in</span>
                </div>
              </div>

              {emailErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{emailErrorMsg}</span>
                </div>
              )}

              {emailSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{emailSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenInWebmail}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Compose and send via your browser's Gmail with prefilled certificate credentials"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Gmail (Webmail)</span>
              </button>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSending || !targetEmail.trim()}
                  onClick={handleSendEmail}
                  className="px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider bg-gradient-to-r from-purple-600 via-pink-600 to-[#F52245] hover:brightness-110 active:scale-95 text-white transition-all shadow-[0_0_20px_rgba(139,53,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>DISPATCHING...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>DISPATCH TO EMAIL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
