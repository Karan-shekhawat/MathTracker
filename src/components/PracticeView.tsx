import { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Question, FailureReason } from '../types';
import { getNextPracticeSet } from '../lib/srsEngine';
import {
  Brain,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Flame,
  Award,
  Plus,
  BookOpen,
  Keyboard,
  Undo,
  Pause,
  Play,
  LogOut,
  Flag,
  Edit
} from 'lucide-react';

interface PracticeViewProps {
  initialConceptOverrideId?: string | null;
  onViewChange?: (view: any) => void;
}

export default function PracticeView({ initialConceptOverrideId, onViewChange }: PracticeViewProps) {
  const {
    topics,
    questions,
    completePracticeSession,
    practiceSessions,
    updateQuestion
  } = useAppState();

  // Navigation states
  // 'setup' | 'active' | 'review'
  const [sessionStage, setSessionStage] = useState<'setup' | 'active' | 'review'>('setup');

  // Setup options
  const [isSrsMode, setIsSrsMode] = useState(true);
  const [selectedConceptIds, setSelectedConceptIds] = useState<string[]>([]);

  // Active session parameters
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({}); // questionId -> selectedOptionIdx
  const [startTime, setStartTime] = useState<number>(0);
  
  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const selectedAnswersRef = useRef(selectedAnswers);

  // Post Practice state
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(0);
  const [loggedReasons, setLoggedReasons] = useState<Record<string, FailureReason>>({}); // questionId -> Reason
  const [loggedNotes, setLoggedNotes] = useState<Record<string, string>>({}); // questionId -> noteText
  const [recentLoggedSession, setRecentLoggedSession] = useState<any>(null);
  const [flaggedForEdit, setFlaggedForEdit] = useState<Record<string, boolean>>({});

  // Handle outside overrides
  useEffect(() => {
    if (initialConceptOverrideId) {
      setSelectedConceptIds([initialConceptOverrideId]);
      setIsSrsMode(false);
    }
  }, [initialConceptOverrideId]);

  // Load selection if custom practice
  const handleToggleConcept = (conceptId: string) => {
    setSelectedConceptIds(prev =>
      prev.includes(conceptId) ? prev.filter(id => id !== conceptId) : [...prev, conceptId]
    );
  };

  // Keyboard Shortcuts for Active Practice
  useEffect(() => {
    if (sessionStage !== 'active' || isPaused || showExitConfirm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeQ = sessionQuestions[currentIdx];
      if (!activeQ) return;

      // 1-4 option keys
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optIdx = parseInt(e.key) - 1;
        setSelectedAnswers(prev => ({ ...prev, [activeQ.id]: optIdx }));
      }
      // Space or Enter to save and next
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSaveAndNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionStage, sessionQuestions, currentIdx, selectedAnswers]);

  // Keep the ref in sync with the latest selectedAnswers
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  // Timer counter
  useEffect(() => {
    if (sessionStage !== 'active' || isPaused || showExitConfirm) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimeExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStage, sessionQuestions, isPaused, showExitConfirm]);

  // Auto-submit when time expires — uses a separate effect so it always reads
  // the latest selectedAnswers (avoids the stale closure from the timer callback)
  useEffect(() => {
    if (timeExpired && sessionStage === 'active') {
      setTimeExpired(false);
      handleAutoSubmit();
    }
  }, [timeExpired]);

  const startSession = () => {
    let selected: Question[] = [];

    if (isSrsMode) {
      // Use the adaptive SRS engine which auto-selects difficulty based on concept mastery:
      // Easy mastery ≥70% → promote to Medium, Medium mastery ≥70% → promote to Hard
      selected = getNextPracticeSet(topics, questions, 10);
    } else {
      // Custom concepts filter
      if (selectedConceptIds.length === 0) {
        alert('Please select at least one concept to practice.');
        return;
      }
      const pool = questions.filter(q => selectedConceptIds.includes(q.conceptId));
      if (pool.length === 0) {
        alert('Your library has no questions matching this request. Import a package of questions or build one manually first!');
        return;
      }
      
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, 10);
    }

    if (selected.length === 0) {
      alert('Your library has no questions matching this request. Import a package of questions or build one manually first!');
      return;
    }

    setSessionQuestions(selected);
    setCurrentIdx(0);
    // Initialize blank answers map
    const initialAnswers: Record<string, number | null> = {};
    selected.forEach(q => { initialAnswers[q.id] = null; });
    setSelectedAnswers(initialAnswers);

    setSecondsRemaining(600); // Reset to 10 minutes
    setIsPaused(false);
    setStartTime(Date.now());
    setSessionStage('active');
  };

  const handleSelectOption = (optIdx: number) => {
    const activeQ = sessionQuestions[currentIdx];
    if (!activeQ) return;
    setSelectedAnswers(prev => ({ ...prev, [activeQ.id]: optIdx }));
  };

  const handleSaveAndNext = () => {
    if (currentIdx < sessionQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Last question - trigger manual submit
      submitSession();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Automatically submitting your practice session answers.');
    submitSession();
  };

  const submitSession = () => {
    const duration = Math.max(1, 600 - secondsRemaining);
    setSessionDurationSeconds(duration);

    // Build results payload for completePracticeSession
    const resultsPayload = sessionQuestions.map(q => {
      const ans = selectedAnswers[q.id] ?? null;
      const isCorrect = ans === q.correctOption;
      
      return {
        questionId: q.id,
        userAnswer: ans,
        isCorrect,
        timeSpentSeconds: Math.round(duration / sessionQuestions.length), // simple average time spent per question
        failureReason: isCorrect ? undefined : (loggedReasons[q.id] || 'Concept not cleared'),
        notes: loggedNotes[q.id] || '',
      };
    });

    const conceptsPracticed = Array.from(new Set(sessionQuestions.map(q => q.conceptId)));

    // Save session to local storage state
    const ps = completePracticeSession(
      conceptsPracticed,
      isSrsMode,
      duration,
      resultsPayload
    );

    setRecentLoggedSession(ps);
    setSessionStage('review');
  };

  // Reasons selectors handler in Review stage
  const handleSaveReason = (qId: string, reason: FailureReason) => {
    setLoggedReasons(prev => ({ ...prev, [qId]: reason }));
    
    // Update logged state in active session result
    if (recentLoggedSession) {
      const updatedResults = recentLoggedSession.results.map((r: any) => {
        if (r.questionId === qId) {
          return { ...r, failureReason: reason };
        }
        return r;
      });
      // Set the temporary results
      setRecentLoggedSession({
        ...recentLoggedSession,
        results: updatedResults
      });

      // Synchronize back to state in LocalStorage by finding the practiceSession and editing it
      const saved = localStorage.getItem('anki_ssc_maths_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.practiceSessions = parsed.practiceSessions.map((ps: any) => {
            if (ps.id === recentLoggedSession.id) {
              return {
                ...ps,
                results: ps.results.map((res: any) => {
                  if (res.questionId === qId) {
                    return { ...res, failureReason: reason };
                  }
                  return res;
                })
              };
            }
            return ps;
          });

          // Also synchronise back to error book
          parsed.errorBook = parsed.errorBook.map((eb: any) => {
            if (eb.id === `err_practice_${recentLoggedSession.id}_${qId}`) {
              return { ...eb, reason };
            }
            return eb;
          });

          localStorage.setItem('anki_ssc_maths_state', JSON.stringify(parsed));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleSaveNotes = (qId: string, notes: string) => {
    setLoggedNotes(prev => ({ ...prev, [qId]: notes }));

    if (recentLoggedSession) {
      const updatedResults = recentLoggedSession.results.map((r: any) => {
        if (r.questionId === qId) {
          return { ...r, notes };
        }
        return r;
      });
      setRecentLoggedSession({
        ...recentLoggedSession,
        results: updatedResults
      });

      const saved = localStorage.getItem('anki_ssc_maths_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.practiceSessions = parsed.practiceSessions.map((ps: any) => {
            if (ps.id === recentLoggedSession.id) {
              return {
                ...ps,
                results: ps.results.map((res: any) => {
                  if (res.questionId === qId) {
                    return { ...res, notes };
                  }
                  return res;
                })
              };
            }
            return ps;
          });

          parsed.errorBook = parsed.errorBook.map((eb: any) => {
            if (eb.id === `err_practice_${recentLoggedSession.id}_${qId}`) {
              return { ...eb, notes };
            }
            return eb;
          });

          localStorage.setItem('anki_ssc_maths_state', JSON.stringify(parsed));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  // Format countdown minutes:seconds
  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const isLastTwoMinutes = secondsRemaining <= 120;

  // Render setup view
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Universal Top Navigation Header */}
      {sessionStage !== 'active' && (
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => onViewChange?.('dashboard')}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <Undo size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Distraction-Free Practice Mode
          </div>
        </div>
      )}
      
      {/* ================================== STAGE 1: SETUP WORKSPACE ================================== */}
      {sessionStage === 'setup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Practice Selection Portal</h3>
              <p className="text-slate-400 text-xs">Configure your next mathematics drill session.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Box: SMART SRS selection */}
            <div
              onClick={() => setIsSrsMode(true)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[180px] ${
                isSrsMode
                  ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5'
                  : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">RECOMMENDED ENGINE</span>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                </div>
                <h4 className="font-display font-bold text-base text-slate-100">Smart SRS Session</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  Instantly schedule up to 10 mathematical questions due for Spaced Repetition (Anki algorithm), focusing automatically on concepts with high failure rates.
                </p>
              </div>
              <div className="text-xs font-mono text-indigo-400 font-semibold flex items-center gap-1">
                {questions.filter(q => new Date(q.srsState.dueDate) <= new Date()).length} cards due now
                <ChevronRight size={13} />
              </div>
            </div>

            {/* Right Box: Custom concept list */}
            <div
              onClick={() => setIsSrsMode(false)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[180px] ${
                !isSrsMode
                  ? 'bg-indigo-600/10 border-indigo-500 shadow-md shadow-indigo-500/5'
                  : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
              }`}
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">DRILL SPECIFICS</span>
                <h4 className="font-display font-bold text-base text-slate-100">Custom Concept Drills</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  Select and drill specific concepts from your syllabus. Create a focused 10-question set tailored to help master targeted topics.
                </p>
              </div>
              <div className="text-xs font-mono text-indigo-400 font-semibold flex items-center gap-1">
                {selectedConceptIds.length} concepts active
                <ChevronRight size={13} />
              </div>
            </div>
          </div>

          {/* Sub-selector for custom concepts */}
          {!isSrsMode && (
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850 space-y-3 max-h-[250px] overflow-y-auto animate-fade-in">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Syllabus Concepts Checklist</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topics.map(t =>
                  t.subtopics.map(st =>
                    st.concepts.map(c => {
                      const isActive = selectedConceptIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleToggleConcept(c.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            isActive
                              ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                              : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-semibold">({c.questionsCount} qs)</span>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </div>
          )}

          {/* Start CTA */}
          <button
            onClick={startSession}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Brain size={16} />
            Initialize 10-Question Exam Set
          </button>
        </div>
      )}

      {/* ================================== STAGE 2: ACTIVE EXAM SCREEN ================================== */}
      {sessionStage === 'active' && sessionQuestions.length > 0 && (
        <>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[500px] justify-between relative">
          
          {/* Header Progress and Timer with Pause & Exit Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-850 shrink-0">
            <div className="space-y-1 flex-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Progress: {currentIdx + 1} / {sessionQuestions.length}</span>
                <span className="truncate max-w-[200px] md:max-w-none">
                  Active Concept: {topics.flatMap(t => t.subtopics.flatMap(st => st.concepts)).find(c => c.id === sessionQuestions[currentIdx].conceptId)?.name}
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-[1px]">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / sessionQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Timer capsule */}
              <div className={`px-3 py-2 rounded-xl flex items-center gap-1.5 font-mono font-bold text-xs md:text-sm shrink-0 border ${
                isLastTwoMinutes && !isPaused
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse'
                  : 'bg-slate-950 border-slate-850 text-indigo-400'
              }`}>
                <Timer size={15} />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              {/* Pause Button */}
              {!isPaused && (
                <button
                  onClick={() => setIsPaused(true)}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono font-semibold transition-all cursor-pointer"
                  title="Pause Test"
                >
                  <Pause size={13} />
                  <span className="hidden sm:inline">Pause</span>
                </button>
              )}

              {/* Exit Button */}
              <button
                onClick={() => setShowExitConfirm(true)}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/30 border border-slate-850 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 flex items-center gap-1.5 text-xs font-mono font-semibold transition-all cursor-pointer"
                title="Exit Test"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>

          {/* Core Question and Options body OR Paused Screen Overlay */}
          {isPaused ? (
            <div className="my-12 py-10 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in flex-1">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                <Pause size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-xl text-white">Practice Session Frozen</h4>
                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                  The countdown timer has been paused. To maintain training integrity, questions and selectable options are hidden until you resume.
                </p>
              </div>

              {/* Huge Frozen Timer display */}
              <div className="px-6 py-3 bg-slate-950/80 border border-slate-850 rounded-2xl text-2xl font-mono font-black text-indigo-300 shadow-inner">
                {formatTimer(secondsRemaining)}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Play size={14} />
                  Resume Practice
                </button>
                <button
                  onClick={() => setShowExitConfirm(true)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-rose-950/30 border border-slate-850 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  Cancel & Exit
                </button>
              </div>
            </div>
          ) : (
            <div className="my-8 space-y-6 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-600/15 text-indigo-400 text-[10px] font-mono font-bold">
                  {sessionQuestions[currentIdx].difficulty}
                </span>
              </div>

              {/* Question statements */}
              <p className="text-sm md:text-base font-display font-medium text-slate-100 leading-relaxed leading-normal select-text">
                {sessionQuestions[currentIdx].text}
              </p>

              {/* Multiple Choice interactive buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionQuestions[currentIdx].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[sessionQuestions[currentIdx].id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-xl text-left text-xs md:text-sm border transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white/20 border-white/10 text-white'
                          : 'bg-slate-900 border-slate-800 text-indigo-400'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigator bottom controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-850 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0 || isPaused}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-850 disabled:opacity-35 disabled:cursor-not-allowed hover:bg-slate-950 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Previous
              </button>
              
              {/* Keyboard helper hint */}
              {!isPaused && (
                <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-slate-500">
                  <Keyboard size={12} />
                  <span>Hotkeys: <kbd className="bg-slate-950 px-1 border border-slate-800 rounded">1</kbd>-<kbd className="bg-slate-950 px-1 border border-slate-800 rounded">4</kbd> select • <kbd className="bg-slate-950 px-1 border border-slate-800 rounded">Space</kbd> next</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveAndNext}
              disabled={isPaused}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg shadow-indigo-600/15 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {currentIdx === sessionQuestions.length - 1 ? 'Complete Practice' : 'Save & Next'}
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

        {/* Question Number Navigator */}
        {!isPaused && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6 pb-2">
            {sessionQuestions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const isAnswered = selectedAnswers[q.id] !== null && selectedAnswers[q.id] !== undefined;

              let boxStyles = '';
              if (isAnswered) {
                boxStyles = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
              } else {
                boxStyles = 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold border transition-all cursor-pointer ${boxStyles} ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                  title={`Question ${idx + 1}${isAnswered ? ' (Attempted)' : ' (Unanswered)'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
            <div className="w-full flex items-center justify-center gap-4 pt-2 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50 inline-block"></span> Attempted</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-800/50 border border-slate-700 inline-block"></span> Unanswered</span>
            </div>
          </div>
        )}
        </>
      )}

      {/* ================================== STAGE 3: POST-PRACTICE REVIEW ================================== */}
      {sessionStage === 'review' && recentLoggedSession && (
        <div className="space-y-6">
          
          {/* Score Header Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">Session Completed successfully</span>
            
            <div className="flex items-center justify-center gap-8 py-2">
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-black font-display text-white">
                  {recentLoggedSession.score > 0 ? `+${recentLoggedSession.score.toFixed(1)}` : recentLoggedSession.score.toFixed(1)}
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mt-1">Final Score (+2/-0.5)</span>
              </div>
              <div className="h-10 w-[1px] bg-slate-800"></div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-black font-display text-emerald-400">
                  {recentLoggedSession.accuracy}%
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mt-1">Accuracy Ratio</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
              You answered <span className="font-semibold text-slate-200">{recentLoggedSession.results.filter((r: any) => r.isCorrect).length} correct</span> and <span className="font-semibold text-slate-200">{recentLoggedSession.results.filter((r: any) => r.userAnswer !== null && !r.isCorrect).length} incorrect</span> out of {recentLoggedSession.totalQuestions} questions in {Math.floor(recentLoggedSession.durationSeconds / 60)} minutes.
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSessionStage('setup')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg shadow-indigo-600/15 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Undo size={14} />
                Return to setup portal
              </button>
            </div>
          </div>

          {/* Mistakes Analyzer / Feed */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white text-base tracking-tight flex items-center gap-2">
              <AlertTriangle size={17} className="text-rose-400" />
              Detailed Error Analysis & Log Book
            </h3>
            
            <div className="space-y-4 max-w-4xl">
              {sessionQuestions.map((q, idx) => {
                const res = recentLoggedSession.results.find((r: any) => r.questionId === q.id);
                if (!res) return null;

                const isCorrect = res.isCorrect;
                const activeReason = loggedReasons[q.id] || 'Concept not cleared';
                const activeNotes = loggedNotes[q.id] || '';

                return (
                  <div
                    key={q.id}
                    className={`border rounded-2xl p-5 space-y-4 transition-all ${
                      isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    {/* Status banner */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">Card #{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                          isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {isCorrect ? 'Correct Answer' : 'Incorrect/Skipped'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">
                          Concept: {topics.flatMap(t => t.subtopics.flatMap(st => st.concepts)).find(c => c.id === q.conceptId)?.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newVal = !(flaggedForEdit[q.id] ?? q.needsEdit);
                            setFlaggedForEdit(prev => ({ ...prev, [q.id]: newVal }));
                            updateQuestion(q.id, { needsEdit: newVal });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            (flaggedForEdit[q.id] ?? q.needsEdit)
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-amber-400 hover:border-amber-500/30'
                          }`}
                          title={(flaggedForEdit[q.id] ?? q.needsEdit) ? 'Remove edit flag' : 'Flag this question for editing later in Import tab'}
                        >
                          <Flag size={11} />
                          {(flaggedForEdit[q.id] ?? q.needsEdit) ? 'Flagged for Edit' : 'Flag for Edit'}
                        </button>
                      </div>
                    </div>

                    {/* Question text */}
                    <p className="text-xs md:text-sm text-slate-200 leading-normal leading-relaxed select-text font-medium">
                      {q.text}
                    </p>

                    {/* Options summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => {
                        const isCorrectOpt = optIdx === q.correctOption;
                        const isUserAnswer = optIdx === res.userAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl text-xs border ${
                              isCorrectOpt
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold'
                                : isUserAnswer
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                  : 'bg-slate-900/40 border-slate-850 text-slate-500'
                            }`}
                          >
                            <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                            {isUserAnswer && (
                              <span className={`text-[9px] font-mono ml-2 italic ${isCorrectOpt ? 'text-emerald-400 font-bold' : 'text-rose-400'}`}>
                                (Your Choice)
                              </span>
                            )}
                            {isCorrectOpt && !isUserAnswer && (
                              <span className="text-[9px] font-mono ml-2 italic text-emerald-500/80">
                                (Correct Answer)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Full proof solution block */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Correct Solution Steps</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line select-text pt-1">
                        {q.explanation || 'No step-by-step solution proof available.'}
                      </p>
                    </div>

                    {/* INTERACTIVE FAILURE LOGS (Only for incorrect answers) */}
                    {!isCorrect && (
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-4 animate-fade-in">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Reason for Failure (Required for Error Book logging)
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                            {(['Concept not cleared', 'Calculation mistake', 'Silly mistake', 'Insufficient time', 'Other'] as FailureReason[]).map(r => {
                              const isSelectedReason = activeReason === r;
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => handleSaveReason(q.id, r)}
                                  className={`p-2 rounded-lg text-[10px] font-semibold text-center border transition-all cursor-pointer ${
                                    isSelectedReason
                                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                                      : 'bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Text note input */}
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[10px] font-mono text-slate-500 uppercase">Personal failure analysis notes</label>
                          <textarea
                            value={activeNotes}
                            onChange={(e) => handleSaveNotes(q.id, e.target.value)}
                            placeholder="Add notes about your specific formula mistake, calculation shortcut, or memory slip-up..."
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 size={13} />
                            <span>Logged to Error Book</span>
                          </div>
                          <span>Saved to database</span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ================================== CUSTOM EXIT CONFIRMATION MODAL ================================== */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-6 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Exit Active Practice?</h3>
                <p className="text-[10px] font-mono text-slate-400">Action is irreversible</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your active exam questions and progress will be lost. Any answers selected in this session will not be saved to your logs or error book.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  setSessionStage('setup');
                  setIsPaused(false);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer text-center"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
