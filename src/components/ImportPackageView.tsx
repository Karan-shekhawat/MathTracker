import { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Question, Concept } from '../types';
import {
  FileText,
  Play,
  CheckCircle,
  HelpCircle,
  Edit,
  Save,
  Trash2,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Search,
  Calendar,
  History,
  BookOpen,
  Flag
} from 'lucide-react';
import MathText from './MathText';

interface ImportPackageViewProps {
  onImportComplete: () => void;
}

const SAMPLE_MARKDOWN = `# Package: Trigonometry - Heights and Distances

Topic: Trigonometry
Subtopic: Applications of Trigonometry
Concept: Heights and Distances

#Original
Concept Explanation: This explains how this type of question is generally solved. Angles of elevation and depression relate the height of an object to the distance from the observer using trigonometric ratios like tangent.
Original Question: From a point on the ground, the angle of elevation of the top of a tower is 30°. After walking 20m towards the tower, the angle of elevation becomes 60°. Find the height of the tower.
Options:
A. 10 m
B. 10√3 m
C. 20 m
D. 20√3 m
Answer: B
Difficulty: Medium (Original)
Best Method to Solve: Use the formula h = d / (cotθ1 - cotθ2) where d is the distance walked. Here, h = 20 / (√3 - 1/√3) = 10√3 m.

## Generated Questions

### Easy
Q1. A ladder 15 m long just reaches the top of a vertical wall. If the ladder makes an angle of 60° with the wall, find the height of the wall.
Options:
A. 7.5 m
B. 15 m
C. 13 m
D. 8.5 m
Answer: A
Explanation: Let h be the height of the wall. The angle made with the wall is 60°, so the angle made with the ground is 30°. Using sin(30°) = height / hypotenuse => sin(30°) = h / 15 => 0.5 = h / 15 => h = 7.5 m.

Q2. If the ratio of the height of a tower and the length of its shadow is √3 : 1, what is the angle of elevation of the sun?
Options:
A. 30°
B. 45°
C. 60°
D. 90°
Answer: C
Explanation: tan(θ) = Height / Shadow = √3 / 1 = √3. Therefore θ = 60°.

Q3. The shadow of a vertical pole on level ground is 12 m long. If the angle of elevation of the sun is 45°, find the height of the pole.
Options:
A. 6 m
B. 12 m
C. 24 m
D. 12√2 m
Answer: B
Explanation: tan(45°) = height / shadow = height / 12. Since tan(45°) = 1, height = 12 m.

### Medium
Q4. A man of height 1.8 m is standing 15 m away from a tall lamp post. If the angle of elevation of the top of the lamp post from his eyes is 45°, find the total height of the lamp post.
Options:
A. 15 m
B. 16.8 m
C. 13.2 m
D. 18 m
Answer: B
Explanation: Let height of lamp post above the man's eye level be x. Then tan(45°) = x / 15 => 1 = x / 15 => x = 15 m. Total height of lamp post = x + man's height = 15 + 1.8 = 16.8 m.

Q5. A tree breaks due to a storm and the broken part bends so that the top of the tree touches the ground making an angle of 30° with it. The distance from the foot of the tree to the point where the top touches the ground is 8 m. Find the height of the tree.
Options:
A. 8√3 m
B. 8/√3 m
C. 16/√3 m
D. 24√3 m
Answer: A
Explanation: Total height of tree is height of upright part (h) + length of broken part (hypotenuse l). tan(30°) = h / 8 => h = 8 / √3. cos(30°) = 8 / l => l = 16 / √3. Total height = h + l = 24 / √3 = 8√3 m.

Q6. From a point on the ground 40 m away from the foot of a tower, the angle of elevation of the top of the tower is 30°. Find the height of the tower.
Options:
A. 40√3 m
B. 40/√3 m
C. 20 m
D. 20√3 m
Answer: B
Explanation: tan(30°) = height / 40 => 1/v3 = height / 40 => height = 40/v3 m.

Q7. A kite is flying at a height of 60 m above the ground. The string attached to the kite is temporarily tied to a point on the ground. The inclination of the string with the ground is 60°. Find the length of the string, assuming that there is no slack in the string.
Options:
A. 40√3 m
B. 30√3 m
C. 120 m
D. 60√2 m
Answer: A
Explanation: Let L be the length of the string. sin(60°) = height / L => √3 / 2 = 60 / L => L = 120 / √3 = 40√3 m.

### Hard
Q8. From the top of a 7 m high building, the angle of elevation of the top of a cable tower is 60° and the angle of depression of its foot is 45°. Determine the height of the tower.
Options:
A. 7(√3 + 1) m
B. 7(√3 - 1) m
C. 14√3 m
D. 21 m
Answer: A
Explanation: Let the distance to the tower be d. Since depression to foot is 45°, building height / d = tan(45°) => 7 / d = 1 => d = 7 m. Let tower height above building be h. tan(60°) = h / d => √3 = h / 7 => h = 7√3 m. Total tower height = 7 + 7√3 = 7(√3 + 1) m.

Q9. As observed from the top of a 75 m high lighthouse from the sea-level, the angles of depression of two ships are 30° and 45°. If one ship is exactly behind the other on the same side of the lighthouse, find the distance between the two ships.
Options:
A. 75(√3 - 1) m
B. 75(√3 + 1) m
C. 150 m
D. 75√3 m
Answer: A
Explanation: Let d1 and d2 be the distances of the two ships from the lighthouse. For the closer ship, tan(45°) = 75 / d1 => d1 = 75 m. For the further ship, tan(30°) = 75 / d2 => 1/v3 = 75 / d2 => d2 = 75v3 m. Distance between ships = d2 - d1 = 75(v3 - 1) m.

Q10. A straight highway leads to the foot of a tower. A man standing at the top of the tower observes a car at an angle of depression of 30°, which is approaching the foot of the tower with a uniform speed. Six seconds later, the angle of depression of the car is found to be 60°. Find the time taken by the car to reach the foot of the tower from this point.
Options:
A. 3 seconds
B. 6 seconds
C. 9 seconds
D. 4 seconds
Answer: A
Explanation: Let h be tower height, speed be v, and remaining time be t. Distance traveled in 6s is 6v. Remaining distance is tv. tan(30°) = h / (6v + tv) => h = (6 + t)v / √3. tan(60°) = h / tv => h = tv * √3. Equating both: (6 + t)v / √3 = tv * √3 => 6 + t = 3t => 2t = 6 => t = 3 seconds.`;

