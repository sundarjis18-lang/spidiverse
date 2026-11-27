import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import {
  Play,
  Send,
  RotateCcw,
  Clock,
  CheckCircle2,
  Lock,
  XCircle,
  AlertCircle,
  Lightbulb,
  Flame,
  ChevronLeft,
  Terminal as TerminalIcon,
  Check,
  Sparkles,
  Shield,
  ArrowRight,
  Cpu,
  Layers
} from 'lucide-react';
import { Challenge, SubmissionResponse, TestResult, User } from '../types';
import { api } from '../utils/api';
import { sounds } from '../utils/soundEffects';
import { QUEST_BADGES } from '../utils/badges';
import { formatCompetitionTimer } from '../utils/timer';

interface ArenaViewProps {
  user: User;
  challenge: Challenge;
  globalUnlocked?: boolean;
  competitionTimer?: number;
  onBackToDashboard: () => void;
  onChallengeCompleted: (challengeId: number, questPoints: number, overallPenalty?: number, newTotalPoints?: number) => void;
  onNextChallenge: (nextId: number) => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  user,
  challenge,
  globalUnlocked = true,
  competitionTimer = 0,
  onBackToDashboard,
  onChallengeCompleted,
  onNextChallenge
}) => {
  // If challenge is not found or not provided, render friendly fallback
  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-xl font-heading font-bold text-rose-500 mb-2">TELEMETRY LINK OFFLINE</h2>
        <p className="text-sm text-slate-400 font-mono mb-6">Challenge checkpoint node was not found or is currently unreachable.</p>
        <button
          onClick={onBackToDashboard}
          className="px-6 py-2.5 rounded-xl bg-[#087CFF] hover:bg-[#00F0FF] hover:text-black text-white font-mono text-xs uppercase font-bold transition-all shadow-[0_0_15px_rgba(8,124,255,0.4)]"
        >
          Return to Mission Control
        </button>
      </div>
    );
  }

  // Defensive data normalization
  const starterCode = challenge.starterCode || challenge.starter_code || '';
  const hints: string[] = Array.isArray(challenge.hints)
    ? challenge.hints
    : (typeof challenge.hints === 'string' && challenge.hints ? [challenge.hints] : []);
  const testCases = Array.isArray(challenge.testCases) && challenge.testCases.length > 0
    ? challenge.testCases
    : (Array.isArray(challenge.test_cases) ? challenge.test_cases : []);
  const functionName = challenge.function_name || challenge.functionName || 'solve';

  const [code, setCode] = useState(starterCode);
  const [activeBottomTab, setActiveBottomTab] = useState<'tests' | 'terminal'>('tests');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Execution outputs
  const [terminalOutput, setTerminalOutput] = useState<string>('Spider-Verse Python 3.12 Holographic Compiler Online.\nReady for isolated execution...\n');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [awardedPoints, setAwardedPoints] = useState<number | null>(null);

  // Hints state & Overall Point Penalty calculations
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const penaltyPerHint = Math.max(10, Math.round(challenge.points * 0.10));
  const hintsUsed = revealedHints.length;
  const currentPenalty = hintsUsed * penaltyPerHint;

  const isUserFinished = Array.isArray(user?.completed_challenges) && user.completed_challenges.length >= 10;
  const displayTimer = isUserFinished ? (user.time_spent_seconds || competitionTimer) : competitionTimer;

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(1200);

  // Anti-Cheat: Copy & Paste Restriction
  const [copyPasteWarning, setCopyPasteWarning] = useState<string | null>(null);

  const triggerCopyPasteWarning = (action: 'COPY' | 'PASTE') => {
    sounds.playError();
    setCopyPasteWarning(
      action === 'PASTE'
        ? 'RESTRICTED: Pasting external code is disabled. All solutions must be manually typed.'
        : 'RESTRICTED: Copying code from the Arena editor is disabled by Arena Security Protocol.'
    );
    setTimeout(() => setCopyPasteWarning(null), 3500);
  };

  const handleEditorDidMount = (editor: any) => {
    // 1. Intercept Monaco keydown events for copy/paste/cut shortcuts
    editor.onKeyDown((e: any) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const browserEvent = e.browserEvent || {};
      const key = (browserEvent.key || '').toLowerCase();
      const keyCode = browserEvent.keyCode;

      const isCopy = isCtrlOrCmd && (key === 'c' || keyCode === 67);
      const isPaste = (isCtrlOrCmd && (key === 'v' || keyCode === 86)) || (browserEvent.shiftKey && (key === 'insert' || keyCode === 45));
      const isCut = isCtrlOrCmd && (key === 'x' || keyCode === 88);

      if (isCopy || isPaste || isCut) {
        e.preventDefault();
        e.stopPropagation();
        triggerCopyPasteWarning(isPaste ? 'PASTE' : 'COPY');
      }
    });

    // 2. Intercept low-level DOM events on Monaco container
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener('paste', (e: ClipboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        triggerCopyPasteWarning('PASTE');
      }, true);

      domNode.addEventListener('copy', (e: ClipboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        triggerCopyPasteWarning('COPY');
      }, true);

      domNode.addEventListener('cut', (e: ClipboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        triggerCopyPasteWarning('COPY');
      }, true);

      domNode.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        triggerCopyPasteWarning('PASTE');
      }, true);

      domNode.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      }, true);
    }
  };

  useEffect(() => {
    setCode(starterCode);
    setSubmissionStatus('idle');
    setTestResults([]);
    setGeneralError(null);
    setRevealedHints([]);
    setShowBadgeModal(false);
    setAwardedPoints(null);
    setTimeLeft(1200);
  }, [challenge.id, starterCode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRevealHint = (index: number) => {
    sounds.playWebShoot();
    if (!revealedHints.includes(index)) {
      const confirmMsg = `TACTICAL DECRYPTION WARNING:\nDecrypting Hint #${index + 1} will incur a -${penaltyPerHint} pts penalty deducted from your OVERALL SCORE.\n\nThis quest will still reward its full ${challenge.points} PTS upon completion.\n\nProceed with decryption?`;
      if (window.confirm(confirmMsg)) {
        setRevealedHints(prev => [...prev, index]);
      }
    }
  };

  const handleResetCode = () => {
    sounds.playWebShoot();
    if (window.confirm("Reset holographic code buffer to original corrupted state?")) {
      setCode(starterCode);
      setSubmissionStatus('idle');
      setTerminalOutput('Editor buffer reset to initial corrupted telemetry.\n');
    }
  };

  const isAlreadyCompleted = (user?.completed_challenges?.includes(challenge.id) || challenge.is_completed) && user?.role !== 'admin';

  const handleRunCode = async () => {
    if (isAlreadyCompleted) {
      sounds.playError();
      alert(`QUEST #${challenge.id} IS LOCKED: You have already completed this quest and received its badge!`);
      return;
    }
    sounds.playWebShoot();
    setIsRunning(true);
    setActiveBottomTab('terminal');
    setGeneralError(null);

    try {
      const res = await api.executeCode(code);
      if (res.status === 'success') {
        sounds.playSuccess();
        setTerminalOutput(`>>> HOLOGRAPHIC DIAGNOSTIC COMPILED (Runtime: ${res.runtime_ms}ms)\n${res.output || '[Program executed with exit code 0. Use print() to inspect variables.]'}`);
      } else {
        sounds.playError();
        setTerminalOutput(`>>> COMPILATION/RUNTIME ERROR:\n${res.error || 'Execution crashed'}\n${res.output || ''}`);
      }
    } catch (err: unknown) {
      sounds.playError();
      setTerminalOutput(`>>> VIRTUAL SANDBOX ERROR: ${err instanceof Error ? err.message : 'Execution failed'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isAlreadyCompleted) {
      sounds.playError();
      alert(`QUEST #${challenge.id} IS LOCKED: You have already completed this quest and received its badge!`);
      return;
    }
    sounds.playWebShoot();
    setIsSubmitting(true);
    setActiveBottomTab('tests');
    setGeneralError(null);

    try {
      const res: SubmissionResponse = await api.submitSolution(user.id, challenge.id, code, revealedHints.length);
      setTestResults(res.results);

      if (res.all_passed) {
        sounds.playVictory();
        setSubmissionStatus('success');
        const questPointsAwarded = res.points_awarded ?? challenge.points;
        const penalty = res.hint_penalty ?? currentPenalty;
        setAwardedPoints(questPointsAwarded);
        setShowBadgeModal(true);

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F52245', '#087CFF', '#8B35FF', '#00F0FF', '#10B981', '#FFD700']
        });

        onChallengeCompleted(challenge.id, questPointsAwarded, penalty, res.total_points);
      } else {
        sounds.playError();
        setSubmissionStatus('failed');
        if (res.general_error) {
          setGeneralError(res.general_error);
        }
      }

      if (res.stdout) {
        setTerminalOutput(`>>> VALIDATION HARNESS STDOUT:\n${res.stdout}`);
      }
    } catch (err: unknown) {
      sounds.playError();
      setSubmissionStatus('failed');
      setGeneralError(err instanceof Error ? err.message : 'Failed to validate solution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBoss = challenge.id === 10;
  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length || testCases.length;

  return (
    <div className="p-4 sm:p-6 flex flex-col h-[calc(100vh-64px)] max-w-[1700px] mx-auto overflow-hidden">

      {/* Top Holographic Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { sounds.playWebShoot(); onBackToDashboard(); }}
            className="p-2.5 rounded-xl bg-[#10182B] border border-slate-700 hover:border-[#00F0FF] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono group"
          >
            <ChevronLeft className="w-4 h-4 text-[#00F0FF] group-hover:-translate-x-0.5 transition-transform" />
            <span>Dashboard</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                CHECKPOINT #{String(challenge.id).padStart(2, '0')}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${challenge.difficulty === 'Beginner'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : challenge.difficulty === 'Intermediate'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                }`}>
                {challenge.difficulty}
              </span>
              {isBoss && (
                <span className="text-[10px] px-2 py-0.5 rounded font-heading font-black bg-rose-600/40 text-rose-200 border border-rose-500 animate-pulse">
                  FINAL BOSS ARENA
                </span>
              )}
            </div>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-white tracking-wide truncate max-w-md sm:max-w-xl">
              {challenge.title}
            </h1>
          </div>
        </div>

        {/* Top Floating Diagnostic Chips (Inspired by Reference Panel 3) */}
        <div className="hidden xl:flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-[#00F0FF] text-[11px] font-mono flex items-center gap-1.5 animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
            <span>Telemetry: {functionName}()</span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-300 text-[11px] font-mono flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Test Cases: {totalCount}</span>
          </div>
        </div>

        {/* Right Info: Points & Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-current" />
            <span>+{challenge.points} Points</span>
            {hintsUsed > 0 && (
              <span className="text-[10px] text-amber-300 font-normal ml-1 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                Overall: -{currentPenalty} pts
              </span>
            )}
          </div>

          <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 ${isUserFinished
            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : globalUnlocked
              ? 'bg-purple-950/60 border-purple-500/40 text-cyan-300 shadow-[0_0_12px_rgba(139,53,255,0.25)]'
              : competitionTimer > 0
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}>
            <Clock className={`w-4 h-4 ${isUserFinished ? 'text-emerald-400' : globalUnlocked ? 'text-cyan-400 animate-pulse' : competitionTimer > 0 ? 'text-amber-400' : 'text-slate-500'
              }`} />
            <span>{formatCompetitionTimer(displayTimer)}</span>
            {isUserFinished ? (
              <span className="text-[10px] font-bold uppercase tracking-wider ml-0.5 text-emerald-300">
                FINAL
              </span>
            ) : !globalUnlocked ? (
              <span className="text-[10px] font-normal uppercase tracking-wider ml-0.5">
                {competitionTimer > 0 ? 'FROZEN' : 'LOCKED'}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Holographic Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden pt-3">

        {/* LEFT PANEL: Mission Specs & Lore */}
        <div className="lg:col-span-5 flex flex-col glass-panel rounded-3xl border border-slate-800 overflow-hidden h-[360px] lg:h-auto">
          <div className="px-5 py-3 bg-[#10182B]/90 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-heading font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#087CFF]" />
              MISSION INTEL BRIEFING
            </span>
            <span className="text-[11px] font-mono text-slate-400">{challenge.category}</span>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-sm text-slate-300">
            {/* Story Lore */}
            <div className="p-3.5 rounded-2xl bg-[#080B18]/70 border border-[#F52245]/40 relative overflow-hidden">
              <p className="text-[11px] font-mono font-bold text-[#F52245] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Subroutine Incident Report:
              </p>
              <p className="text-xs leading-relaxed text-slate-200 italic">
                "{challenge.story}"
              </p>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-white mb-1">
                Core Directive
              </h4>
              <p className="text-xs leading-relaxed text-slate-300 font-mono">
                {challenge.description}
              </p>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#00F0FF] mb-1">
                Instructions & Specifications
              </h4>
              <div className="text-xs font-mono bg-[#080B18]/90 p-3.5 rounded-2xl border border-slate-800 whitespace-pre-line leading-relaxed text-slate-300">
                {challenge.instructions}
              </div>
            </div>

            {/* Expected Behaviour / Public Test Cases */}
            <div>
              <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                Sample Test Vectors
              </h4>
              <div className="space-y-2">
                {testCases.filter(t => !t.hidden).map((tc, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#080B18] border border-slate-800 font-mono text-xs">
                    <div className="text-slate-400">
                      <span className="text-[#00F0FF]">Invoke: </span>
                      {functionName}{tc.input}
                    </div>
                    <div className="text-emerald-400 mt-0.5">
                      <span className="text-slate-400">Yields: </span>
                      {tc.expected}
                    </div>
                  </div>
                ))}
                {testCases.length === 0 && (
                  <div className="p-2.5 rounded-xl bg-[#080B18] border border-slate-800 font-mono text-xs text-slate-500">
                    Standard input verification vectors active.
                  </div>
                )}
              </div>
            </div>

            {/* Tactical Spider-Sense Hints */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  Spider-Sense Hints ({revealedHints.length}/{hints.length})
                </h4>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                  -{penaltyPerHint} pts from overall score / hint
                </span>
              </div>

              {hintsUsed > 0 && (
                <div className="mb-2 p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center justify-between">
                  <span>Overall Penalty:</span>
                  <span className="font-bold text-rose-400">-{currentPenalty} pts (deducted from overall score)</span>
                </div>
              )}

              <div className="space-y-2">
                {hints.length === 0 ? (
                  <div className="p-3 text-xs font-mono text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                    No decrypted hints required for this protocol.
                  </div>
                ) : (
                  hints.map((hint, idx) => {
                    const isRevealed = revealedHints.includes(idx);
                    return (
                      <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                        {isRevealed ? (
                          <div className="p-3 text-xs font-mono text-purple-200 bg-purple-950/20 border-l-2 border-purple-500">
                            <div className="flex items-center justify-between mb-1">
                              <strong className="text-purple-400">Decrypted Hint #{idx + 1}:</strong>
                              <span className="text-[10px] text-amber-400 font-bold">-{penaltyPerHint} pts overall</span>
                            </div>
                            {hint}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRevealHint(idx)}
                            className="w-full p-2.5 text-left text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center justify-between transition-colors"
                          >
                            <span>Access Hint #{idx + 1}</span>
                            <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                              Decrypt (-{penaltyPerHint} pts overall)
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: Holographic Code Editor & Execution Console */}
        <div className="lg:col-span-7 flex flex-col gap-3 h-[600px] lg:h-full">

          {/* Editor Container with Holographic Neon Frame (Matching Reference Panel 3) */}
          <div className="flex-1 flex flex-col rounded-3xl glass-panel border border-[#087CFF]/40 shadow-[0_0_30px_rgba(8,124,255,0.2)] overflow-hidden min-h-[300px] relative">

            {/* Editor Toolbar with Floating File Tabs */}
            <div className="px-4 py-2.5 bg-[#10182B]/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>

                {/* Active File Tab */}
                <div className="px-3 py-1 rounded-xl bg-[#080B18] border border-[#00F0FF]/40 text-[#00F0FF] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                  <span>solution.py</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCode}
                  title="Reset to starter buggy code"
                  className="px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                {isAlreadyCompleted ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SECTOR SEALED • BADGE AWARDED</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      className="px-4 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-[#087CFF] border border-[#087CFF]/50 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(8,124,255,0.3)]"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isRunning || isSubmitting}
                      className="px-5 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#F52245] to-[#8B35FF] hover:brightness-125 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,34,69,0.5)]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Monaco Editor with Anti-Cheat Event Guards */}
            <div
              className="flex-1 w-full bg-[#080B18] relative"
              onCopy={(e) => { e.preventDefault(); e.stopPropagation(); triggerCopyPasteWarning('COPY'); }}
              onPaste={(e) => { e.preventDefault(); e.stopPropagation(); triggerCopyPasteWarning('PASTE'); }}
              onCut={(e) => { e.preventDefault(); e.stopPropagation(); triggerCopyPasteWarning('COPY'); }}
              onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              {copyPasteWarning && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-rose-950/95 border-2 border-rose-500 text-rose-200 font-mono text-xs flex items-center gap-2.5 shadow-[0_0_35px_rgba(245,34,69,0.7)] animate-in fade-in slide-in-from-top-2 pointer-events-none">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                  <span className="font-bold">{copyPasteWarning}</span>
                </div>
              )}

              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  readOnly: isAlreadyCompleted,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 14,
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                  cursorBlinking: 'smooth',
                  renderLineHighlight: 'all',
                  padding: { top: 12, bottom: 12 },
                  contextmenu: false,
                  dragAndDrop: false
                }}
              />
            </div>
          </div>

          {/* BOTTOM PANEL: Holographic Console */}
          <div className="h-[240px] lg:h-[260px] rounded-3xl glass-panel border border-slate-800 flex flex-col overflow-hidden shrink-0">

            {/* Header Tabs */}
            <div className="px-4 py-2 bg-[#10182B]/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab('tests')}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${activeBottomTab === 'tests'
                    ? 'bg-[#087CFF]/20 text-[#00F0FF] border border-[#087CFF]/60 shadow-[0_0_10px_rgba(8,124,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test Vectors ({passedCount}/{totalCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBottomTab('terminal')}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${activeBottomTab === 'terminal'
                    ? 'bg-[#F52245]/20 text-[#F52245] border border-[#F52245]/60 shadow-[0_0_10px_rgba(245,34,69,0.3)]'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>Console Telemetry</span>
                </button>
              </div>

              {/* Status Indicator Banner */}
              {submissionStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>CORRUPTION PURGED! +{awardedPoints ?? challenge.points} PTS</span>
                  {hintsUsed > 0 && (
                    <span className="text-[10px] text-amber-300 font-normal">
                      (-{currentPenalty} pts hint penalty deducted from overall score)
                    </span>
                  )}
                  {challenge.id < 10 && (
                    <button
                      onClick={() => onNextChallenge(challenge.id + 1)}
                      className="ml-2 px-3 py-1 rounded-xl bg-emerald-500 text-black text-[11px] font-heading font-black hover:bg-emerald-400 transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    >
                      <span>NEXT MISSION</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              {submissionStatus === 'failed' && (
                <div className="flex items-center gap-1.5 text-rose-400 font-mono text-xs font-bold animate-in fade-in">
                  <XCircle className="w-4 h-4" />
                  <span>VALIDATION FAILED ({passedCount}/{totalCount} Passed)</span>
                </div>
              )}
            </div>

            {/* Console Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs bg-[#080B18]/95">
              {generalError && (
                <div className="mb-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200">
                  <strong className="block text-rose-400 uppercase font-bold mb-0.5">Runtime Exception:</strong>
                  <pre className="whitespace-pre-wrap text-[11px]">{generalError}</pre>
                </div>
              )}

              {activeBottomTab === 'tests' && (
                <div className="space-y-2">
                  {testResults.length === 0 ? (
                    <div className="text-slate-500 italic py-6 text-center">
                      Click "Run Code" or "Submit Solution" to trigger automated test evaluations.
                    </div>
                  ) : (
                    testResults.map((r, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all ${r.passed
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {r.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            )}
                            <span className="font-bold uppercase tracking-wider">
                              Vector #{idx + 1} {r.hidden && '(Encrypted Hidden Test)'}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${r.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                            {r.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mt-2">
                          <div className="p-2 rounded-xl bg-black/50 border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase">Input:</span>
                            <span className="text-white truncate block">{r.input}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-black/50 border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase">Expected:</span>
                            <span className="text-emerald-400 truncate block">{r.expected}</span>
                          </div>
                          {!r.passed && (
                            <div className="col-span-full p-2 rounded-xl bg-rose-900/30 border border-rose-700/50">
                              <span className="text-rose-400 block text-[10px] uppercase">Actual Output:</span>
                              <span className="text-white truncate block">{r.actual}</span>
                              {r.error && <span className="text-rose-300 text-[10px] block mt-1">{r.error}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeBottomTab === 'terminal' && (
                <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                  {terminalOutput}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Quest Badge Awarded Celebration Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-8 border-2 border-[#00F0FF]/60 shadow-[0_0_60px_rgba(0,240,255,0.4)] relative text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#00F0FF]/15 rounded-full blur-2xl pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>QUEST #{challenge.id} CLEARED • BADGE UNLOCKED!</span>
            </div>

            <div className="relative w-48 h-56 mx-auto my-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F52245] via-[#8B35FF] to-[#00F0FF] blur-xl opacity-60 animate-pulse"></div>
              <img
                src={QUEST_BADGES[challenge.id]?.image || `/badges/badge_${String(challenge.id).padStart(2, '0')}.png`}
                alt={challenge.title}
                className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] relative z-10 animate-in zoom-in-75 duration-300 rounded-2xl"
              />
            </div>

            <h3 className="font-heading text-2xl font-black text-white mt-3">
              {QUEST_BADGES[challenge.id]?.title || challenge.title}
            </h3>
            <p className="text-xs font-mono text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
              {QUEST_BADGES[challenge.id]?.description || 'Sector telemetry restored. This official completion badge has been awarded and equipped to your Spider-Code Dashboard!'}
            </p>

            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="inline-block px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold">
                +{awardedPoints ?? challenge.points} QUEST POINTS AWARDED
              </div>
              {hintsUsed > 0 && (
                <span className="text-[11px] font-mono text-amber-300/90">
                  (-{currentPenalty} pts hint penalty deducted from overall score)
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  sounds.playWebShoot();
                  setShowBadgeModal(false);
                  onBackToDashboard();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs transition-all"
              >
                View in Dashboard
              </button>

              {challenge.id < 10 ? (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playWebShoot();
                    setShowBadgeModal(false);
                    onNextChallenge(challenge.id + 1);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-[#087CFF] hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2"
                >
                  <span>NEXT MISSION #{String(challenge.id + 1).padStart(2, '0')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playVictory();
                    setShowBadgeModal(false);
                    onBackToDashboard();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-heading font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#F52245] to-[#8B35FF] hover:brightness-110 shadow-[0_0_20px_rgba(245,34,69,0.5)] transition-all"
                >
                  ALL 10 SECTORS SAVED!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
