import { useState, FormEvent } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Concept, Topic } from '../types';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle,
  TrendingUp,
  Target,
  Search,
  Activity,
  Layers,
  HelpCircle,
  Play,
  Trash2
} from 'lucide-react';

interface SyllabusViewProps {
  onStartPracticeConcept: (conceptId: string) => void;
  selectedConceptIdFromOutside?: string;
  onClearConceptOverride?: () => void;
}

export default function SyllabusView({
  onStartPracticeConcept,
  selectedConceptIdFromOutside,
  onClearConceptOverride
}: SyllabusViewProps) {
  const {
    topics,
    questions,
    addTopic,
    deleteTopic,
    addSubtopic,
    addConcept,
    reorderTopics,
    reorderSubtopics,
    reorderConcepts,
    practiceSessions
  } = useAppState();

  // Selected state override tracking (scrolls or highlights a concept if passed in)
  const [highlightConceptId, setHighlightConceptId] = useState<string | null>(() => {
    return selectedConceptIdFromOutside || null;
  });

  // Handle outside selected concept overrides
  if (selectedConceptIdFromOutside && selectedConceptIdFromOutside !== highlightConceptId) {
    setHighlightConceptId(selectedConceptIdFromOutside);
    if (onClearConceptOverride) {
      onClearConceptOverride();
    }
  }

  // Topic collapse states (starts fully expanded for maximum readability)
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  // Confirm delete topic ID state for inline two-click delete flow
  const [confirmDeleteTopicId, setConfirmDeleteTopicId] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddSubtopic, setShowAddSubtopic] = useState(false);
  const [showAddConcept, setShowAddConcept] = useState(false);

  // Form input states
  const [newTopicName, setNewTopicName] = useState('');
  const [selectedTopicForSubtopic, setSelectedTopicForSubtopic] = useState('');
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [selectedSubtopicForConcept, setSelectedSubtopicForConcept] = useState('');
  const [newConceptName, setNewConceptName] = useState('');
  const [newConceptDesc, setNewConceptDesc] = useState('');

  // Toggle helpers
  const toggleTopicCollapse = (topicId: string) => {
    setCollapsedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // Concept Stats Calculator
  const getConceptStats = (conceptId: string) => {
    // Filter practice results
    const results = practiceSessions.flatMap(ps => ps.results).filter(res => {
      const q = questions.find(qu => qu.id === res.questionId);
      return q && q.conceptId === conceptId;
    });

    const totalAnswered = results.length;
    const correct = results.filter(r => r.isCorrect).length;
    const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

    const conceptSessions = practiceSessions.filter(ps => ps.conceptIds.includes(conceptId));
    const lastPracticed = conceptSessions.length > 0
      ? (() => {
          const d = new Date(Math.max(...conceptSessions.map(s => new Date(s.date).getTime())));
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          return `${dd}-${mm}-${yyyy}`;
        })()
      : 'Never';

    return {
      totalAnswered,
      accuracy,
      lastPracticed
    };
  };

  // Form handlers
  const handleCreateTopic = (e: FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addTopic(newTopicName.trim());
    setNewTopicName('');
    setShowAddTopic(false);
  };

  const handleCreateSubtopic = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTopicForSubtopic || !newSubtopicName.trim()) return;
    addSubtopic(selectedTopicForSubtopic, newSubtopicName.trim());
    setNewSubtopicName('');
    setShowAddSubtopic(false);
  };

  const handleCreateConcept = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSubtopicForConcept || !newConceptName.trim()) return;
    addConcept(selectedSubtopicForConcept, newConceptName.trim(), newConceptDesc.trim());
    setNewConceptName('');
    setNewConceptDesc('');
    setShowAddConcept(false);
  };

  // Overall syllabus stats
  const allConcepts = topics.flatMap(t => t.subtopics.flatMap(st => st.concepts));
  const totalTopicsCount = topics.length;
  const totalSubtopicsCount = topics.reduce((acc, t) => acc + t.subtopics.length, 0);
  const totalConceptsCount = allConcepts.length;
  const totalQuestionsCount = questions.length;

  const avgMastery = totalConceptsCount > 0
    ? Math.round(allConcepts.reduce((sum, c) => sum + c.mastery, 0) / totalConceptsCount)
    : 0;

  const allPracticeResults = practiceSessions.flatMap(ps => ps.results);
  const totalPracticedAnswers = allPracticeResults.length;
  const correctAnswersCount = allPracticeResults.filter(r => r.isCorrect).length;
  const overallAccuracy = totalPracticedAnswers > 0
    ? Math.round((correctAnswersCount / totalPracticedAnswers) * 100)
    : 0;

  // Search filtering logic
  const query = searchQuery.trim().toLowerCase();
  
  const filteredTopics = topics.map(t => {
    const matchesTopicName = t.name.toLowerCase().includes(query);
    
    const filteredSubtopics = t.subtopics.map(st => {
      const matchesSubtopicName = st.name.toLowerCase().includes(query);
      
      const filteredConcepts = st.concepts.filter(c => {
        const matchesConceptName = c.name.toLowerCase().includes(query);
        const matchesConceptDesc = (c.description || '').toLowerCase().includes(query);
        return matchesConceptName || matchesConceptDesc;
      });
      
      const hasMatchingConcepts = filteredConcepts.length > 0;
      
      if (matchesTopicName) {
        return st;
      }
      
      if (matchesSubtopicName) {
        return st;
      }
      
      if (hasMatchingConcepts) {
        return {
          ...st,
          concepts: filteredConcepts
        };
      }
      
      return null;
    }).filter(Boolean) as typeof t.subtopics;

    if (matchesTopicName) {
      return t;
    }
    
    if (filteredSubtopics.length > 0) {
      return {
        ...t,
        subtopics: filteredSubtopics
      };
    }
    
    return null;
  }).filter(Boolean) as Topic[];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      
      {/* 1. Header with Title and Global Search / Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="text-indigo-400" size={24} />
            Syllabus Tracker
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Track unit coverage, concept accuracy, and practice statuses
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddTopic(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 hover:border-slate-700 hover:text-white transition-all text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Topic</span>
          </button>
          <button
            onClick={() => {
              if (topics.length > 0) {
                setSelectedTopicForSubtopic(topics[0].id);
                setShowAddSubtopic(true);
              } else {
                alert('Please create a topic first!');
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 hover:border-slate-700 hover:text-white transition-all text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Subtopic</span>
          </button>
          <button
            onClick={() => {
              let firstSubId = '';
              for (const t of topics) {
                if (t.subtopics.length > 0) {
                  firstSubId = t.subtopics[0].id;
                  break;
                }
              }
              if (firstSubId) {
                setSelectedSubtopicForConcept(firstSubId);
                setShowAddConcept(true);
              } else {
                alert('Please create a subtopic first!');
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 hover:border-slate-700 hover:text-white transition-all text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Concept Card</span>
          </button>
        </div>
      </div>

      {/* 2. Bento Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Syllabus Coverage */}
        <div className="bg-slate-900/60 border border-slate-800/85 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Award size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Overall Mastery</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-white font-display">{avgMastery}%</span>
              <span className="text-[10px] font-mono text-indigo-400">syllabus coverage</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${avgMastery}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Units Count */}
        <div className="bg-slate-900/60 border border-slate-800/85 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <BookOpen size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Syllabus Index</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {totalTopicsCount} <span className="text-xs font-normal text-slate-400 font-sans">Topics</span> • {totalConceptsCount} <span className="text-xs font-normal text-slate-400 font-sans">Concepts</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">Organized into {totalSubtopicsCount} sub-modules</span>
          </div>
        </div>

        {/* Card 3: Questions bank */}
        <div className="bg-slate-900/60 border border-slate-800/85 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <HelpCircle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Loaded Questions</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {totalQuestionsCount} <span className="text-xs font-sans font-normal text-slate-400">Questions</span>
            </div>
            <span className="text-[9px] font-mono text-amber-400 mt-1 block">Ready for training drills</span>
          </div>
        </div>

        {/* Card 4: Practice Log */}
        <div className="bg-slate-900/60 border border-slate-800/85 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Activity size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Accuracy Rate</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-white font-mono">{overallAccuracy}%</span>
              <span className="text-[10px] font-mono text-slate-400">({totalPracticedAnswers} answers)</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">Live accuracy from sessions</span>
          </div>
        </div>
      </div>

      {/* 3. Global Filter and Search Area */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Filter topics, subtopics, or specific concept keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/45 hover:bg-slate-900/80 focus:bg-slate-950 border border-slate-800/80 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all font-mono"
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

      {/* 4. Separated Topic Blocks */}
      <div className="space-y-6">
        {filteredTopics.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl space-y-3 bg-slate-900/20">
            <BookOpen size={40} className="text-slate-600 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-white text-sm">No Curriculum Match</h4>
              <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto leading-relaxed">
                {searchQuery ? 'Your filter did not match any topics or concepts.' : 'No syllabus topics have been added yet.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setShowAddTopic(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
              >
                Create First Topic
              </button>
            )}
          </div>
        ) : (
          filteredTopics.map((t, tIdx) => {
            const isTopicCollapsed = collapsedTopics[t.id];
            
            // Topic stats calculation
            const tConcepts = t.subtopics.flatMap(st => st.concepts);
            const tConceptsCount = tConcepts.length;
            const tQuestionsCount = questions.filter(q => {
              const c = tConcepts.find(tc => tc.id === q.conceptId);
              return !!c;
            }).length;
            
            const tAvgMastery = tConceptsCount > 0
              ? Math.round(tConcepts.reduce((sum, c) => sum + c.mastery, 0) / tConceptsCount)
              : 0;

            return (
              <div
                key={t.id}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-slate-800 transition-colors duration-200"
              >
                {/* Topic Header Banner */}
                <div className="bg-slate-900 px-5 py-4 border-b border-slate-800/60 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTopicCollapse(t.id)}
                      className="p-1.5 rounded-lg bg-slate-950/85 hover:bg-slate-950 border border-slate-800/60 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                    >
                      {isTopicCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <div className="min-w-0">
                      <h3 className="font-display font-black text-xs md:text-sm text-slate-200 tracking-wider uppercase truncate">
                        {t.name}
                      </h3>
                      {/* Sub-stats for the Topic */}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-500 flex-wrap">
                        <span>{t.subtopics.length} subtopics</span>
                        <span>•</span>
                        <span>{tConceptsCount} concepts</span>
                        <span>•</span>
                        <span>{tQuestionsCount} questions</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-semibold">{tAvgMastery}% average mastery</span>
                      </div>
                    </div>
                  </div>

                  {/* Ordering Controls & Expand collapse */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-950/80 border border-slate-800/60 rounded-xl px-1.5 py-1 gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => reorderTopics(t.id, 'up')}
                        disabled={tIdx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Topic Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => reorderTopics(t.id, 'down')}
                        disabled={tIdx === topics.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Topic Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirmDeleteTopicId === t.id) {
                            deleteTopic(t.id);
                            setConfirmDeleteTopicId(null);
                          } else {
                            setConfirmDeleteTopicId(t.id);
                            // Auto-reset confirmation after 4 seconds
                            setTimeout(() => {
                              setConfirmDeleteTopicId(prev => prev === t.id ? null : prev);
                            }, 4000);
                          }
                        }}
                        className={`p-1 flex items-center gap-1 cursor-pointer border-l border-slate-800 ml-1 pl-1.5 transition-all text-[10px] font-mono font-semibold ${
                          confirmDeleteTopicId === t.id ? 'text-rose-500 hover:text-rose-400 bg-rose-500/10 rounded-md px-1.5' : 'text-slate-500 hover:text-rose-450'
                        }`}
                        title={confirmDeleteTopicId === t.id ? 'Click again to confirm delete' : 'Delete Topic'}
                      >
                        <Trash2 size={12} />
                        {confirmDeleteTopicId === t.id && <span>Confirm?</span>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtopics and Concepts content inside the Topic */}
                {!isTopicCollapsed && (
                  <div className="p-6 space-y-6 bg-slate-950/15">
                    {t.subtopics.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-xs text-slate-500 font-mono">No subtopics in this topic module.</p>
                        <button
                          onClick={() => {
                            setSelectedTopicForSubtopic(t.id);
                            setShowAddSubtopic(true);
                          }}
                          className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mx-auto"
                        >
                          <Plus size={12} />
                          Add Subtopic
                        </button>
                      </div>
                    ) : (
                      t.subtopics.map((st, stIdx) => {
                        return (
                          <div key={st.id} className="space-y-3.5 border-b border-slate-850/40 pb-6 last:border-b-0 last:pb-0">
                            
                            {/* Subtopic Header Bar */}
                            <div className="flex items-center justify-between pb-1 group/sub">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-1.5 h-3.5 rounded bg-indigo-500/60"></div>
                                <h4 className="font-display font-bold text-slate-300 text-xs md:text-sm truncate">
                                  {st.name}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                  ({st.concepts.length} concepts)
                                </span>
                              </div>

                              {/* Subtopic Reordering arrows */}
                              <div className="flex items-center bg-slate-900/50 border border-slate-850/50 rounded-lg px-1 py-0.5 gap-1 md:opacity-0 group-hover/sub:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => reorderSubtopics(t.id, st.id, 'up')}
                                  disabled={stIdx === 0}
                                  className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  title="Move Subtopic Up"
                                >
                                  <ArrowUp size={11} />
                                </button>
                                <button
                                  onClick={() => reorderSubtopics(t.id, st.id, 'down')}
                                  disabled={stIdx === t.subtopics.length - 1}
                                  className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  title="Move Subtopic Down"
                                >
                                  <ArrowDown size={11} />
                                </button>
                              </div>
                            </div>

                            {/* Concept list in Subtopic */}
                            <div className="space-y-3 pl-3">
                              {st.concepts.length === 0 ? (
                                <div className="py-4 text-center border border-dashed border-slate-850 bg-slate-950/20 rounded-xl">
                                  <p className="text-[11px] text-slate-500 font-mono">No concepts created in this subtopic yet.</p>
                                  <button
                                    onClick={() => {
                                      setSelectedSubtopicForConcept(st.id);
                                      setShowAddConcept(true);
                                    }}
                                    className="mt-1.5 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 mx-auto"
                                  >
                                    <Plus size={11} />
                                    Add Concept Card
                                  </button>
                                </div>
                              ) : (
                                st.concepts.map((c, cIdx) => {
                                  const cQuestions = questions.filter(q => q.conceptId === c.id);
                                  const cQuestionsCount = cQuestions.length;
                                  const cStats = getConceptStats(c.id);
                                  const isHighlighted = highlightConceptId === c.id;

                                  // Mastery styling
                                  const isHigh = c.mastery >= 80;
                                  const isMed = c.mastery >= 50 && c.mastery < 80;
                                  const masteryBadgeClass = isHigh
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : isMed
                                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                      : 'bg-slate-500/10 border-slate-800 text-slate-400';

                                  return (
                                    <div
                                      key={c.id}
                                      className={`border rounded-xl px-4 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-200 group/con ${
                                        isHighlighted
                                          ? 'bg-indigo-950/20 border-indigo-500/60 shadow-lg shadow-indigo-600/5'
                                          : 'bg-slate-950/40 border-slate-850 hover:bg-slate-950/80 hover:border-slate-800'
                                      }`}
                                    >
                                      {/* Left block: Name */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h5 className="font-display font-semibold text-xs md:text-sm text-slate-200">
                                            {c.name}
                                          </h5>
                                          {isHighlighted && (
                                            <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-indigo-600 text-white rounded uppercase animate-pulse">
                                              Focused
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Center block: Progress bar and stats info */}
                                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 shrink-0">
                                        
                                        {/* Mastery Visual */}
                                        <div className="flex items-center gap-2.5">
                                          <div className="text-right">
                                            <span className="text-[9px] font-mono text-slate-500 block uppercase">Mastery</span>
                                            <span className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-bold inline-block mt-0.5 ${masteryBadgeClass}`}>
                                              {c.mastery}%
                                            </span>
                                          </div>
                                          <div className="w-16 bg-slate-900 h-1.5 rounded-full overflow-hidden shrink-0 hidden sm:block">
                                            <div
                                              className={`h-full rounded-full ${isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-slate-500'}`}
                                              style={{ width: `${c.mastery}%` }}
                                            ></div>
                                          </div>
                                        </div>

                                        {/* Stat: Questions Bank */}
                                        <div className="text-left sm:text-center min-w-[70px]">
                                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Questions</span>
                                          <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 inline-block">
                                            {cQuestionsCount} <span className="text-[10px] text-slate-400 font-sans font-normal">Qs</span>
                                          </span>
                                        </div>

                                        {/* Stat: Times Practiced */}
                                        <div className="text-left sm:text-center min-w-[70px]">
                                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Practiced</span>
                                          <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 inline-block">
                                            {cStats.totalAnswered} <span className="text-[10px] text-slate-400 font-sans font-normal">times</span>
                                          </span>
                                        </div>

                                        {/* Stat: Concept Accuracy */}
                                        <div className="text-left sm:text-center min-w-[70px]">
                                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Accuracy</span>
                                          <span className={`text-xs font-mono font-bold mt-0.5 inline-block ${
                                            cStats.totalAnswered > 0
                                              ? cStats.accuracy >= 80 ? 'text-emerald-400' : cStats.accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'
                                              : 'text-slate-500'
                                          }`}>
                                            {cStats.totalAnswered > 0 ? `${cStats.accuracy}%` : '—'}
                                          </span>
                                        </div>

                                        {/* Stat: Last Session */}
                                        <div className="text-left min-w-[90px] hidden sm:block">
                                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Last practice</span>
                                          <span className="text-xs font-semibold text-slate-300 mt-0.5 flex items-center gap-1">
                                            <Clock size={11} className="text-slate-500" />
                                            {cStats.lastPracticed}
                                          </span>
                                        </div>

                                      </div>

                                      {/* Right block: Action drills & reordering */}
                                      <div className="flex items-center justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t border-slate-900 lg:border-t-0">
                                        
                                        {/* Quick Practice button */}
                                        {cQuestionsCount > 0 ? (
                                          <button
                                            onClick={() => onStartPracticeConcept(c.id)}
                                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95"
                                          >
                                            <Play size={11} className="fill-current" />
                                            Practice
                                          </button>
                                        ) : (
                                          <div
                                            className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-500 font-semibold text-xs flex items-center gap-1.5 cursor-not-allowed"
                                            title="Add questions via Import first to unlock practice."
                                          >
                                            <Play size={11} className="opacity-50" />
                                            No Qs
                                          </div>
                                        )}

                                        {/* Concept level ordering arrows */}
                                        <div className="flex items-center bg-slate-900/40 border border-slate-850/50 rounded-lg px-0.5 py-0.5 gap-0.5 md:opacity-0 group-hover/con:opacity-100 transition-opacity duration-200">
                                          <button
                                            onClick={() => reorderConcepts(st.id, c.id, 'up')}
                                            disabled={cIdx === 0}
                                            className="p-0.5 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            title="Move Concept Up"
                                          >
                                            <ArrowUp size={11} />
                                          </button>
                                          <button
                                            onClick={() => reorderConcepts(st.id, c.id, 'down')}
                                            disabled={cIdx === st.concepts.length - 1}
                                            className="p-0.5 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            title="Move Concept Down"
                                          >
                                            <ArrowDown size={11} />
                                          </button>
                                        </div>

                                      </div>

                                    </div>
                                  );
                                })
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ===================================== MODALS ===================================== */}
      
      {/* 1. Add Topic Modal */}
      {showAddTopic && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              Create New Topic
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Topic Name (e.g., Geometry, Algebra)</label>
                <input
                  type="text"
                  required
                  placeholder="Enter topic name..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddTopic(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Subtopic Modal */}
      {showAddSubtopic && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              Create New Subtopic
            </h3>
            <form onSubmit={handleCreateSubtopic} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Parent Topic</label>
                <select
                  value={selectedTopicForSubtopic}
                  onChange={(e) => setSelectedTopicForSubtopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Subtopic Name (e.g., Circles, Triangles)</label>
                <input
                  type="text"
                  required
                  placeholder="Enter subtopic name..."
                  value={newSubtopicName}
                  onChange={(e) => setNewSubtopicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddSubtopic(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Add Subtopic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Concept Modal */}
      {showAddConcept && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-up">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              Create Concept Card
            </h3>
            <form onSubmit={handleCreateConcept} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Parent Subtopic</label>
                <select
                  value={selectedSubtopicForConcept}
                  onChange={(e) => setSelectedSubtopicForConcept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {topics.flatMap(t => t.subtopics).map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Concept Name (e.g., Angle of Elevation)</label>
                <input
                  type="text"
                  required
                  placeholder="Enter concept name..."
                  value={newConceptName}
                  onChange={(e) => setNewConceptName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Short Explanation / Description</label>
                <textarea
                  placeholder="Add details, formula tricks, or core theorems..."
                  value={newConceptDesc}
                  onChange={(e) => setNewConceptDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowAddConcept(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Add Concept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