export default function ImportPackageView({ onImportComplete }: ImportPackageViewProps) {
  const { topics, questions, importMarkdownPackage, confirmImport, pastImports, deletePastImport, editPastImport, updateConcept, updateQuestion } = useAppState();

  const [activeTab, setActiveTab] = useState<'import' | 'past'>('import');
  const [pastSearchQuery, setPastSearchQuery] = useState('');

  // Past Import Full Edit States
  const [expandedFullEditId, setExpandedFullEditId] = useState<string | null>(null);
  const [fullEditExplanation, setFullEditExplanation] = useState('');
  const [fullEditOriginal, setFullEditOriginal] = useState('');
  const [fullEditBestMethod, setFullEditBestMethod] = useState('');
  const [editingActiveQuestionId, setEditingActiveQuestionId] = useState<string | null>(null);

  // Past Import Editing States
  const [editingPastImportId, setEditingPastImportId] = useState<string | null>(null);
  const [editPastImportTopic, setEditPastImportTopic] = useState('');
  const [editPastImportSubtopic, setEditPastImportSubtopic] = useState('');
  const [editPastImportConcept, setEditPastImportConcept] = useState('');

  const [markdown, setMarkdown] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parsed metadata states
  const [parsedTopicName, setParsedTopicName] = useState('');
  const [parsedSubtopicName, setParsedSubtopicName] = useState('');
  const [parsedConceptName, setParsedConceptName] = useState('');
  const [parsedOriginalExplanation, setParsedOriginalExplanation] = useState('');
  const [parsedOriginalQuestion, setParsedOriginalQuestion] = useState('');
  const [parsedBestMethod, setParsedBestMethod] = useState('');

  // Selected Concept ID destination (for fallback / preview purposes)
  const [targetConceptId, setTargetConceptId] = useState<string>(() => {
    for (const t of topics) {
      for (const st of t.subtopics) {
        if (st.concepts.length > 0) {
          return st.concepts[0].id;
        }
      }
    }
    return '';
  });

  // Parsed questions state
  const [previewQuestions, setPreviewQuestions] = useState<Omit<Question, 'id' | 'srsState'>[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showIndividualQuestions, setShowIndividualQuestions] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Expanded cards tracker
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Form edit states for individual question editing
  const [editQText, setEditQText] = useState('');
  const [editOptA, setEditOptA] = useState('');
  const [editOptB, setEditOptB] = useState('');
  const [editOptC, setEditOptC] = useState('');
  const [editOptD, setEditOptD] = useState('');
  const [editCorrect, setEditCorrect] = useState(0);
  const [editDiff, setEditDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [editExpl, setEditExpl] = useState('');

  const handleParse = () => {
    if (!markdown.trim()) {
      setError('Please paste your markdown content first.');
      return;
    }

    setError(null);
    setIsParsing(true);

    const activeConceptId = targetConceptId || (() => {
      for (const t of topics) {
        for (const st of t.subtopics) {
          if (st.concepts.length > 0) return st.concepts[0].id;
        }
      }
      return '';
    })();

    // Perform package parsing
    const res = importMarkdownPackage(markdown, activeConceptId);
    setIsParsing(false);

    if (res.success && res.preview.length > 0) {
      setPreviewQuestions(res.preview as Omit<Question, 'id' | 'srsState'>[]);
      setShowPreview(true);
      setShowIndividualQuestions(false); // Question list is hidden first
      setExpandedCards({}); // Collapse all initially

      if (res.parsedMeta) {
        setParsedTopicName(res.parsedMeta.topic || '');
        setParsedSubtopicName(res.parsedMeta.subtopic || '');
        setParsedConceptName(res.parsedMeta.concept || '');
        setParsedOriginalExplanation(res.parsedMeta.conceptExplanation || '');
        setParsedOriginalQuestion(res.parsedMeta.originalQuestion || '');
        setParsedBestMethod(res.parsedMeta.bestMethod || '');
      } else {
        setParsedTopicName('');
        setParsedSubtopicName('');
        setParsedConceptName('');
        setParsedOriginalExplanation('');
        setParsedOriginalQuestion('');
        setParsedBestMethod('');
      }
    } else {
      setError(res.error || 'Parsing failed. Make sure your markdown matches the correct format.');
    }
  };

  const handleLoadSample = () => {
    setMarkdown(SAMPLE_MARKDOWN);
    setError(null);
  };

  const handleEditStart = (idx: number) => {
    const q = previewQuestions[idx];
    setEditingIndex(idx);
    setEditQText(q.text);
    setEditOptA(q.options[0]);
    setEditOptB(q.options[1]);
    setEditOptC(q.options[2]);
    setEditOptD(q.options[3]);
    setEditCorrect(q.correctOption);
    setEditDiff(q.difficulty);
    setEditExpl(q.explanation || '');
  };

  const handleEditSave = (idx: number) => {
    const updated = [...previewQuestions];
    updated[idx] = {
      ...updated[idx],
      text: editQText,
      options: [editOptA, editOptB, editOptC, editOptD],
      correctOption: editCorrect,
      difficulty: editDiff,
      explanation: editExpl,
    };
    setPreviewQuestions(updated);
    setEditingIndex(null);
  };

  const handleDeletePreview = (idx: number) => {
    const updated = previewQuestions.filter((_, i) => i !== idx);
    setPreviewQuestions(updated);
    if (updated.length === 0) {
      setShowPreview(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewQuestions.length === 0) return;

    if (!parsedTopicName.trim() || !parsedConceptName.trim()) {
      alert('Please enter both a Topic Name and a Concept Name before importing.');
      return;
    }

    const meta = {
      topic: parsedTopicName.trim(),
      subtopic: parsedSubtopicName.trim() || 'General',
      concept: parsedConceptName.trim(),
      conceptExplanation: parsedOriginalExplanation.trim(),
      originalQuestion: parsedOriginalQuestion.trim(),
      bestMethod: parsedBestMethod.trim()
    };

    confirmImport(previewQuestions, meta);
    alert(`Successfully imported ${previewQuestions.length} questions into "${meta.topic} → ${meta.subtopic} → ${meta.concept}"!`);
    onImportComplete();
  };

  const toggleCardExpanded = (idx: number) => {
    setExpandedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleFullEditStart = (item: typeof pastImports[0]) => {
    const targetQuestion = questions.find(q => q.id === item.questionIds[0]);
    if (!targetQuestion) return;
    
    let activeConcept: any = null;
    for (const t of topics) {
      for (const st of t.subtopics) {
        const c = st.concepts.find((c: any) => c.id === targetQuestion.conceptId);
        if (c) {
          activeConcept = c;
          break;
        }
      }
    }
    if (!activeConcept) return;

    setFullEditExplanation(activeConcept.conceptExplanation || '');
    setFullEditOriginal(activeConcept.originalQuestion || '');
    setFullEditBestMethod(activeConcept.bestMethod || '');
    setExpandedFullEditId(item.id);
    setEditingActiveQuestionId(null);
  };

  const handleFullEditSaveMetadata = (item: typeof pastImports[0]) => {
    const targetQuestion = questions.find(q => q.id === item.questionIds[0]);
    if (!targetQuestion) return;
    updateConcept(targetQuestion.conceptId, {
      conceptExplanation: fullEditExplanation,
      originalQuestion: fullEditOriginal,
      bestMethod: fullEditBestMethod
    });
    alert('Concept metadata updated!');
  };

  const handleActiveQuestionEditStart = (q: Question) => {
    setEditingActiveQuestionId(q.id);
    setEditQText(q.text);
    setEditOptA(q.options[0]);
    setEditOptB(q.options[1]);
    setEditOptC(q.options[2]);
    setEditOptD(q.options[3]);
    setEditCorrect(q.correctOption);
    setEditDiff(q.difficulty);
    setEditExpl(q.explanation || '');
  };

  const handleActiveQuestionEditSave = (qId: string) => {
    updateQuestion(qId, {
      text: editQText,
      options: [editOptA, editOptB, editOptC, editOptD],
      correctOption: editCorrect,
      difficulty: editDiff,
      explanation: editExpl,
    });
    setEditingActiveQuestionId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white text-center">
          Import Question Packages
        </h2>
        <p className="text-slate-400 text-sm text-center mt-1">
          Paste your Anki-Style Markdown formatted question packages to bulk import into your study engine.
        </p>
      </div>

      {!showPreview && (
        /* Tabs navigation */
        <div className="flex items-center justify-center gap-2 border-b border-slate-800/60 pb-1">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📥 Import New Package
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'past'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📂 Past Imports ({pastImports?.length || 0})
          </button>
        </div>
      )}

      {!showPreview ? (
        activeTab === 'import' ? (
          /* ======================== STAGE 1: INPUT WORKSPACE ======================== */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[520px] shadow-xl">
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2 shrink-0 animate-pulse">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Markdown Text Editor */}
            <div className="flex-1 flex flex-col relative mb-4">
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Paste Markdown Package code block here... (Should include Topic, Subtopic, Concept, and Easy/Medium/Hard sections with Q1., Q2., etc.)"
                className="w-full flex-1 bg-slate-950 border border-slate-850 rounded-xl p-4 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-indigo-500 leading-relaxed placeholder-slate-600"
              />
            </div>

            {/* Bottom Row containing Sample & Parse Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-850 shrink-0">
              <button
                type="button"
                onClick={handleLoadSample}
                className="w-full sm:w-auto px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium text-xs border border-white/5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <FileText size={14} />
                Load Sample Package (10 Questions)
              </button>

              <button
                type="button"
                onClick={handleParse}
                disabled={isParsing}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-500 rounded-xl font-bold text-xs text-white shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Play size={14} />
                Parse & Review Package
              </button>
            </div>
          </div>
        ) : (
          /* ======================== PAST IMPORTS HISTORY WORKSPACE ======================== */
          <div className="space-y-4 animate-fade-in">
            {/* Search filter for past imports */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={pastSearchQuery}
                onChange={(e) => setPastSearchQuery(e.target.value)}
                placeholder="Search past imports by topic, subtopic or concept name..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Past imports list */}
            {(!pastImports || pastImports.length === 0) ? (
              <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-12 text-center space-y-3">
                <div className="inline-flex p-3 bg-slate-950 rounded-full text-slate-600">
                  <History size={24} />
                </div>
                <h4 className="text-sm font-semibold text-slate-300">No Past Imports</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You haven't imported any question packages yet. Go back to the "Import New Package" tab to bulk-import your Markdown files.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Create Your First Import
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {pastImports
                  .filter(p =>
                    p.topicName.toLowerCase().includes(pastSearchQuery.toLowerCase()) ||
                    p.subtopicName.toLowerCase().includes(pastSearchQuery.toLowerCase()) ||
                    p.conceptName.toLowerCase().includes(pastSearchQuery.toLowerCase())
                  )
                  .map((item) => {
                    const activeCount = item.questionIds.filter(id => questions.some(q => q.id === id)).length;
                    const flaggedCount = item.questionIds.filter(id => questions.find(q => q.id === id)?.needsEdit).length;
                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {expandedFullEditId === item.id ? (
                          <div className="flex-1 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                  <span className="text-emerald-400 shrink-0">●</span>
                                  {item.topicName} → {item.subtopicName} → {item.conceptName}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Full Edit Mode - Changes are saved immediately</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedFullEditId(null)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg cursor-pointer"
                              >
                                Close
                              </button>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Concept Metadata</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Concept Explanation</label>
                                  <textarea
                                    value={fullEditExplanation}
                                    onChange={(e) => setFullEditExplanation(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 min-h-[60px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Original Question</label>
                                  <textarea
                                    value={fullEditOriginal}
                                    onChange={(e) => setFullEditOriginal(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 min-h-[60px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Best Method to Solve</label>
                                  <textarea
                                    value={fullEditBestMethod}
                                    onChange={(e) => setFullEditBestMethod(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 min-h-[60px]"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleFullEditSaveMetadata(item)}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                                >
                                  <Save size={13} />
                                  Save Metadata
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-800">
                              <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Generated Questions</h4>
                              <div className="space-y-3">
                                {item.questionIds.map((qId, qIndex) => {
                                  const q = questions.find(q => q.id === qId);
                                  if (!q) return null;
                                  
                                  if (editingActiveQuestionId === q.id) {
                                    return (
                                      <div key={q.id} className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-4">
                                        <div className="space-y-2">
                                          <label className="text-xs font-semibold text-slate-400">Question Text</label>
                                          <textarea
                                            value={editQText}
                                            onChange={(e) => setEditQText(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 min-h-[60px]"
                                          />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {[editOptA, editOptB, editOptC, editOptD].map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                              <input
                                                type="radio"
                                                name={`correct-opt-${q.id}`}
                                                checked={editCorrect === i}
                                                onChange={() => setEditCorrect(i)}
                                                className="mt-1"
                                              />
                                              <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  if (i === 0) setEditOptA(val);
                                                  else if (i === 1) setEditOptB(val);
                                                  else if (i === 2) setEditOptC(val);
                                                  else setEditOptD(val);
                                                }}
                                                className={`w-full bg-slate-900 border ${editCorrect === i ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-800 text-slate-300'} rounded-lg px-3 py-1.5 text-sm`}
                                                placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                        <div className="flex gap-4">
                                          <div className="flex-1 space-y-1">
                                            <label className="text-xs font-semibold text-slate-400">Difficulty</label>
                                            <select
                                              value={editDiff}
                                              onChange={(e) => setEditDiff(e.target.value as any)}
                                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200"
                                            >
                                              <option value="Easy">Easy</option>
                                              <option value="Medium">Medium</option>
                                              <option value="Hard">Hard</option>
                                            </select>
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-xs font-semibold text-slate-400">Explanation</label>
                                          <textarea
                                            value={editExpl}
                                            onChange={(e) => setEditExpl(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 min-h-[60px]"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                          <button
                                            type="button"
                                            onClick={() => handleActiveQuestionEditSave(q.id)}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                                          >
                                            Save Question
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingActiveQuestionId(null)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div key={q.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500">Q{qIndex + 1}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                              q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                              q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                              'bg-rose-500/10 text-rose-400'
                                            }`}>
                                              {q.difficulty}
                                            </span>
                                            {q.needsEdit && (
                                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                                                <Flag size={10} />
                                                Needs Edit
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-sm text-slate-200 font-medium">
                                            <MathText content={q.text} />
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                            {q.options.map((opt, i) => (
                                              <div key={i} className={`p-2 rounded-lg border text-xs ${i === q.correctOption ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                                <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][i]}.</span>
                                                <div className="flex-1">
                                                  <MathText content={opt} />
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleActiveQuestionEditStart(q)}
                                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                          >
                                            <Edit size={14} />
                                          </button>
                                          {q.needsEdit && (
                                            <button
                                              type="button"
                                              onClick={() => updateQuestion(q.id, { needsEdit: false })}
                                              className="p-2 bg-amber-500/10 hover:bg-emerald-500/10 border border-amber-500/30 hover:border-emerald-500/30 text-amber-400 hover:text-emerald-400 rounded-lg transition-all"
                                              title="Clear edit flag"
                                            >
                                              <Flag size={14} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ) : editingPastImportId === item.id ? (
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col md:flex-row gap-3">
                              <div className="flex-1 space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Topic Name</label>
                                <input
                                  type="text"
                                  value={editPastImportTopic}
                                  onChange={(e) => setEditPastImportTopic(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Subtopic Name</label>
                                <input
                                  type="text"
                                  value={editPastImportSubtopic}
                                  onChange={(e) => setEditPastImportSubtopic(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Concept Name</label>
                              <input
                                type="text"
                                value={editPastImportConcept}
                                onChange={(e) => setEditPastImportConcept(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (editPastImportTopic.trim() && editPastImportSubtopic.trim() && editPastImportConcept.trim()) {
                                    editPastImport(item.id, editPastImportTopic.trim(), editPastImportSubtopic.trim(), editPastImportConcept.trim());
                                    setEditingPastImportId(null);
                                  } else {
                                    alert('All fields must be filled out.');
                                  }
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Save size={13} />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPastImportId(null)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/10">
                                  {item.topicName}
                                </span>
                                <span className="text-slate-600 text-xs">→</span>
                                <span className="text-slate-400 text-xs truncate font-medium">
                                  {item.subtopicName}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                <span className="text-emerald-400 shrink-0">●</span>
                                <span className="truncate">{item.conceptName}</span>
                              </h3>
                              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-0.5 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />
                                  {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen size={11} />
                                  {activeCount === item.questionsCount ? (
                                    <span className="text-slate-400 font-semibold">{item.questionsCount} questions active</span>
                                  ) : (
                                    <span className="text-amber-500 font-semibold">{activeCount} / {item.questionsCount} active</span>
                                  )}
                                </span>
                                {flaggedCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleFullEditStart(item)}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-semibold hover:bg-amber-500/20 transition-all cursor-pointer"
                                    title="Click to open Full Edit and fix flagged questions"
                                  >
                                    <Flag size={10} />
                                    {flaggedCount} flagged for edit
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                              <button
                                type="button"
                                onClick={() => handleFullEditStart(item)}
                                className="p-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Fully edit metadata and imported questions"
                              >
                                <Edit size={13} />
                                <span>Full Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPastImportId(item.id);
                                  setEditPastImportTopic(item.topicName);
                                  setEditPastImportSubtopic(item.subtopicName);
                                  setEditPastImportConcept(item.conceptName);
                                }}
                                className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Edit this import's location and name"
                              >
                                <Edit size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove this import session?\n\nThis will permanently delete all remaining (${activeCount}) questions imported during this session from everywhere in your study engine.`)) {
                                    deletePastImport(item.id);
                                  }
                                }}
                                className="p-2.5 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Remove this import session and all associated questions"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                {pastImports.filter(p =>
                  p.topicName.toLowerCase().includes(pastSearchQuery.toLowerCase()) ||
                  p.subtopicName.toLowerCase().includes(pastSearchQuery.toLowerCase()) ||
                  p.conceptName.toLowerCase().includes(pastSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono">
                    No imports match your search.
                  </div>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        /* ======================== STAGE 2: PREVIEW WORKSPACE ======================== */
        <div className="space-y-6 animate-fade-in">
          {/* Target Metadata Panel (Fully editable as requested) */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                📦 Package Target Hierarchy
              </h3>
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-mono font-bold border border-indigo-500/20">
                Parsed Automatically
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              The topic, subtopic, and concept structure will be automatically resolved or created in your workspace under the names below. You can edit these fields directly prior to importing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Topic Name</label>
                <input
                  type="text"
                  value={parsedTopicName}
                  onChange={(e) => setParsedTopicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-sans font-medium transition-all"
                  placeholder="e.g. Trigonometry"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Subtopic Name</label>
                <input
                  type="text"
                  value={parsedSubtopicName}
                  onChange={(e) => setParsedSubtopicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-sans font-medium transition-all"
                  placeholder="e.g. Applications of Trigonometry"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Concept Name</label>
                <input
                  type="text"
                  value={parsedConceptName}
                  onChange={(e) => setParsedConceptName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-indigo-400 focus:outline-none focus:border-indigo-500 font-sans font-semibold transition-all"
                  placeholder="e.g. Heights and Distances"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-850/60 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">Total Parsed Questions:</span>
              <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">{previewQuestions.length} Questions</span>
            </div>
          </div>

          {/* Control Bar containing back, toggle, and confirm actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                Back to Editor
              </button>

              <button
                onClick={() => setShowIndividualQuestions(!showIndividualQuestions)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              >
                {showIndividualQuestions ? 'Hide Individual Questions' : 'Show & Review Parsed Questions'}
                <ChevronDown size={14} className={`transform transition-transform duration-200 ${showIndividualQuestions ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-950 text-xs font-semibold cursor-pointer"
              >
                Edit Markdown
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <CheckCircle size={14} />
                Confirm Import ({previewQuestions.length} Questions)
              </button>
            </div>
          </div>

          {/* Individual Questions Preview (Hidden by default, shown if showIndividualQuestions is true) */}
          {showIndividualQuestions && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-white/5 pb-2">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Parsed Questions List</h4>
              </div>

              <div className="space-y-4">
                {previewQuestions.map((q, idx) => {
                  const isExpanded = expandedCards[idx];
                  const isEditing = editingIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`border rounded-xl transition-all ${
                        isExpanded
                          ? 'bg-slate-950/40 border-indigo-500/40 shadow-lg'
                          : 'bg-slate-950/10 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      {/* Card Header Accordion Trigger */}
                      <div
                        onClick={() => toggleCardExpanded(idx)}
                        className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold text-indigo-400">Question #{idx + 1}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                              q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                              q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-rose-500/10 text-rose-400'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">Correct: Option {String.fromCharCode(65 + q.correctOption)}</span>
                          </div>
                          <div className="text-xs text-slate-300 line-clamp-1 font-sans leading-relaxed">
                            <MathText content={q.text} />
                          </div>
                        </div>
                        <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 mt-1 shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Card Content body */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-850/80 space-y-4">
                          {isEditing ? (
                            /* INLINE EDIT MODE */
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-slate-500">Question Body</label>
                                <textarea
                                  value={editQText}
                                  onChange={(e) => setEditQText(e.target.value)}
                                  rows={3}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500">Option A</label>
                                  <input
                                    type="text"
                                    value={editOptA}
                                    onChange={(e) => setEditOptA(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500">Option B</label>
                                  <input
                                    type="text"
                                    value={editOptB}
                                    onChange={(e) => setEditOptB(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500">Option C</label>
                                  <input
                                    type="text"
                                    value={editOptC}
                                    onChange={(e) => setEditOptC(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-slate-500">Option D</label>
                                  <input
                                    type="text"
                                    value={editOptD}
                                    onChange={(e) => setEditOptD(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-slate-500">Correct Answer</label>
                                  <select
                                    value={editCorrect}
                                    onChange={(e) => setEditCorrect(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
                                  >
                                    <option value={0}>Option A</option>
                                    <option value={1}>Option B</option>
                                    <option value={2}>Option C</option>
                                    <option value={3}>Option D</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono text-slate-500">Difficulty Grade</label>
                                  <select
                                    value={editDiff}
                                    onChange={(e) => setEditDiff(e.target.value as any)}
                                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
                                  >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-slate-500">Solution Proof Explanation</label>
                                <textarea
                                  value={editExpl}
                                  onChange={(e) => setEditExpl(e.target.value)}
                                  rows={3}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                                />
                              </div>

                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingIndex(null)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleEditSave(idx)}
                                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Save size={13} />
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* IMMUTABLE REVIEW MODE */
                            <div className="space-y-4">
                            <div className="text-xs text-slate-200 leading-relaxed select-text font-sans">
                              <MathText content={q.text} />
                            </div>

                            {/* Options */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt, optIdx) => {
                                  const isCorrect = optIdx === q.correctOption;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-3 rounded-xl text-xs border ${
                                        isCorrect
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium'
                                          : 'bg-slate-900/40 border-slate-850 text-slate-400'
                                      }`}
                                    >
                                      <span className="font-mono font-bold mr-2 text-indigo-400">{String.fromCharCode(65 + optIdx)}.</span>
                                      <div className="flex-1">
                                        <MathText content={opt} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation summary block */}
                              {q.explanation && (
                                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase">Solution logic:</span>
                                  <div className="text-xs text-slate-300 mt-1 leading-relaxed font-mono select-text font-sans">
                                    <MathText content={q.explanation} />
                                  </div>
                                </div>
                              )}

                              {/* Options drawer */}
                              <div className="flex gap-2 justify-end pt-2 border-t border-slate-850/40">
                                <button
                                  onClick={() => handleEditStart(idx)}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg border border-slate-800 text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit size={13} />
                                  Edit Card
                                </button>
                                <button
                                  onClick={() => handleDeletePreview(idx)}
                                  className="px-3 py-1.5 text-rose-400 hover:bg-rose-950/20 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
