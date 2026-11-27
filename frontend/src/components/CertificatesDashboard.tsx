import React, { useState, useRef } from 'react';
import {
  Award,
  Trophy,
  Download,
  Printer,
  Search,
  Filter,
  Eye,
  Sparkles,
  GraduationCap,
  FileCheck,
  Shield,
  CheckCircle2,
  X,
  Sliders,
  Calendar,
  Building,
  User as UserIcon,
  Check,
  Star
} from 'lucide-react';
import { AdminStudent, LeaderboardEntry } from '../types';
import { sounds } from '../utils/soundEffects';

interface CertificatesDashboardProps {
  students: AdminStudent[];
  leaderboard: LeaderboardEntry[];
}

export const CertificatesDashboard: React.FC<CertificatesDashboardProps> = ({
  students = [],
  leaderboard = []
}) => {
  // Top 2 Tabs as requested: participation certificate & certificate generation
  const [activeSubTab, setActiveSubTab] = useState<'participation' | 'generation'>('participation');

  // Search & Filter state for Participation tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterProgress, setFilterProgress] = useState<'all' | 'completed' | 'active'>('all');

  // Preview Modal state
  const [previewStudent, setPreviewStudent] = useState<AdminStudent | null>(null);
  const [previewType, setPreviewType] = useState<'participation' | 'merit' | 'completion'>('participation');

  // Generator Studio state
  const [certType, setCertType] = useState<'participation' | 'merit' | 'completion'>('participation');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? String(students[0].id) : ''
  );
  const [customEventTitle, setCustomEventTitle] = useState('PYRANK 2026: SPIDER-CODE PYTHON DEBUGGING ARENA');
  const [customOrg, setCustomOrg] = useState('PROGRAMMING CLUB & DEPARTMENT OF COMPUTER SCIENCE');
  const [customDate, setCustomDate] = useState('November 27, 2026');
  const [signatory1Name, setSignatory1Name] = useState('Dr. K. R. Sharma');
  const [signatory1Role, setSignatory1Role] = useState('Faculty Coordinator, CSE');
  const [signatory2Name, setSignatory2Name] = useState('Spider-Verse Convener');
  const [signatory2Role, setSignatory2Role] = useState('Programming Club Lead');
  const [themeTemplate, setThemeTemplate] = useState<'cyber' | 'gold' | 'emerald'>('cyber');

  // Hidden Canvas ref for instant PNG export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Unique departments for filter dropdown
  const departments = Array.from(
    new Set(students.map(s => s.department?.trim()).filter(Boolean))
  ) as string[];

  // Filtered students for participation table
  const filteredStudents = students.filter(student => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      student.name.toLowerCase().includes(q) ||
      student.reg_number.toLowerCase().includes(q) ||
      (student.department && student.department.toLowerCase().includes(q)) ||
      student.email.toLowerCase().includes(q);

    const matchesDept = filterDept === 'all' || student.department?.toLowerCase() === filterDept.toLowerCase();

    let matchesProgress = true;
    if (filterProgress === 'completed') {
      matchesProgress = student.completed_count >= 10;
    } else if (filterProgress === 'active') {
      matchesProgress = student.completed_count > 0 || student.points > 0;
    }

    return matchesQuery && matchesDept && matchesProgress;
  });

  // Helper to find selected student object in generator
  const currentStudioStudent: AdminStudent | undefined =
    students.find(s => String(s.id) === selectedStudentId) || students[0];

  // Helper to get leaderboard rank of a student
  const getStudentRank = (studentId: number): number | undefined => {
    const entry = leaderboard.find(l => l.id === studentId);
    return entry?.rank;
  };

  // High-Resolution 1920x1080 HTML5 Canvas PNG Generator
  const downloadCertificatePNG = (
    student: AdminStudent,
    type: 'participation' | 'merit' | 'completion',
    theme: 'cyber' | 'gold' | 'emerald' = themeTemplate
  ) => {
    sounds.playWebShoot();
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rank = getStudentRank(student.id);

    // 1. Background Gradient
    const bgGradient = ctx.createRadialGradient(960, 540, 100, 960, 540, 1000);
    if (theme === 'gold') {
      bgGradient.addColorStop(0, '#1c1508');
      bgGradient.addColorStop(1, '#080602');
    } else if (theme === 'emerald') {
      bgGradient.addColorStop(0, '#061c14');
      bgGradient.addColorStop(1, '#020a06');
    } else {
      // cyber
      bgGradient.addColorStop(0, '#0c1630');
      bgGradient.addColorStop(1, '#040712');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1920, 1080);

    // 2. Corner Aesthetic Cyber Glyphs & Accents
    ctx.strokeStyle = theme === 'gold' ? '#F59E0B' : theme === 'emerald' ? '#10B981' : '#00F0FF';
    ctx.lineWidth = 3;

    // Outer Border
    ctx.strokeRect(50, 50, 1820, 980);

    // Inner Border
    ctx.lineWidth = 1;
    ctx.strokeStyle = theme === 'gold' ? 'rgba(245,158,11,0.3)' : theme === 'emerald' ? 'rgba(16,185,129,0.3)' : 'rgba(8,124,255,0.3)';
    ctx.strokeRect(70, 70, 1780, 940);

    // Corner Ornaments
    const drawCornerBracket = (x: number, y: number, dirX: number, dirY: number) => {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = theme === 'gold' ? '#F59E0B' : theme === 'emerald' ? '#10B981' : '#00F0FF';
      ctx.moveTo(x + dirX * 40, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dirY * 40);
      ctx.stroke();
    };
    drawCornerBracket(50, 50, 1, 1);
    drawCornerBracket(1870, 50, -1, 1);
    drawCornerBracket(50, 1030, 1, -1);
    drawCornerBracket(1870, 1030, -1, -1);

    // 3. Top Header / Brand
    ctx.textAlign = 'center';

    // Event Sub-Header
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = theme === 'gold' ? '#FCD34D' : theme === 'emerald' ? '#6EE7B7' : '#00F0FF';
    ctx.fillText('OFFICIAL VERIFIED CREDENTIAL • PYRANK • SECTOR 616', 960, 130);

    // Event Main Title
    ctx.font = '900 32px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(customEventTitle, 960, 180);

    // Organizing Body
    ctx.font = '600 18px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(customOrg, 960, 215);

    // Glowing Separator Line
    ctx.beginPath();
    ctx.moveTo(560, 245);
    ctx.lineTo(1360, 245);
    ctx.strokeStyle = theme === 'gold' ? '#F59E0B' : theme === 'emerald' ? '#10B981' : '#087CFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Certificate Award Title
    let awardTitle = 'CERTIFICATE OF PARTICIPATION';
    if (type === 'merit') awardTitle = 'CERTIFICATE OF MERIT & EXCELLENCE';
    if (type === 'completion') awardTitle = 'CERTIFICATE OF QUANTUM MASTERY';

    ctx.font = '900 50px "Inter", "Segoe UI", sans-serif';
    const titleGrad = ctx.createLinearGradient(600, 0, 1320, 0);
    if (theme === 'gold') {
      titleGrad.addColorStop(0, '#F59E0B');
      titleGrad.addColorStop(0.5, '#FDE68A');
      titleGrad.addColorStop(1, '#F59E0B');
    } else if (theme === 'emerald') {
      titleGrad.addColorStop(0, '#10B981');
      titleGrad.addColorStop(0.5, '#A7F3D0');
      titleGrad.addColorStop(1, '#10B981');
    } else {
      titleGrad.addColorStop(0, '#00F0FF');
      titleGrad.addColorStop(0.5, '#FFFFFF');
      titleGrad.addColorStop(1, '#8B35FF');
    }
    ctx.fillStyle = titleGrad;
    ctx.fillText(awardTitle, 960, 320);

    // Sub-text
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('THIS IS PROUDLY PRESENTED TO', 960, 375);

    // 5. Recipient Student Name
    ctx.font = '900 64px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(student.name.toUpperCase(), 960, 460);

    // Student Reg Number & Department
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillStyle = theme === 'gold' ? '#FCD34D' : theme === 'emerald' ? '#6EE7B7' : '#38BDF8';
    const deptText = student.department ? `DEPARTMENT OF ${student.department.toUpperCase()} • ` : '';
    ctx.fillText(`${deptText}COLLEGE REGISTER NO: ${student.reg_number}`, 960, 510);

    // 6. Award Citation Description
    ctx.font = '400 22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#CBD5E1';
    let citation =
      'for commendable performance and active participation in the PyRank Spider-Code Python Debugging Challenge, demonstrating solid algorithmic thinking and high-pressure debugging skills.';

    if (type === 'merit') {
      const rankStr = rank ? `securing Rank #${rank}` : 'securing top rank';
      citation = `for extraordinary algorithmic technical excellence, ${rankStr} with ${student.points} points in the PyRank Spider-Code Python Debugging Arena.`;
    } else if (type === 'completion') {
      citation =
        'for mastering all 10 corrupted quantum neural subroutines, neutralizing all dimensional threats with Python precision and achieving 100% completion in the Arena.';
    }

    // Wrap citation text
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

    // 7. Middle Seal / Verification Medallion
    const sealY = 720;
    ctx.beginPath();
    ctx.arc(960, sealY, 52, 0, Math.PI * 2);
    ctx.fillStyle = theme === 'gold' ? 'rgba(245,158,11,0.15)' : theme === 'emerald' ? 'rgba(16,185,129,0.15)' : 'rgba(0,240,255,0.15)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme === 'gold' ? '#F59E0B' : theme === 'emerald' ? '#10B981' : '#00F0FF';
    ctx.stroke();

    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillStyle = theme === 'gold' ? '#FCD34D' : theme === 'emerald' ? '#6EE7B7' : '#00F0FF';
    ctx.fillText('★ VERIFIED ★', 960, sealY - 10);
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PYRANK ARENA', 960, sealY + 8);
    ctx.fillText('2026', 960, sealY + 24);

    // 8. Signatures Section
    const sigY = 880;

    // Left Signature: Coordinator
    ctx.beginPath();
    ctx.moveTo(350, sigY);
    ctx.lineTo(650, sigY);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fancy Signature Flourish
    ctx.font = 'italic 30px "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = theme === 'gold' ? '#FCD34D' : theme === 'emerald' ? '#6EE7B7' : '#38BDF8';
    ctx.fillText(signatory1Name, 500, sigY - 15);

    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(signatory1Name, 500, sigY + 28);
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(signatory1Role, 500, sigY + 50);

    // Right Signature: Lead
    ctx.beginPath();
    ctx.moveTo(1270, sigY);
    ctx.lineTo(1570, sigY);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'italic 30px "Brush Script MT", "Segoe Script", cursive';
    ctx.fillStyle = theme === 'gold' ? '#FCD34D' : theme === 'emerald' ? '#6EE7B7' : '#38BDF8';
    ctx.fillText(signatory2Name, 1420, sigY - 15);

    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(signatory2Name, 1420, sigY + 28);
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(signatory2Role, 1420, sigY + 50);

    // Date in center
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`ISSUED ON: ${customDate}`, 960, 890);

    // 9. Bottom Cryptographic Verification Bar
    const certHash = `PYR-2026-${student.reg_number.toUpperCase()}-${Math.abs(student.id * 7919).toString(16).toUpperCase()}`;
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`AUTHENTICITY TOKEN: ${certHash} • VERIFY AT HTTPS://PYRANK.SPIDERVERSE.EDU/VERIFY`, 960, 1000);

    // Trigger direct browser PNG download
    const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `PyRank_${type}_Certificate_${cleanName}.png`;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    sounds.playSuccess();
  };

  // Browser Print Dialog handler for physical or PDF print
  const handlePrintCertificate = () => {
    sounds.playWebShoot();
    window.print();
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      {/* Hidden Canvas for High-Resolution PNG export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* =========================================================================
          PAGE HEADER: CERTIFICATES & CREDENTIALS VAULT
          ========================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Official Credentials Vault</span>
          </div>
          <h1 className="font-heading text-3xl font-black text-white tracking-wide">
            CERTIFICATES DASHBOARD
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Generate, customize, and issue verified event credentials and participation certificates for all registered PyRank cadets.
          </p>
        </div>

        {/* Action Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>CRYPTOGRAPHICALLY VERIFIED</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOP SUB-TABS: 2 MAIN OPTIONS (Participation Certificate & Certificate Generation)
          ========================================================================= */}
      <div className="flex items-center p-1.5 bg-[#080B18] border border-slate-800 rounded-2xl w-full sm:w-fit gap-2">
        <button
          type="button"
          onClick={() => {
            sounds.playWebShoot();
            setActiveSubTab('participation');
          }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'participation'
              ? 'bg-gradient-to-r from-[#087CFF] to-[#00F0FF] text-black shadow-[0_0_20px_rgba(8,124,255,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Participation Certificate</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playWebShoot();
            setActiveSubTab('generation');
          }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'generation'
              ? 'bg-gradient-to-r from-[#F52245] via-purple-600 to-[#8B35FF] text-white shadow-[0_0_20px_rgba(245,34,69,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Certificate Generation</span>
        </button>
      </div>

      {/* =========================================================================
          OPTION 1: PARTICIPATION CERTIFICATE HUB
          ========================================================================= */}
      {activeSubTab === 'participation' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-[#080B18]/70">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Total Participants Eligible
              </span>
              <p className="text-3xl font-heading font-black text-white mt-1">
                {students.length}
              </p>
              <p className="text-[10px] font-mono text-cyan-400 mt-1">
                All registered student cadets
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-[#080B18]/70">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Departments Represented
              </span>
              <p className="text-3xl font-heading font-black text-purple-300 mt-1">
                {departments.length}
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-1">
                {departments.join(', ') || 'General College'}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-[#080B18]/70">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                10/10 Master Clearers
              </span>
              <p className="text-3xl font-heading font-black text-emerald-400 mt-1">
                {students.filter(s => s.completed_count >= 10).length}
              </p>
              <p className="text-[10px] font-mono text-emerald-300 mt-1">
                Eligible for Mastery Distinction
              </p>
            </div>
          </div>

          {/* Search, Filter & Bulk Controls */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search cadet, reg number, department..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-[#00F0FF]"
              />
            </div>

            {/* Department and Status Filter */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-slate-300 font-mono outline-none focus:border-cyan-400"
              >
                <option value="all">All Departments ({students.length})</option>
                {departments.map(d => (
                  <option key={d} value={d}>
                    Dept: {d}
                  </option>
                ))}
              </select>

              <select
                value={filterProgress}
                onChange={e => setFilterProgress(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-slate-300 font-mono outline-none focus:border-cyan-400"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed 10/10</option>
                <option value="active">Active Solvers (Pts &gt; 0)</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  sounds.playSuccess();
                  filteredStudents.slice(0, 10).forEach(student => {
                    downloadCertificatePNG(student, 'participation');
                  });
                }}
                className="px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] ml-auto"
                title="Download certificates for current filtered cadets"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Batch Download ({Math.min(filteredStudents.length, 10)})</span>
              </button>
            </div>
          </div>

          {/* Table of Eligible Participants */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl bg-[#090D1C]/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080B18]/90 text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6 w-16 text-center">#</th>
                    <th className="py-4 px-6">Participant Cadet</th>
                    <th className="py-4 px-6">Register No.</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6 text-center">Nodes Cleared</th>
                    <th className="py-4 px-6 text-right">Score</th>
                    <th className="py-4 px-6 text-center">Certificate Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                        No participants found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                      const isFinished = student.completed_count >= 10;
                      return (
                        <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6 text-center text-slate-500 font-semibold">
                            {idx + 1}
                          </td>

                          {/* Cadet Name */}
                          <td className="py-4 px-6">
                            <span className="font-heading font-bold text-white text-sm block">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {student.email}
                            </span>
                          </td>

                          {/* Register Number */}
                          <td className="py-4 px-6 text-slate-300 font-semibold">
                            {student.reg_number}
                          </td>

                          {/* Department */}
                          <td className="py-4 px-6">
                            {student.department ? (
                              <span className="px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px]">
                                {student.department}
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          {/* Nodes Cleared */}
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                                isFinished
                                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
                              }`}
                            >
                              {student.completed_count} / 10
                            </span>
                          </td>

                          {/* Score */}
                          <td className="py-4 px-6 text-right font-heading font-black text-cyan-400 text-sm">
                            {student.points} <span className="text-[10px] text-slate-400 font-mono">PTS</span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>READY</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Preview Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  sounds.playWebShoot();
                                  setPreviewStudent(student);
                                  setPreviewType(isFinished ? 'completion' : 'participation');
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-cyan-300 hover:text-white bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 transition-all flex items-center gap-1"
                                title="Preview Certificate"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>

                              {/* Download PNG Button */}
                              <button
                                type="button"
                                onClick={() => downloadCertificatePNG(student, isFinished ? 'completion' : 'participation')}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-emerald-300 hover:text-white bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 transition-all flex items-center gap-1"
                                title="Download High-Res PNG"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PNG</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          OPTION 2: CERTIFICATE GENERATION & CUSTOM STUDIO
          ========================================================================= */}
      {activeSubTab === 'generation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Controls & Studio Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-[#080B18]/80 space-y-5">
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Certificate Studio Configurator</span>
              </div>

              {/* 1. Certificate Type */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-2 uppercase">
                  1. Certificate Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playWebShoot();
                      setCertType('participation');
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all text-center ${
                      certType === 'participation'
                        ? 'bg-cyan-950/80 border-[#00F0FF] text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-[#080B18] border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Participation
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playWebShoot();
                      setCertType('merit');
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all text-center ${
                      certType === 'merit'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-[#080B18] border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Merit / Winner
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playWebShoot();
                      setCertType('completion');
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all text-center ${
                      certType === 'completion'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-[#080B18] border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    10/10 Mastery
                  </button>
                </div>
              </div>

              {/* 2. Target Recipient Student */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1 uppercase">
                  2. Target Recipient Cadet
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-white font-mono outline-none focus:border-[#00F0FF]"
                >
                  {students.map(s => {
                    const r = getStudentRank(s.id);
                    const rankBadge = r ? `[Rank #${r}] ` : '';
                    return (
                      <option key={s.id} value={String(s.id)}>
                        {rankBadge}{s.name} ({s.reg_number}) - {s.department || 'General'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 3. Event Title & Organizing Body */}
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
                    Organizing Department / Club
                  </label>
                  <input
                    type="text"
                    value={customOrg}
                    onChange={e => setCustomOrg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1 uppercase">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080B18] border border-slate-700 text-xs text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* 4. Signatories */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1 uppercase">
                    Signatory 1 (Name & Role)
                  </label>
                  <input
                    type="text"
                    value={signatory1Name}
                    onChange={e => setSignatory1Name(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#080B18] border border-slate-700 text-xs text-white font-mono mb-1.5 outline-none focus:border-cyan-400"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={signatory1Role}
                    onChange={e => setSignatory1Role(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#080B18] border border-slate-700 text-xs text-slate-400 font-mono outline-none focus:border-cyan-400"
                    placeholder="Designation"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold text-slate-400 mb-1 uppercase">
                    Signatory 2 (Name & Role)
                  </label>
                  <input
                    type="text"
                    value={signatory2Name}
                    onChange={e => setSignatory2Name(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#080B18] border border-slate-700 text-xs text-white font-mono mb-1.5 outline-none focus:border-cyan-400"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={signatory2Role}
                    onChange={e => setSignatory2Role(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#080B18] border border-slate-700 text-xs text-slate-400 font-mono outline-none focus:border-cyan-400"
                    placeholder="Designation"
                  />
                </div>
              </div>

              {/* 5. Theme Template */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
                  5. Visual Theme Palette
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setThemeTemplate('cyber')}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border flex items-center justify-center gap-1.5 ${
                      themeTemplate === 'cyber'
                        ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF]'
                        : 'bg-[#080B18] border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]"></span>
                    Cyber
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeTemplate('gold')}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border flex items-center justify-center gap-1.5 ${
                      themeTemplate === 'gold'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#080B18] border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Gold
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeTemplate('emerald')}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border flex items-center justify-center gap-1.5 ${
                      themeTemplate === 'emerald'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#080B18] border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    Emerald
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => currentStudioStudent && downloadCertificatePNG(currentStudioStudent, certType, themeTemplate)}
                  className="flex-1 py-3 px-4 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[#087CFF] to-[#00F0FF] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(8,124,255,0.4)] flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="py-3 px-5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive Certificate Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase">
                <Eye className="w-4 h-4" />
                Live Certificate Preview (16:9 Landscape)
              </span>
              <span>Vector Render Online</span>
            </div>

            {/* The Certificate Preview Canvas Box */}
            <div
              id="certificate-print-area"
              className={`w-full aspect-[1.55/1] rounded-3xl p-6 sm:p-8 border-2 transition-all relative overflow-hidden flex flex-col justify-between shadow-2xl select-none ${
                themeTemplate === 'gold'
                  ? 'bg-gradient-to-br from-[#1c1508] via-[#0e0a04] to-[#050402] border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)]'
                  : themeTemplate === 'emerald'
                  ? 'bg-gradient-to-br from-[#061c14] via-[#04100c] to-[#020604] border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.25)]'
                  : 'bg-gradient-to-br from-[#0d1633] via-[#080d22] to-[#040714] border-[#00F0FF]/80 shadow-[0_0_50px_rgba(0,240,255,0.25)]'
              }`}
            >
              {/* Inner Decorative Double Border */}
              <div
                className={`absolute inset-3 rounded-2xl border pointer-events-none ${
                  themeTemplate === 'gold'
                    ? 'border-amber-500/30'
                    : themeTemplate === 'emerald'
                    ? 'border-emerald-500/30'
                    : 'border-[#087CFF]/30'
                }`}
              ></div>

              {/* Corner Cyber Brackets */}
              <div className="absolute top-2 left-2 text-cyan-400 font-mono text-xs pointer-events-none">╔</div>
              <div className="absolute top-2 right-2 text-cyan-400 font-mono text-xs pointer-events-none">╗</div>
              <div className="absolute bottom-2 left-2 text-cyan-400 font-mono text-xs pointer-events-none">╚</div>
              <div className="absolute bottom-2 right-2 text-cyan-400 font-mono text-xs pointer-events-none">╝</div>

              {/* Watermark in background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <img src="/pyrank_icon.png" alt="watermark" className="w-80 h-80 object-contain" />
              </div>

              {/* Top Certificate Header */}
              <div className="relative z-10 text-center space-y-1">
                <div className="flex items-center justify-between px-2 mb-1">
                  <div className="flex items-center gap-2">
                    <img src="/pyrank_icon.png" alt="PyRank" className="w-7 h-7 object-contain" />
                    <span className="font-heading font-black text-xs tracking-wider text-white">PYRANK</span>
                  </div>
                  <span
                    className={`font-mono text-[9px] font-bold tracking-widest uppercase ${
                      themeTemplate === 'gold'
                        ? 'text-amber-400'
                        : themeTemplate === 'emerald'
                        ? 'text-emerald-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    SECTOR 616 • OFFICIAL CREDENTIAL
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-[10px] tracking-wider text-slate-300">
                      PROGRAMMING CLUB
                    </span>
                  </div>
                </div>

                <h2 className="font-heading font-black text-sm sm:text-base text-white tracking-wider uppercase">
                  {customEventTitle}
                </h2>
                <p className="font-mono text-[10px] text-slate-400">
                  {customOrg}
                </p>

                <div
                  className={`w-40 h-[1.5px] mx-auto my-2 ${
                    themeTemplate === 'gold'
                      ? 'bg-amber-500'
                      : themeTemplate === 'emerald'
                      ? 'bg-emerald-500'
                      : 'bg-[#00F0FF]'
                  }`}
                ></div>
              </div>

              {/* Certificate Main Title */}
              <div className="relative z-10 text-center my-auto space-y-1">
                <span
                  className={`font-heading font-black text-lg sm:text-2xl uppercase tracking-widest block ${
                    themeTemplate === 'gold'
                      ? 'text-amber-400'
                      : themeTemplate === 'emerald'
                      ? 'text-emerald-400'
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#00F0FF]'
                  }`}
                >
                  {certType === 'merit'
                    ? 'CERTIFICATE OF MERIT & EXCELLENCE'
                    : certType === 'completion'
                    ? 'CERTIFICATE OF QUANTUM MASTERY'
                    : 'CERTIFICATE OF PARTICIPATION'}
                </span>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                  THIS IS PROUDLY CONFERRED UPON
                </span>

                {/* Recipient Name */}
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide py-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                  {currentStudioStudent ? currentStudioStudent.name.toUpperCase() : 'CADET NAME'}
                </h1>

                {/* Department & Reg Number */}
                <p
                  className={`font-mono text-xs font-bold tracking-wider ${
                    themeTemplate === 'gold'
                      ? 'text-amber-300'
                      : themeTemplate === 'emerald'
                      ? 'text-emerald-300'
                      : 'text-cyan-300'
                  }`}
                >
                  {currentStudioStudent?.department ? `DEPARTMENT OF ${currentStudioStudent.department.toUpperCase()} • ` : ''}
                  COLLEGE REG NO: {currentStudioStudent?.reg_number || 'RA2111003010142'}
                </p>

                {/* Citation paragraph */}
                <p className="font-sans text-[11px] text-slate-300 max-w-lg mx-auto leading-relaxed pt-1">
                  {certType === 'merit'
                    ? `for extraordinary technical excellence and achieving top rank in the PyRank Spider-Code Python Debugging Arena.`
                    : certType === 'completion'
                    ? `for demonstrating complete mastery over all 10 corrupted quantum neural subroutines and restoring stability to Sector 616.`
                    : `for active and commendable participation in the PyRank Spider-Code Python Debugging Challenge, demonstrating solid algorithmic thinking and high-pressure debugging skills.`}
                </p>
              </div>

              {/* Bottom Signatures & Seal */}
              <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-end justify-between px-2">
                {/* Signatory 1 */}
                <div className="text-center w-36">
                  <span className="font-serif italic text-base text-cyan-300 block leading-tight">
                    {signatory1Name}
                  </span>
                  <div className="w-full h-0.5 bg-slate-700 my-1"></div>
                  <span className="font-heading font-bold text-[10px] text-white block">
                    {signatory1Name}
                  </span>
                  <span className="font-mono text-[8px] text-slate-400 block">
                    {signatory1Role}
                  </span>
                </div>

                {/* Center Medallion / Date */}
                <div className="text-center flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center mb-1 ${
                      themeTemplate === 'gold'
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                        : themeTemplate === 'emerald'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-[#00F0FF] bg-cyan-950/40 text-cyan-300'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[7px] font-mono font-bold">2026</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 block">
                    {customDate}
                  </span>
                </div>

                {/* Signatory 2 */}
                <div className="text-center w-36">
                  <span className="font-serif italic text-base text-cyan-300 block leading-tight">
                    {signatory2Name}
                  </span>
                  <div className="w-full h-0.5 bg-slate-700 my-1"></div>
                  <span className="font-heading font-bold text-[10px] text-white block">
                    {signatory2Name}
                  </span>
                  <span className="font-mono text-[8px] text-slate-400 block">
                    {signatory2Role}
                  </span>
                </div>
              </div>

              {/* Verification Token Footer */}
              <div className="relative z-10 text-center mt-2 text-[8px] font-mono text-slate-500">
                VERIFICATION TOKEN: PYR-2026-{currentStudioStudent?.reg_number || 'RA0000'}-SEC616
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: FULL SCREEN CERTIFICATE PREVIEW
          ========================================================================= */}
      {previewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-4xl w-full rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/60 shadow-[0_0_60px_rgba(0,240,255,0.35)] relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500 flex items-center justify-center text-cyan-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black text-white">
                    Official Certificate Preview
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Cadet: {previewStudent.name} ({previewStudent.reg_number})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="w-full aspect-[1.6/1] rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#0c1630] via-[#080d22] to-[#040714] border-2 border-[#00F0FF]/60 flex flex-col justify-between shadow-2xl relative select-none">
              <div className="text-center space-y-1">
                <span className="font-mono text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">
                  OFFICIAL EVENT CREDENTIAL • PYRANK • SECTOR 616
                </span>
                <h2 className="font-heading font-black text-base text-white tracking-wider uppercase">
                  {customEventTitle}
                </h2>
                <div className="w-32 h-0.5 bg-[#00F0FF] mx-auto my-1.5"></div>
              </div>

              <div className="text-center space-y-1 my-auto">
                <span className="font-heading font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#00F0FF] uppercase tracking-widest block">
                  {previewType === 'merit'
                    ? 'CERTIFICATE OF MERIT & EXCELLENCE'
                    : previewType === 'completion'
                    ? 'CERTIFICATE OF QUANTUM MASTERY'
                    : 'CERTIFICATE OF PARTICIPATION'}
                </span>
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                  THIS IS PROUDLY PRESENTED TO
                </span>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide py-1">
                  {previewStudent.name.toUpperCase()}
                </h1>
                <p className="font-mono text-xs font-bold text-cyan-300">
                  {previewStudent.department ? `DEPARTMENT OF ${previewStudent.department.toUpperCase()} • ` : ''}
                  COLLEGE REG NO: {previewStudent.reg_number}
                </p>
                <p className="font-sans text-xs text-slate-300 max-w-lg mx-auto leading-relaxed pt-1">
                  {previewType === 'merit'
                    ? `for extraordinary algorithmic technical excellence in the PyRank Spider-Code Python Debugging Arena.`
                    : previewType === 'completion'
                    ? `for demonstrating complete mastery over all 10 corrupted quantum neural subroutines and restoring dimensional stability.`
                    : `for commendable performance and active participation in the PyRank Spider-Code Python Debugging Challenge.`}
                </p>
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-slate-800 text-center">
                <div className="w-32">
                  <span className="font-serif italic text-sm text-cyan-300 block">{signatory1Name}</span>
                  <div className="w-full h-0.5 bg-slate-700 my-0.5"></div>
                  <span className="font-heading font-bold text-[9px] text-white block">{signatory1Name}</span>
                  <span className="font-mono text-[8px] text-slate-400 block">{signatory1Role}</span>
                </div>
                <div className="text-center font-mono text-[9px] text-slate-400">
                  ISSUED: {customDate}
                </div>
                <div className="w-32">
                  <span className="font-serif italic text-sm text-cyan-300 block">{signatory2Name}</span>
                  <div className="w-full h-0.5 bg-slate-700 my-0.5"></div>
                  <span className="font-heading font-bold text-[9px] text-white block">{signatory2Name}</span>
                  <span className="font-mono text-[8px] text-slate-400 block">{signatory2Role}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="px-5 py-2.5 rounded-xl font-mono text-xs text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrintCertificate}
                className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>

              <button
                type="button"
                onClick={() => downloadCertificatePNG(previewStudent, previewType)}
                className="px-6 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
