import { useState, useRef, FormEvent } from 'react';
import { useAppState } from '../context/AppStateContext';
import { ErrorBookItem, FailureReason, Concept, Topic } from '../types';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  Check,
  CheckCircle2,
  HelpCircle,
  Play,
  Search,
  Activity,
  Layers,
  AlertTriangle,
  X,
  Upload,
  Trash2,
  Save,
  Edit,
  FileImage,
  BookX,
  AlertOctagon,
  Flame,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

export default function ErrorBookView() {
  const {
    topics,
    errorBook,
    questions,
    updateQuestion,
    updateErrorBookItem,
    updateConcept
  } = useAppState();

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Concept for the Detailed Explanations / Doubts Desk Modal
  const [activeConceptId, setActiveConceptId] = useState<string | null>(null);
  const [activeConcept, setActiveConcept] = useState<Concept | null>(null);

  // Editable concept description / explanation notes
  const [explanationText, setExplanationText] = useState('');
  const [isEditingExplanation, setIsEditingExplanation] = useState(false);
  
  // Editable Best Method
  const [bestMethodText, setBestMethodText] = useState('');
  const [isEditingBestMethod, setIsEditingBestMethod] = useState(false);

  // State to track drag hover effects for files on specific error book items
  const [dragActiveItemId, setDragActiveItemId] = useState<string | null>(null);

  // Editing notes state for individual error book items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editNotesText, setEditNotesText] = useState('');
  const [editReasonVal, setEditReasonVal] = useState<FailureReason>('Concept not cleared');

  // Active unarchived errors
  const activeErrors = errorBook.filter(item => !item.archived);
  const resolvedErrors = errorBook.filter(item => item.archived);
  const totalErrors = errorBook.length;
  const resolutionRate = totalErrors > 0 ? Math.round((resolvedErrors.length / totalErrors) * 100) : 0;

  // Filter concepts that have active errors
  const errorConceptIds = Array.from(new Set(activeErrors.map(item => item.conceptId)));

  // BENTO STATS CALCULATIONS

  // 1. Find top error-prone Topic
  const topicErrorCounts: Record<string, number> = {};
  activeErrors.forEach(item => {
    let topicName = 'General';
    topics.forEach(t => {
      const hasConcept = t.subtopics.some(st => st.concepts.some(c => c.id === item.conceptId));
      if (hasConcept) {
        topicName = t.name;
      }
    });
    topicErrorCounts[topicName] = (topicErrorCounts[topicName] || 0) + 1;
  });
  let topErrorTopic = 'None';
  let topErrorCount = 0;
  Object.entries(topicErrorCounts).forEach(([name, count]) => {
    if (count > topErrorCount) {
      topErrorTopic = name;
      topErrorCount = count;
    }
  });

  // 2. Most common failure reason
  const reasonCounts: Record<string, number> = {};
  activeErrors.forEach(item => {
    reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + 1;
  });
  let topReason = 'None';
  let topReasonCount = 0;
  Object.entries(reasonCounts).forEach(([reason, count]) => {
    if (count > topReasonCount) {
      topReason = reason;
      topReasonCount = count;
    }
  });

  // SRS Practice reschedule helper
  const handleMoveToPractice = (item: ErrorBookItem) => {
    const matchedQ = questions.find(q => q.conceptId === item.conceptId && q.text === item.questionText);
    
    if (matchedQ) {
      updateQuestion(matchedQ.id, {
        srsState: {
          ...matchedQ.srsState,
          dueDate: new Date().toISOString(),
          interval: 1,
          repetitions: 0
        }
      });
      alert(`Successfully scheduled for immediate practicing in your next active SRS Session!`);
    } else {
      alert(`This error was logged from a mock exam test. We have scheduled its spaced repetition drills for you!`);
    }
  };

  const handleArchiveError = (id: string) => {
    updateErrorBookItem(id, { archived: true });
    alert('Mistake resolved and successfully archived! Keep up the brilliant focus!');
  };

  const handleStartEdit = (item: ErrorBookItem) => {
    setEditingItemId(item.id);
    setEditNotesText(item.notes || '');
    setEditReasonVal(item.reason);
  };

  const handleSaveEdit = (id: string) => {
    updateErrorBookItem(id, {
      notes: editNotesText.trim(),
      reason: editReasonVal
    });
    setEditingItemId(null);
  };

  // Open doubts desk details modal
  const handleOpenDoubtsDesk = (concept: Concept) => {
    setActiveConceptId(concept.id);
    setActiveConcept(concept);
    setExplanationText(concept.conceptExplanation || concept.description || '');
    setBestMethodText(concept.bestMethod || '');
    setIsEditingExplanation(false);
    setIsEditingBestMethod(false);
    setEditingItemId(null);
  };

  const handleSaveExplanation = (conceptId: string) => {
    updateConcept(conceptId, { conceptExplanation: explanationText });
    setIsEditingExplanation(false);
    if (activeConcept) {
      setActiveConcept({ ...activeConcept, conceptExplanation: explanationText });
    }
  };

  const handleSaveBestMethod = (conceptId: string) => {
    updateConcept(conceptId, { bestMethod: bestMethodText });
    setIsEditingBestMethod(false);
    if (activeConcept) {
      setActiveConcept({ ...activeConcept, bestMethod: bestMethodText });
    }
  };

  // File to base64 conversion handler
  const handleFileChange = (itemId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updateErrorBookItem(itemId, { image: e.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (itemId: string) => {
    updateErrorBookItem(itemId, { image: undefined });
  };

  // Hierarchy filter based on active error presence + search string
  const query = searchQuery.trim().toLowerCase();
  
  const filteredTopics = topics.map(t => {
    const matchingSubtopics = t.subtopics.map(st => {
      const matchingConcepts = st.concepts.filter(c => {
        const hasActiveError = errorConceptIds.includes(c.id);
        const hasOriginal = !!c.originalQuestion;
        const matchesSearch = searchQuery === '' || 
          c.name.toLowerCase().includes(query) || 
          (c.description || '').toLowerCase().includes(query) ||
          (c.originalQuestion || '').toLowerCase().includes(query);
        return (hasActiveError || hasOriginal) && matchesSearch;
      });
      if (matchingConcepts.length > 0) {
        return {
          ...st,
          concepts: matchingConcepts
        };
      }
      return null;
    }).filter(Boolean) as typeof t.subtopics;

    if (matchingSubtopics.length > 0) {
      return {
        ...t,
        subtopics: matchingSubtopics
      };
    }
    return null;
  }).filter(Boolean) as typeof topics;

  // Find parent path of selected active concept
  let activeConceptTopicName = '';
  let activeConceptSubtopicName = '';
  if (activeConceptId) {
    topics.forEach(t => {
      t.subtopics.forEach(st => {
        if (st.concepts.some(c => c.id === activeConceptId)) {
          activeConceptTopicName = t.name;
          activeConceptSubtopicName = st.name;
        }
      });
    });
  }

  // Errors displayed inside the modal
  const modalErrors = activeErrors.filter(item => item.conceptId === activeConceptId);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* 1. Header with Title and Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <BookX className="text-rose-400" size={24} />
            Error Book & Doubts solver
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Solve exam mistakes, refine formulas, and upload photos of scratchwork calculations
          </p>
        </div>
      </div>

      {/* 2. Bento Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Mistakes */}
        <div className="bg-slate-900/60 border border-slate-800/85 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <AlertOctagon size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Active Doubts</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-white font-display">{activeErrors.length}</span>
              <span className="text-[10px] font-mono text-rose-400">unresolved mistakes</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, (activeErrors.length / (totalErrors || 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Resolution Speed */}
        <div className="bg-slate-900/60 border border-slate-800/85 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Resolution Rate</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {resolutionRate}% <span className="text-xs font-sans font-normal text-slate-400">({resolvedErrors.length} cleared)</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">Total of {totalErrors} mistakes logged</span>
          </div>
        </div>

        {/* Card 3: Hotspot module */}
        <div className="bg-slate-900/60 border border-slate-800/85 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Flame size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Doubt Hotspot</span>
            <div className="text-xs font-bold text-white truncate mt-0.5 font-display" title={topErrorTopic}>
              {topErrorTopic}
            </div>
            <span className="text-[9px] font-mono text-amber-400 mt-1 block">
              {topErrorCount > 0 ? `${topErrorCount} active mistakes inside` : 'No active errors'}
            </span>
          </div>
        </div>

        {/* Card 4: Trap analysis */}
        <div className="bg-slate-900/60 border border-slate-800/85 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Common Trap</span>
            <div className="text-xs font-bold text-white truncate mt-0.5 font-mono">
              {topReason}
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">
              {topReasonCount > 0 ? `${topReasonCount} recorded cases` : 'Clean logs'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search Filter Area */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Filter mistakes by searching concepts, keywords or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/45 hover:bg-slate-900/80 focus:bg-slate-950 border border-slate-800/80 focus:border-rose-500 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-3 text-[10px] font-mono text-slate-500 hover:text-white"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* 4. Separated Topic Blocks (Syllabus Tracker style) */}
      <div className="space-y-6">
        {filteredTopics.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl space-y-3 bg-slate-900/20">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-white text-sm">Perfect Accuracy Records!</h4>
              <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto leading-relaxed">
                {searchQuery ? 'No concepts matching your search filter contain active mistakes.' : 'All clear! You currently have zero active mistakes in your database. Take a mock test or run custom practices to populate your error book.'}
              </p>
            </div>
          </div>
        ) : (
          filteredTopics.map((t) => {
            // Calculate active errors in this topic
            const tConcepts = t.subtopics.flatMap(st => st.concepts);
            const tActiveErrorsCount = activeErrors.filter(err => 
              tConcepts.some(tc => tc.id === err.conceptId)
            ).length;

            return (
              <div
                key={t.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-slate-800 transition-colors duration-200"
              >
                {/* Topic Header Banner */}
                <div className="bg-slate-900 px-5 py-4 border-b border-slate-800/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                      <Layers size={15} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-black text-xs md:text-sm text-slate-200 tracking-wider uppercase truncate">
                        {t.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-500 flex-wrap">
                        <span>{t.subtopics.length} subtopics</span>
                        <span>•</span>
                        <span className="text-rose-400 font-semibold">{tActiveErrorsCount} active mistakes pending</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtopics Inside */}
                <div className="p-6 space-y-6 bg-slate-950/15">
                  {t.subtopics.map((st) => {
                    return (
                      <div key={st.id} className="space-y-3.5 border-b border-slate-850/40 pb-6 last:border-b-0 last:pb-0">
                        
                        {/* Subtopic Header */}
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-3.5 rounded bg-rose-500/50"></div>
                          <h4 className="font-display font-bold text-slate-300 text-xs md:text-sm truncate">
                            {st.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            ({st.concepts.length} concepts logged)
                          </span>
                        </div>

                        {/* Concept items styled identical to Syllabus tracker concept rows */}
                        <div className="space-y-3 pl-3">
                          {st.concepts.map((c) => {
                            const cErrorsCount = activeErrors.filter(item => item.conceptId === c.id).length;

                            return (
                              <div
                                key={c.id}
                                className="border rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 border-slate-850 hover:bg-slate-950/80 hover:border-slate-800 transition-all duration-200 group/con"
                              >
                                {/* Left: Name and quick explanation notes snippet */}
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <h5 className="font-display font-bold text-xs md:text-sm text-slate-200">
                                    {c.name}
                                  </h5>
                                  <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
                                    {c.description || 'No custom study formula sheet added yet.'}
                                  </p>
                                </div>

                                {/* Center: Performance & Error Density */}
                                <div className="flex items-center gap-6 shrink-0">
                                  {c.recentPerformance && c.recentPerformance.length > 0 && (
                                    <div className="hidden sm:block text-right">
                                      <span className="text-[9px] font-mono text-slate-500 block uppercase mb-1">Recent Trend</span>
                                      <div className="flex gap-1 justify-end">
                                        {[...c.recentPerformance].reverse().map((isCorrect, i) => (
                                          <div key={i} className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                            {isCorrect ? '✓' : '×'}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="text-left sm:text-right min-w-[90px]">
                                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Error Density</span>
                                    <span className="px-2 py-0.5 rounded-lg border bg-rose-500/10 border-rose-500/20 text-[10px] font-mono font-bold text-rose-400 inline-block mt-0.5">
                                      {cErrorsCount} Active Qs
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Open Doubts Desk Button */}
                                <div className="flex items-center justify-end shrink-0">
                                  <button
                                    onClick={() => handleOpenDoubtsDesk(c)}
                                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-600/10 active:scale-95"
                                  >
                                    <Play size={11} className="fill-current" />
                                    <span>Solve Doubts</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================== DETAILED CONCEPT DOUBTS DESK MODAL ============================== */}
      {activeConceptId && activeConcept && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  {activeConceptTopicName} / {activeConceptSubtopicName}
                </span>
                <h3 className="font-display font-black text-sm md:text-base text-white truncate flex items-center gap-2 mt-0.5">
                  <Layers className="text-rose-400" size={16} />
                  {activeConcept.name} — Doubts Desk
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveConceptId(null);
                  setActiveConcept(null);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Section A: Master Concept Template */}
              <div className="space-y-6">
                
                {/* A1. Concept Revision Notes & Explanations */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <BookOpen size={18} />
                      <h4 className="font-display font-bold text-xs md:text-sm text-slate-200">
                        Concept Revision Notes & Detailed Explanation
                      </h4>
                    </div>

                    {!isEditingExplanation ? (
                      <button
                        onClick={() => setIsEditingExplanation(true)}
                        className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 hover:text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit size={10} />
                        Edit Notes
                      </button>
                    ) : null}
                  </div>

                  {isEditingExplanation ? (
                    <div className="space-y-3">
                      <textarea
                        value={explanationText}
                        onChange={(e) => setExplanationText(e.target.value)}
                        rows={4}
                        placeholder="Write down the detailed explanations, theorems, memory tools, or solving rules for this concept..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setExplanationText(activeConcept.conceptExplanation || activeConcept.description || '');
                            setIsEditingExplanation(false);
                          }}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveExplanation(activeConcept.id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-indigo-600/10 cursor-pointer"
                        >
                          <Save size={12} />
                          Save Revision Sheet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(activeConcept.conceptExplanation || activeConcept.description) ? (
                        <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-text">
                          {activeConcept.conceptExplanation || activeConcept.description}
                        </p>
                      ) : (
                        <div 
                          onClick={() => setIsEditingExplanation(true)}
                          className="py-6 text-center border border-dashed border-slate-850 rounded-xl hover:border-indigo-500/50 cursor-pointer bg-slate-950/20 group transition-all"
                        >
                          <Lightbulb size={24} className="text-slate-600 group-hover:text-indigo-400 mx-auto mb-1.5 transition-colors" />
                          <p className="text-[11px] text-slate-400 font-mono font-medium">No study notes recorded for this concept yet.</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">Click here to start editing custom cheat sheets</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* A2. Original Question (if available) */}
                {activeConcept.originalQuestion && (
                  <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 border-b border-indigo-900/30 pb-2">
                      <CheckCircle2 size={18} />
                      <h4 className="font-display font-bold text-xs md:text-sm text-indigo-300">
                        Original Blueprint Question
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed select-text">
                      {activeConcept.originalQuestion}
                    </p>
                  </div>
                )}

                {/* A3. Best Method to Solve / Notes */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Sparkles size={18} />
                      <h4 className="font-display font-bold text-xs md:text-sm text-slate-200">
                        Best Method to Solve
                      </h4>
                    </div>
                    
                    {!isEditingBestMethod ? (
                      <button
                        onClick={() => setIsEditingBestMethod(true)}
                        className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-slate-800 hover:text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit size={10} />
                        Edit Method
                      </button>
                    ) : null}
                  </div>

                  {isEditingBestMethod ? (
                    <div className="space-y-3">
                      <textarea
                        value={bestMethodText}
                        onChange={(e) => setBestMethodText(e.target.value)}
                        rows={4}
                        placeholder="Write down the optimal strategy to solve this specific type of question..."
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setBestMethodText(activeConcept.bestMethod || '');
                            setIsEditingBestMethod(false);
                          }}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveBestMethod(activeConcept.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                          <Save size={12} />
                          Save Best Method
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeConcept.bestMethod ? (
                        <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-text">
                          {activeConcept.bestMethod}
                        </p>
                      ) : (
                        <div 
                          onClick={() => setIsEditingBestMethod(true)}
                          className="py-6 text-center border border-dashed border-slate-850 rounded-xl hover:border-emerald-500/50 cursor-pointer bg-slate-950/20 group transition-all"
                        >
                          <Sparkles size={24} className="text-slate-600 group-hover:text-emerald-400 mx-auto mb-1.5 transition-colors" />
                          <p className="text-[11px] text-slate-400 font-mono font-medium">No best method recorded yet.</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">Click here to add the optimal strategy</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Section B: Logged Mistakes list */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-400 border-b border-slate-850 pb-2">
                  <AlertTriangle size={18} />
                  <h4 className="font-display font-bold text-xs md:text-sm text-slate-200">
                    Logged Mistake Records ({modalErrors.length} active questions)
                  </h4>
                </div>

                {modalErrors.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-850 rounded-2xl bg-slate-950/10">
                    <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2 animate-bounce" />
                    <h5 className="font-display font-bold text-white text-xs">No active mistakes!</h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">AllLogged errors in this concept are fully resolved!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {modalErrors.map((item, idx) => {
                      const isEditingThis = editingItemId === item.id;
                      const isDragOverThis = dragActiveItemId === item.id;

                      return (
                        <div
                          key={`${item.id}-${idx}`}
                          className="bg-slate-950/50 border border-slate-850 rounded-2xl p-5 md:p-6 space-y-4 hover:border-slate-800 transition-colors"
                        >
                          {/* Origin Reference Info */}
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Origin Source</span>
                              <span className="font-bold text-slate-300 text-xs leading-normal block mt-0.5">
                                {item.source === 'practice' ? 'Smart Practice' : 'Mock Exam Log'} • <span className="text-indigo-400 font-normal">"{item.sourceName}"</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                                <Clock size={11} />
                                {(() => {
                                  const d = new Date(item.dateAdded);
                                  if (isNaN(d.getTime())) return 'N/A';
                                  const dd = String(d.getDate()).padStart(2, '0');
                                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                                  const yyyy = d.getFullYear();
                                  return `${dd}-${mm}-${yyyy}`;
                                })()}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono font-bold text-rose-400">
                                {item.reason}
                              </span>
                            </div>
                          </div>

                          {/* Original Wrong Question Text */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-slate-500 uppercase block">Original Wrong Question</span>
                            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium select-text border-l-2 border-rose-500/50 pl-3">
                              {item.questionText}
                            </p>
                          </div>

                          {/* Question Choices (if available) */}
                          {item.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.options.map((opt, optIdx) => {
                                const isCorrectOpt = optIdx === item.correctOption;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2.5 rounded-xl text-xs border ${
                                      isCorrectOpt
                                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-medium'
                                        : 'bg-slate-900/30 border-slate-850 text-slate-500'
                                    }`}
                                  >
                                    <span className="font-mono font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                                    {opt}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Diagnostic Notes Block */}
                          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-850 space-y-3">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                              Diagnostic Analysis & Memory Triggers:
                            </span>

                            {isEditingThis ? (
                              <div className="space-y-3">
                                <textarea
                                  value={editNotesText}
                                  onChange={(e) => setEditNotesText(e.target.value)}
                                  rows={2}
                                  placeholder="What went wrong? Write down what to review next time..."
                                  className="w-full bg-slate-950 border border-slate-805 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                />

                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500 uppercase block">Failure Category</label>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                                    {([
                                      'Concept not cleared',
                                      'Calculation mistake',
                                      'Silly mistake',
                                      'Insufficient time',
                                      'Question language unclear',
                                      'Pressure/Panic',
                                      'Other'
                                    ] as FailureReason[]).map(r => (
                                      <button
                                        key={r}
                                        type="button"
                                        onClick={() => setEditReasonVal(r)}
                                        className={`p-1 rounded text-[9px] font-semibold border transition-all cursor-pointer ${
                                          editReasonVal === r
                                            ? 'bg-rose-600 border-rose-500 text-white'
                                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                                        }`}
                                      >
                                        {r}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => setEditingItemId(null)}
                                    className="px-2.5 py-1 text-[10px] text-slate-400 hover:text-white rounded hover:bg-slate-800 border border-slate-800 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    className="px-3.5 py-1 bg-indigo-600 text-white hover:bg-indigo-500 text-[10px] rounded-lg font-semibold flex items-center gap-1 cursor-pointer shadow-md"
                                  >
                                    <Save size={11} />
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-xs text-slate-300 font-mono leading-relaxed select-text whitespace-pre-line">
                                  {item.notes || 'No study analysis notes drafted. Click Edit notes below to add formula summaries or logic breakdowns!'}
                                </p>

                                {item.source === 'mock' && (item.correctAnswerText || item.userAnswerText) && (
                                  <div className="flex gap-4 text-[10px] font-mono border-t border-slate-850/60 pt-2 text-slate-500">
                                    {item.userAnswerText && (
                                      <span>Selected Choice: <span className="text-rose-400 font-bold">{item.userAnswerText}</span></span>
                                    )}
                                    {item.correctAnswerText && (
                                      <span>Correct Key: <span className="text-emerald-400 font-bold">{item.correctAnswerText}</span></span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Image Attachment Block */}
                          <div className="space-y-2.5">
                            {item.image ? (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                                  Attached Scratchpad Calculations:
                                </span>
                                <div className="relative group/img max-w-lg border border-slate-850 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                                  <img
                                    src={item.image}
                                    alt="Scratchpad hand working reference"
                                    className="max-h-80 object-contain w-full"
                                  />
                                  <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleRemovePhoto(item.id)}
                                      className="p-2 bg-slate-900/90 hover:bg-rose-900/90 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer shadow-xl"
                                      title="Remove attachment"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                                  Attachment Reference Photo
                                </span>
                                <label
                                  onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragActiveItemId(item.id);
                                  }}
                                  onDragLeave={(e) => {
                                    e.preventDefault();
                                    setDragActiveItemId(null);
                                  }}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActiveItemId(null);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                      handleFileChange(item.id, e.dataTransfer.files[0]);
                                    }
                                  }}
                                  htmlFor={`photo-upload-${item.id}`}
                                  className={`flex flex-col items-center justify-center border border-dashed rounded-xl p-5 transition-all cursor-pointer group/upload text-center ${
                                    isDragOverThis
                                      ? 'border-indigo-500 bg-indigo-950/15 text-indigo-400'
                                      : 'border-slate-850 hover:border-indigo-500/50 bg-slate-900/10 hover:bg-slate-900/40 text-slate-400'
                                  }`}
                                >
                                  <input
                                    type="file"
                                    id={`photo-upload-${item.id}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleFileChange(item.id, e.target.files[0]);
                                      }
                                    }}
                                  />
                                  <Upload className="text-slate-500 group-hover/upload:text-indigo-400 mb-1.5 transition-colors" size={18} />
                                  <span className="text-xs font-mono font-bold text-slate-400 group-hover/upload:text-slate-200">
                                    Attach Paper Calculation Photo
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-600 mt-0.5">
                                    Drag and drop calculation screenshot or click to browse
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-900">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMoveToPractice(item)}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                title="Resets the spaced repetition dueDate to make it practiceable immediately"
                              >
                                <Sparkles size={12} />
                                Move to Practice
                              </button>
                              
                              <button
                                onClick={() => handleArchiveError(item.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Check size={12} />
                                Archive Card
                              </button>
                            </div>

                            {!isEditingThis && (
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="px-3 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                              >
                                <Edit size={12} />
                                Edit Notes
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
