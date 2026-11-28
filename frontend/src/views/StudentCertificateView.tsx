import React, { useState, useRef } from 'react';
import {
  Download,
  Printer,
  CheckCircle2,
  Mail,
  Send,
  User as UserIcon,
  GraduationCap,
  X,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Award
} from 'lucide-react';
import { User } from '../types';
import { api } from '../utils/api';
import { sounds } from '../utils/soundEffects';

interface StudentCertificateViewProps {
  user: User;
}

export const StudentCertificateView: React.FC<StudentCertificateViewProps> = ({ user }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic customizable details
  const [studentName, setStudentName] = useState<string>(user.name || '');
  const [department, setDepartment] = useState<string>(user.department || '');

  // Email modal & dispatch state
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [targetEmail, setTargetEmail] = useState<string>(user.email || '');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

  const completedCount = user.completed_challenges?.length || 0;
  const isMasterClearer = completedCount >= 10;
  const certType = isMasterClearer ? 'Mastery' : 'Participation';
  const certHash = `PYR-2026-${(user.reg_number || 'RA0000').toUpperCase()}-${Math.abs((user.id || 1) * 7919).toString(16).toUpperCase()}`;

  const displayEffectiveName = studentName.trim() || user.name || 'Spider Cadet';
  const displayEffectiveDept = department.trim()
    ? department.toUpperCase().startsWith('DEPARTMENT OF')
      ? department.toUpperCase()
      : `DEPARTMENT OF ${department.toUpperCase()}`
    : user.department
    ? `DEPARTMENT OF ${user.department.toUpperCase()}`
    : 'DEPARTMENT OF COMPUTER SCIENCE';

  // Draw the high-resolution certificate on an HTML5 canvas for PNG download and Email attachment
  const drawCertificateToCanvas = async (canvas: HTMLCanvasElement): Promise<void> => {
    canvas.width = 2048;
    canvas.height = 1364; // Exactly 2x scaling of 1024 x 682 template
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load template image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/certificate_template.jpg';
    await new Promise<void>((resolve, reject) => {
      if (img.complete && img.naturalWidth !== 0) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load certificate template image'));
      }
    });

    // 1. Draw official template image as base
    ctx.drawImage(img, 0, 0, 2048, 1364);

    // 2. Draw Dynamic Cursive Student Name above the underline (underline is at y = 646)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#0A1931';

    let nameFontSize = 74;
    ctx.font = `italic 700 ${nameFontSize}px 'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Segoe Script', cursive`;
    let nameMetrics = ctx.measureText(displayEffectiveName);
    while (nameMetrics.width > 1050 && nameFontSize > 34) {
      nameFontSize -= 4;
      ctx.font = `italic 700 ${nameFontSize}px 'Dancing Script', 'Great Vibes', 'Brush Script MT', 'Segoe Script', cursive`;
      nameMetrics = ctx.measureText(displayEffectiveName);
    }

    // Baseline aligned just above underline
    ctx.fillText(displayEffectiveName, 1024, 638);
    ctx.restore();

    // 3. Draw Dynamic Department Name flanked by matching navy horizontal lines (at y = 720)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0A1931';

    let deptFontSize = 32;
    ctx.font = `700 ${deptFontSize}px 'Inter', 'Segoe UI', Arial, sans-serif`;
    let deptMetrics = ctx.measureText(displayEffectiveDept);
    while (deptMetrics.width > 950 && deptFontSize > 18) {
      deptFontSize -= 2;
      ctx.font = `700 ${deptFontSize}px 'Inter', 'Segoe UI', Arial, sans-serif`;
      deptMetrics = ctx.measureText(displayEffectiveDept);
    }

    const deptY = 720;
    ctx.fillText(displayEffectiveDept, 1024, deptY);

    // Framing horizontal lines
    const lineY = deptY;
    const lineLeftStart = 476;
    const lineLeftEnd = Math.max(lineLeftStart, 1024 - (deptMetrics.width / 2) - 25);
    const lineRightStart = Math.min(1620, 1024 + (deptMetrics.width / 2) + 25);
    const lineRightEnd = 1620;

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#171B38';
    if (lineLeftEnd > lineLeftStart) {
      ctx.moveTo(lineLeftStart, lineY);
      ctx.lineTo(lineLeftEnd, lineY);
    }
    if (lineRightEnd > lineRightStart) {
      ctx.moveTo(lineRightStart, lineY);
      ctx.lineTo(lineRightEnd, lineY);
    }
    ctx.stroke();
    ctx.restore();
  };

  // Download High-Resolution PNG (2048x1364)
  const handleDownloadPNG = async () => {
    sounds.playWebShoot();
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      await drawCertificateToCanvas(canvas);

      const cleanName = displayEffectiveName.replace(/[^a-zA-Z0-9]/g, '_');
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `PyRank_${certType}_Certificate_${cleanName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      sounds.playSuccess();
    } catch (err) {
      console.error('Error generating certificate PNG:', err);
      sounds.playError();
    } finally {
      setIsGenerating(false);
    }
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
      await drawCertificateToCanvas(canvas);
      const base64Png = canvas.toDataURL('image/png');

      const res = await api.sendCertificateEmail({
        user_id: user.id,
        recipient_email: targetEmail.trim(),
        student_name: displayEffectiveName,
        department: displayEffectiveDept,
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
    const subject = encodeURIComponent(`Official Participation Certificate - PyRank 2026: ${displayEffectiveName}`);
    const body = encodeURIComponent(
      `Dear ${displayEffectiveName},

Congratulations on your active participation in PyRank 2026: Spider-Code Python Debugging Arena organized by the Programming Club of SRCAS!

OFFICIAL CREDENTIAL DETAILS:
• Recipient Name: ${displayEffectiveName}
• Department: ${displayEffectiveDept}
• College Register No: ${user.reg_number || 'RA0000'}
• Event: PyRank 2026: Python Debugging Competition
• Organizing Body: Programming Club & Department of Computer Science, SRCAS
• Credential Hash: ${certHash}
• Verification Portal: https://pyrank.spiderverse.edu/verify

Issued by:
Programming Club, SRCAS
Keep Coding. Keep Conquering.`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail || user.email || '')}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-5xl mx-auto">
      {/* Hidden offscreen canvas for crisp 2048x1364 rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>OFFICIAL CREDENTIAL RELEASED</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-wide">
            PARTICIPANT CERTIFICATE
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Official certificate of participation for PyRank: Python Debugging Competition, SRCAS.
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
            className="px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadPNG}
            className="px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[#087CFF] to-[#00F0FF] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(8,124,255,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
                  placeholder="e.g. Computer Science, CSE, IT..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#101736] border border-slate-700 focus:border-[#00F0FF] text-xs font-mono text-cyan-200 placeholder-slate-500 outline-none transition-all shadow-inner"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                Appears as: {displayEffectiveDept}
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

      {/* =========================================================================
          THE OFFICIAL WHITE & CYBER-BLUE PARTICIPANT CERTIFICATE
          ========================================================================= */}
      <div
        id="printable-certificate"
        className="relative w-full aspect-[1.5015/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(8,124,255,0.25)] border-2 border-cyan-500/40 bg-white select-none"
      >
        {/* Clean Official Certificate Template Background */}
        <img
          src="/certificate_template.jpg"
          alt="PyRank Official Participant Certificate"
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Dynamic Cursive Student Name (positioned directly above the underline at 41.5%) */}
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
              fontSize: 'clamp(20px, 4.3vw, 54px)',
              lineHeight: 1.15,
            }}
          >
            {displayEffectiveName}
          </span>
        </div>

        {/* Dynamic Department Name (centered at 52.8% flanked by matching horizontal lines) */}
        <div
          className="absolute pointer-events-none flex items-center justify-center gap-2 sm:gap-4 px-4"
          style={{
            top: '52.8%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
          }}
        >
          <div className="h-[2px] sm:h-[2.5px] bg-[#171B38] flex-1 max-w-[170px]" />
          <span
            className="font-sans font-bold text-[#0A1931] uppercase tracking-wider shrink-0 px-2"
            style={{
              fontSize: 'clamp(9px, 1.6vw, 19px)',
            }}
          >
            {displayEffectiveDept}
          </span>
          <div className="h-[2px] sm:h-[2.5px] bg-[#171B38] flex-1 max-w-[170px]" />
        </div>
      </div>

      {/* Verification footer info */}
      <div className="text-center font-mono text-[10px] text-slate-500 pt-1">
        AUTHENTICITY TOKEN: <span className="text-cyan-400 font-bold">{certHash}</span> • OFFICIAL CREDENTIAL ISSUED BY PROGRAMMING CLUB, SRCAS
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
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-5 leading-relaxed">
              Your official certificate for <strong className="text-white">{displayEffectiveName}</strong> ({displayEffectiveDept}) will be dispatched immediately to the email address entered below.
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
                  <span className="text-cyan-300 font-bold">{displayEffectiveDept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Register No:</span>
                  <span className="text-slate-300 font-bold">{user.reg_number || 'RA0000'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Certificate Type:</span>
                  <span className="text-emerald-400 font-bold">Participation (PyRank)</span>
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
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
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
