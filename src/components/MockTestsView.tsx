import { useState, FormEvent, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { MockTest, WeakQuestionLog, FailureReason, ErrorBookItem } from '../types';

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  if (dateStr.includes('T')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
}

function getCorrectWrongString(mock: MockTest): string {
  let c = mock.correct;
  let w = mock.wrong;
  
  if (c === undefined || w === undefined) {
    if (mock.sections) {
      c = 0;
      w = 0;
      Object.values(mock.sections).forEach(sec => {
        if (sec) {
          c += (sec.correct ?? 0);
          w += (sec.wrong ?? 0);
        }
      });
    } else {
      c = mock.mathQuestionsCorrect ?? 0;
      w = (mock.mathQuestionsAttempted ?? 0) - c;
      if (w < 0) w = 0;
    }
  }
  return `${c} / ${w}`;
}

function getPlatformStyle(platform?: string) {
  const p = (platform || '').toLowerCase().trim();
  if (p.includes('oliveboard')) {
    return {
      cardBg: 'bg-slate-900/90 hover:bg-emerald-950/15',
      cardBorder: 'border-slate-850 hover:border-emerald-500/40',
      borderAccent: 'border-l-4 border-l-emerald-600',
      badge: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30',
      accentColor: 'text-emerald-400',
      nameColor: 'group-hover:text-emerald-400',
      glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.06)]'
    };
  }
  if (p.includes('testbook')) {
    return {
      cardBg: 'bg-slate-900/90 hover:bg-blue-950/15',
      cardBorder: 'border-slate-850 hover:border-blue-500/40',
      borderAccent: 'border-l-4 border-l-blue-600',
      badge: 'bg-blue-950/60 text-blue-400 border border-blue-500/30',
      accentColor: 'text-blue-400',
      nameColor: 'group-hover:text-blue-400',
      glow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.06)]'
    };
  }
  return {
    cardBg: 'bg-slate-900/90 hover:bg-slate-950/40',
    cardBorder: 'border-slate-850 hover:border-indigo-500/40',
    borderAccent: 'border-l-4 border-l-slate-700',
    badge: 'bg-slate-950 text-slate-400 border border-slate-800',
    accentColor: 'text-slate-400',
    nameColor: 'group-hover:text-indigo-400',
    glow: 'hover:shadow-[0_0_15px_rgba(99,102,241,0.06)]'
  };
}

import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  Award,
  ChevronDown,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Search,
  CheckCircle,
  TrendingUp,
  FileText,
  X,
  BookOpen,
  Sparkles,
  ShieldAlert,
  Compass,
  Target,
  Info,
  CheckSquare,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  User,
  PlusCircle,
  Edit3,
  LineChart as ChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function MockTestsView() {
  const { topics, mockTests, logMockTest, updateMockTest, deleteMockTest } = useAppState();

  // Selected mock for detail view overlay
  const [selectedMock, setSelectedMock] = useState<MockTest | null>(null);

  // Deletion and Editing states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingMock, setIsEditingMock] = useState(false);

  // Edit fields state
  const [editMockName, setEditMockName] = useState('');
  const [editMockPlatform, setEditMockPlatform] = useState('Testbook');
  const [editMockDate, setEditMockDate] = useState('');
  const [editMockType, setEditMockType] = useState<'sectional' | 'full' | 'pyp' | 'live'>('sectional');
  const [editMockScore, setEditMockScore] = useState<number>(0);
  const [editMockTotalScore, setEditMockTotalScore] = useState<number>(0);
  const [editMockPercentile, setEditMockPercentile] = useState<number>(0);
  const [editMockTimeTaken, setEditMockTimeTaken] = useState<number>(0);
  const [editQuantScore, setEditQuantScore] = useState<number>(0);
  const [editReasoningScore, setEditReasoningScore] = useState<number>(0);
  const [editEnglishScore, setEditEnglishScore] = useState<number>(0);
  const [editGaScore, setEditGaScore] = useState<number>(0);

  // Modal open states
  const [showLogModal, setShowLogModal] = useState(false);
  const [modalTab, setModalTab] = useState<'manual' | 'import'>('manual');

  // Filter state for history listing
  const [filterType, setFilterType] = useState<'all' | 'sectional' | 'full' | 'pyp' | 'live'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Manual Log Form State
  const [selectedMockType, setSelectedMockType] = useState<'sectional' | 'full'>('sectional');
  const [selectedFullSubtype, setSelectedFullSubtype] = useState<'full' | 'pyp' | 'live'>('full');
  
  const [mockName, setMockName] = useState('');
  const [mockPlatform, setMockPlatform] = useState('Testbook');
  const [mockDate, setMockDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mockPercentile, setMockPercentile] = useState<number>(90.0);
  const [mockTimeMinutes, setMockTimeMinutes] = useState(15);
  const [overallScore, setOverallScore] = useState<number>(42.5);
  const [overallTotalScore, setOverallTotalScore] = useState<number>(50);

  // Section Performance for manual entry
  // Quantitative Aptitude
  const [quantAttempted, setQuantAttempted] = useState<number>(22);
  const [quantCorrect, setQuantCorrect] = useState<number>(21);
  const [quantWrong, setQuantWrong] = useState<number>(1);
  const [quantScore, setQuantScore] = useState<number>(41.5);

  // General Intelligence (Reasoning)
  const [reasoningAttempted, setReasoningAttempted] = useState<number>(23);
  const [reasoningCorrect, setReasoningCorrect] = useState<number>(22);
  const [reasoningWrong, setReasoningWrong] = useState<number>(1);
  const [reasoningScore, setReasoningScore] = useState<number>(43.5);

  // English Comprehension
  const [englishAttempted, setEnglishAttempted] = useState<number>(25);
  const [englishCorrect, setEnglishCorrect] = useState<number>(23);
  const [englishWrong, setEnglishWrong] = useState<number>(2);
  const [englishScore, setEnglishScore] = useState<number>(45.0);

  // General Awareness
  const [gaAttempted, setGaAttempted] = useState<number>(15);
  const [gaCorrect, setGaCorrect] = useState<number>(10);
  const [gaWrong, setGaWrong] = useState<number>(5);
  const [gaScore, setGaScore] = useState<number>(17.5);

  // Markdown Import States
  const [importMarkdown, setImportMarkdown] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<Omit<MockTest, 'id'> | null>(null);
  const [importMockType, setImportMockType] = useState<'sectional' | 'full'>('sectional');
  const [importFullSubtype, setImportFullSubtype] = useState<'full' | 'pyp' | 'live'>('full');

  // Detail Modal - Add Error Card State
  const [showAddErrorForm, setShowAddErrorForm] = useState(false);
  const [errConceptId, setErrConceptId] = useState('');
  const [errQuestionNumber, setErrQuestionNumber] = useState('');
  const [errMarksLost, setErrMarksLost] = useState<number>(2.0);
  const [errReason, setErrReason] = useState<FailureReason>('Concept not cleared');
  const [errQuestionText, setErrQuestionText] = useState('');
  const [errCorrectAnswer, setErrCorrectAnswer] = useState('');
  const [errUserAnswer, setErrUserAnswer] = useState('');
  const [errNotes, setErrNotes] = useState('');

  // Auto-calculate scores for sectional (Math) when correct/wrong changes
  useEffect(() => {
    if (selectedMockType === 'sectional') {
      const calculatedQuantScore = (quantCorrect * 2) - (quantWrong * 0.5);
      const rounded = Math.round(calculatedQuantScore * 10) / 10;
      setQuantScore(rounded);
      setOverallScore(rounded);
      setOverallTotalScore(50);
      setMockTimeMinutes(15);
    } else {
      setOverallTotalScore(200);
      setMockTimeMinutes(60);
    }
  }, [quantCorrect, quantWrong, selectedMockType]);

  // Retrieve flat concepts list for dropdown mappings
  const allConceptsList: { id: string; name: string; path: string }[] = [];
  topics.forEach(t => {
    t.subtopics.forEach(st => {
      st.concepts.forEach(c => {
        allConceptsList.push({
          id: c.id,
          name: c.name,
          path: `${t.name} → ${st.name}`
        });
      });
    });
  });

  // Set initial concept for error form when concept list is available
  useEffect(() => {
    if (allConceptsList.length > 0 && !errConceptId) {
      setErrConceptId(allConceptsList[0].id);
    }
  }, [topics]);

  // Set default names when types change
  const handleTypeChange = (type: 'sectional' | 'full') => {
    setSelectedMockType(type);
    if (type === 'sectional') {
      setMockName(`Quant Sectional Mock #${mockTests.filter(m => m.type === 'sectional').length + 1}`);
    } else {
      setMockName(`SSC CGL Full Mock #${mockTests.filter(m => m.type === 'full' || m.type === 'pyp' || m.type === 'live').length + 1}`);
    }
  };

  const handleSubtypeChange = (subtype: 'full' | 'pyp' | 'live') => {
    setSelectedFullSubtype(subtype);
    const prefix = subtype === 'pyp' ? 'SSC CGL PYP Mock' : subtype === 'live' ? 'SSC CGL Live Mock' : 'SSC CGL Full Mock';
    setMockName(`${prefix} #${mockTests.filter(m => m.type === subtype).length + 1}`);
  };

  // Handle Manual Log Submission
  const handleSubmitMock = (e: FormEvent) => {
    e.preventDefault();
    if (!mockName.trim()) {
      alert('Please enter a mock test name.');
      return;
    }

    const typeValue = selectedMockType === 'sectional' ? 'sectional' : selectedFullSubtype;
    const finalAccuracy = selectedMockType === 'sectional'
      ? Math.round((quantCorrect / (quantAttempted || 1)) * 100)
      : Math.round(((quantCorrect + reasoningCorrect + englishCorrect + gaCorrect) / ((quantAttempted + reasoningAttempted + englishAttempted + gaAttempted) || 1)) * 100);

    const finalAttempted = selectedMockType === 'sectional'
      ? quantAttempted
      : (quantAttempted + reasoningAttempted + englishAttempted + gaAttempted);
    const finalCorrect = selectedMockType === 'sectional'
      ? quantCorrect
      : (quantCorrect + reasoningCorrect + englishCorrect + gaCorrect);
    const finalWrong = selectedMockType === 'sectional'
      ? quantWrong
      : (quantWrong + reasoningWrong + englishWrong + gaWrong);

    const mockData: Omit<MockTest, 'id'> = {
      name: mockName.trim(),
      date: mockDate,
      type: typeValue,
      platform: mockPlatform.trim() || 'Testbook',
      score: overallScore,
      totalScore: overallTotalScore,
      timeTakenMinutes: mockTimeMinutes,
      accuracy: Math.max(0, Math.min(100, finalAccuracy || 0)),
      percentile: Number(mockPercentile),
      weakQuestions: [], // errors are added afterwards as requested
      attempted: finalAttempted,
      correct: finalCorrect,
      wrong: finalWrong,
      mathQuestionsAttempted: quantAttempted,
      mathQuestionsCorrect: quantCorrect,
      mathScore: quantScore,
      mathTotalScore: 50,
      sections: selectedMockType === 'full' ? {
        quant: { attempted: quantAttempted, correct: quantCorrect, wrong: quantWrong, score: quantScore },
        reasoning: { attempted: reasoningAttempted, correct: reasoningCorrect, wrong: reasoningWrong, score: reasoningScore },
        english: { attempted: englishAttempted, correct: englishCorrect, wrong: englishWrong, score: englishScore },
        ga: { attempted: gaAttempted, correct: gaCorrect, wrong: gaWrong, score: gaScore }
      } : {
        quant: { attempted: quantAttempted, correct: quantCorrect, wrong: quantWrong, score: quantScore }
      }
    };

    logMockTest(mockData);

    // Reset Form states
    setMockName('');
    setMockPlatform('Testbook');
    setMockDate(new Date().toISOString().split('T')[0]);
    setMockPercentile(90.0);
    setQuantAttempted(22);
    setQuantCorrect(21);
    setQuantWrong(1);
    
    setShowLogModal(false);
    alert('Mock score logged successfully! You can now select it from the history list to add specific diagnostic Error Cards.');
  };

  // AI Markdown Parser
  const handleParseMockMarkdown = () => {
    setImportError(null);
    setImportPreview(null);
    if (!importMarkdown.trim()) {
      setImportError('Please paste your markdown content first.');
      return;
    }

    try {
      const lines = importMarkdown.split('\n');
      
      let name = '';
      let platformValue = '';
      let date = new Date().toISOString().split('T')[0];
      
      // Determine default type from selection or headers
      let parsedType: 'sectional' | 'full' | 'pyp' | 'live' = importMockType === 'sectional' ? 'sectional' : importFullSubtype;

      let score = 0;
      let totalScore = parsedType === 'sectional' ? 50 : 200;
      let attempted = 0;
      let correct = 0;
      let wrong = 0;
      let accuracy = 0;
      let percentile = 90;
      let timeTakenMinutes = parsedType === 'sectional' ? 15 : 60;
      let notesText = '';

      const sections: NonNullable<MockTest['sections']> = {
        quant: { attempted: 0, correct: 0, wrong: 0, score: 0 },
        reasoning: { attempted: 0, correct: 0, wrong: 0, score: 0 },
        english: { attempted: 0, correct: 0, wrong: 0, score: 0 },
        ga: { attempted: 0, correct: 0, wrong: 0, score: 0 }
      };

      let currentSection: 'overall' | 'quant' | 'reasoning' | 'english' | 'ga' | 'notes' | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check for headers
        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '').toLowerCase();
          
          if (headerText.includes('overall')) {
            currentSection = 'overall';
          } else if (headerText.includes('quant') || headerText.includes('math')) {
            currentSection = 'quant';
          } else if (headerText.includes('reasoning') || headerText.includes('intelligence') || headerText.includes('general intelligence')) {
            currentSection = 'reasoning';
          } else if (headerText.includes('english') || headerText.includes('comprehension')) {
            currentSection = 'english';
          } else if (headerText.includes('awareness') || headerText.includes('ga') || headerText.includes('general awareness')) {
            currentSection = 'ga';
          } else if (headerText.includes('sectional score breakdown') || headerText.includes('section-wise') || headerText.includes('section performance')) {
            currentSection = null; // resets and waits for specific section headers
          } else if (headerText.includes('notes') || headerText.includes('comment') || headerText.includes('remark') || headerText.includes('analysis')) {
            currentSection = 'notes';
          } else if (headerText.includes('sectional') && headerText.includes('math')) {
            parsedType = 'sectional';
          } else if (headerText.includes('full') && headerText.includes('mock')) {
            parsedType = 'full';
          }
          continue;
        }

        // If currently in notes section, append raw text
        if (currentSection === 'notes') {
          notesText += (notesText ? '\n' : '') + trimmed;
          continue;
        }

        // Parse key-value formats
        // Strip bullet markers from start: '-', '*', '+', and whitespace
        const cleanLine = trimmed.replace(/^[\*\-_+#\s]+/, '').trim();
        const colonIndex = cleanLine.indexOf(':');
        
        if (colonIndex !== -1) {
          const key = cleanLine.substring(0, colonIndex).trim().replace(/^[\*\-_+#\s]+|[\*\-_+#\s]+$/g, '').toLowerCase();
          const val = cleanLine.substring(colonIndex + 1).replace(/<!--.*-->/, '').trim();

          // Global/General Keys
          if (key === 'mock name' || key === 'name' || key === 'mock test name') {
            name = val;
          } else if (key === 'platform' || key === 'source' || key === 'mock source' || key === 'mock platform') {
            platformValue = val;
          } else if (key === 'date') {
            // Attempt to parse various date formats
            const dMatch = val.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
            if (dMatch) {
              // Convert DD-MM-YYYY to YYYY-MM-DD
              date = `${dMatch[3]}-${dMatch[2]}-${dMatch[1]}`;
            } else {
              const dMatch2 = val.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
              if (dMatch2) {
                date = val;
              } else {
                // Try standard JS Date parsing fallback
                try {
                  const d = new Date(val);
                  if (!isNaN(d.getTime())) {
                    date = d.toISOString().split('T')[0];
                  }
                } catch(e) {}
              }
            }
          } else if (key === 'type') {
            const lowVal = val.toLowerCase();
            if (lowVal.includes('sectional') || lowVal.includes('math')) {
              parsedType = 'sectional';
            } else if (lowVal.includes('pyp') || lowVal.includes('previous year')) {
              parsedType = 'pyp';
            } else if (lowVal.includes('live')) {
              parsedType = 'live';
            } else if (lowVal.includes('full')) {
              parsedType = 'full';
            }
          } else if (key === 'subtype') {
            const lowVal = val.toLowerCase();
            if (lowVal.includes('pyp')) {
              parsedType = 'pyp';
            } else if (lowVal.includes('live')) {
              parsedType = 'live';
            } else if (lowVal.includes('standard') || lowVal.includes('full')) {
              parsedType = 'full';
            }
          } else if (key === 'notes' || key === 'comment' || key === 'remarks' || key === 'analysis') {
            notesText += (notesText ? '\n' : '') + val;
          }

          // Contextual keys
          else if (currentSection === 'overall' || currentSection === null) {
            // Check overall scoring attributes
            if (key === 'total score' || key === 'overall score' || key === 'score' || key === 'marks') {
              const scoreSlashMatch = val.match(/([\d.]+)\s*\/\s*([\d.]+)/);
              if (scoreSlashMatch) {
                score = parseFloat(scoreSlashMatch[1]);
                totalScore = parseFloat(scoreSlashMatch[2]);
              } else {
                score = parseFloat(val) || 0;
              }
            } else if (key === 'attempted') {
              const slashMatch = val.match(/(\d+)\s*\/\s*(\d+)/);
              attempted = slashMatch ? parseInt(slashMatch[1], 10) : (parseInt(val, 10) || 0);
            } else if (key === 'correct/wrong' || key === 'correct / wrong') {
              const cwMatch = val.match(/(\d+)\s*[-/]\s*(\d+)/);
              if (cwMatch) {
                correct = parseInt(cwMatch[1], 10);
                wrong = parseInt(cwMatch[2], 10);
              }
            } else if (key === 'correct') {
              correct = parseInt(val, 10) || 0;
            } else if (key === 'wrong') {
              wrong = parseInt(val, 10) || 0;
            } else if (key === 'accuracy') {
              accuracy = parseFloat(val.replace('%', '')) || 0;
            } else if (key === 'percentile') {
              percentile = parseFloat(val.replace('%', '')) || 90;
            }
          }

          if (currentSection === 'quant' || currentSection === 'reasoning' || currentSection === 'english' || currentSection === 'ga') {
            const sec = sections[currentSection];
            if (key === 'score' || key === 'marks') {
              const secScoreMatch = val.match(/([\d.-]+)\s*\/\s*([\d.]+)/);
              if (secScoreMatch) {
                sec.score = parseFloat(secScoreMatch[1]);
              } else {
                sec.score = parseFloat(val) || 0;
              }
            } else if (key === 'attempted') {
              const slashMatch = val.match(/(\d+)\s*\/\s*(\d+)/);
              sec.attempted = slashMatch ? parseInt(slashMatch[1], 10) : (parseInt(val, 10) || 0);
            } else if (key === 'correct/wrong' || key === 'correct / wrong') {
              const cwMatch = val.match(/(\d+)\s*[-/]\s*(\d+)/);
              if (cwMatch) {
                sec.correct = parseInt(cwMatch[1], 10);
                sec.wrong = parseInt(cwMatch[2], 10);
              }
            } else if (key === 'correct') {
              sec.correct = parseInt(val, 10) || 0;
            } else if (key === 'wrong') {
              sec.wrong = parseInt(val, 10) || 0;
            }
          }
        }
      }

      // Sync overall correct/wrong if they are zero but we have section breakdowns
      if (parsedType !== 'sectional' && correct === 0 && wrong === 0) {
        correct = sections.quant.correct + sections.reasoning.correct + sections.english.correct + sections.ga.correct;
        wrong = sections.quant.wrong + sections.reasoning.wrong + sections.english.wrong + sections.ga.wrong;
      }
      if (parsedType !== 'sectional' && attempted === 0) {
        attempted = sections.quant.attempted + sections.reasoning.attempted + sections.english.attempted + sections.ga.attempted;
      }

      // Provide decent placeholder names if empty
      if (!name) {
        const num = mockTests.filter(m => m.type === parsedType).length + 1;
        name = parsedType === 'sectional' ? `Quant Sectional Mock #${num}` :
               parsedType === 'pyp' ? `SSC CGL PYP Mock #${num}` :
               parsedType === 'live' ? `SSC CGL Live Mock #${num}` : `SSC CGL Full Mock #${num}`;
      }

      // Sync math portion values for high fidelity tracking
      let mathPortionAttempted = 25;
      let mathPortionCorrect = 25;
      let mathPortionScore = 50;

      if (parsedType === 'sectional') {
        mathPortionAttempted = attempted || 25;
        mathPortionCorrect = correct || Math.max(0, mathPortionAttempted - wrong);
        mathPortionScore = score || 50;
        
        // Populate quant section as well for consistency
        sections.quant = {
          attempted: mathPortionAttempted,
          correct: mathPortionCorrect,
          wrong: wrong || Math.max(0, mathPortionAttempted - mathPortionCorrect),
          score: mathPortionScore
        };
      } else {
        if (sections.quant && sections.quant.attempted > 0) {
          mathPortionAttempted = sections.quant.attempted;
          mathPortionCorrect = sections.quant.correct;
          mathPortionScore = sections.quant.score;
        } else {
          mathPortionAttempted = 0;
          mathPortionCorrect = 0;
          mathPortionScore = 0;
        }
      }

      // Calculate accuracy if not parsed
      if (accuracy === 0) {
        const totalAnswers = correct + wrong;
        accuracy = totalAnswers > 0 ? Math.round((correct / totalAnswers) * 100) : 0;
      }

      // Infer platform from name if empty
      let finalPlatform = platformValue.trim();
      if (!finalPlatform) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('testbook')) {
          finalPlatform = 'Testbook';
        } else if (lowerName.includes('oliveboard')) {
          finalPlatform = 'Oliveboard';
        } else if (lowerName.includes('rbe')) {
          finalPlatform = 'RBE';
        } else if (lowerName.includes('supermock')) {
          finalPlatform = 'Supermock';
        } else if (lowerName.includes('career power')) {
          finalPlatform = 'Career Power';
        } else {
          finalPlatform = 'General';
        }
      }

      setImportPreview({
        name,
        date,
        type: parsedType,
        platform: finalPlatform,
        score,
        totalScore,
        timeTakenMinutes,
        accuracy: Math.max(0, Math.min(100, accuracy)),
        percentile,
        weakQuestions: [],
        rawMarkdown: importMarkdown, // Save the raw Markdown along with parsed data
        notes: notesText.trim(),
        attempted,
        correct,
        wrong,
        mathQuestionsAttempted: mathPortionAttempted,
        mathQuestionsCorrect: mathPortionCorrect,
        mathScore: mathPortionScore,
        mathTotalScore: 50,
        sections
      });
    } catch (e: any) {
      setImportError(`Failed to parse: ${e.message || 'Please verify format.'}`);
    }
  };

  const handleSaveImportedMock = () => {
    if (!importPreview) return;

    // Final calculations and updates before saving to state
    const finalMock = { ...importPreview };
    if (finalMock.type === 'sectional') {
      finalMock.mathQuestionsAttempted = finalMock.attempted || 25;
      finalMock.mathQuestionsCorrect = finalMock.correct || 25;
      finalMock.mathScore = finalMock.score;
      finalMock.mathTotalScore = finalMock.totalScore || 50;
    } else if (finalMock.sections?.quant) {
      finalMock.mathQuestionsAttempted = finalMock.sections.quant.attempted;
      finalMock.mathQuestionsCorrect = finalMock.sections.quant.correct;
      finalMock.mathScore = finalMock.sections.quant.score;
      finalMock.mathTotalScore = 50;
    }

    logMockTest(finalMock);
    setImportMarkdown('');
    setImportPreview(null);
    setShowLogModal(false);
    alert('Imported mock test logged successfully! Select it in mock history to add error cards.');
  };

  const updateSectionField = (secKey: 'quant' | 'reasoning' | 'english' | 'ga', field: 'attempted' | 'correct' | 'wrong' | 'score', value: number) => {
    setImportPreview(prev => {
      if (!prev) return null;
      const currentSections = prev.sections || {};
      const sectionData = currentSections[secKey] || { attempted: 0, correct: 0, wrong: 0, score: 0 };
      return {
        ...prev,
        sections: {
          ...currentSections,
          [secKey]: {
            ...sectionData,
            [field]: value
          }
        }
      };
    });
  };

  const handleLoadSampleMarkdown = (type: 'sectional' | 'full') => {
    if (type === 'sectional') {
      setImportMarkdown(`# Sectional Math Mock

**Mock Name:** Quant Sectional Mock #12
**Date:** 08-07-2026
**Type:** Sectional Math

## Overall
- Total Score: 42.5 / 50
- Attempted: 22 / 25
- Correct: 21
- Wrong: 1
- Accuracy: 96%

## Section Performance
### Quantitative Aptitude
- Attempted: 22/25
- Correct/Wrong: 21/1
- Score: 41.5`);
    } else {
      setImportMarkdown(`# Full Mock Result

**Mock Name:** SSC CGL Tier-1 Full Mock #45
**Date:** 08-07-2026
**Type:** Full Mock

## Overall
- Total Score: 90.50 / 200
- Attempted: 79 / 100
- Correct: 52
- Wrong: 27
- Accuracy: 65.82%
- Percentile: 88.50

## Section-wise Performance

### General Intelligence
- Attempted: 20/25
- Correct/Wrong: 17/3
- Score: 32.50

### General Awareness
- Attempted: 24/25
- Correct/Wrong: 7/17
- Score: 5.50

### Quantitative Aptitude
- Attempted: 10/25
- Correct/Wrong: 7/3
- Score: 12.50

### English Comprehension
- Attempted: 25/25
- Correct/Wrong: 21/4
- Score: 40.00`);
    }
  };

  // Add diagnostic error card to existing mock
  const handleAddDiagnosticError = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMock) return;
    if (!errConceptId) {
      alert('Please select a syllabus concept first.');
      return;
    }

    const newWq: WeakQuestionLog = {
      id: `wq_${Date.now()}`,
      conceptId: errConceptId,
      questionNumber: errQuestionNumber.trim() || `Error #${selectedMock.weakQuestions.length + 1}`,
      marksLost: Number(errMarksLost),
      reason: errReason,
      notes: errNotes.trim(),
      questionText: errQuestionText.trim(),
      correctAnswer: errCorrectAnswer.trim(),
      userAnswer: errUserAnswer.trim()
    };

    const updatedWqs = [...selectedMock.weakQuestions, newWq];
    
    // Update the mock test in global state
    updateMockTest(selectedMock.id, { weakQuestions: updatedWqs });

    // Update locally selected overlay view
    setSelectedMock({
      ...selectedMock,
      weakQuestions: updatedWqs
    });

    // Reset error form fields
    setErrQuestionNumber('');
    setErrNotes('');
    setErrQuestionText('');
    setErrCorrectAnswer('');
    setErrUserAnswer('');
    setShowAddErrorForm(false);
  };

  // Remove diagnostic error card from mock
  const handleRemoveDiagnosticError = (wqId: string) => {
    if (!selectedMock) return;
    if (!confirm('Are you sure you want to remove this error card?')) return;

    const updatedWqs = selectedMock.weakQuestions.filter(q => q.id !== wqId);
    
    updateMockTest(selectedMock.id, { weakQuestions: updatedWqs });
    setSelectedMock({
      ...selectedMock,
      weakQuestions: updatedWqs
    });
  };

  const handleSelectMock = (mock: MockTest | null) => {
    setSelectedMock(mock);
    setIsEditingMock(false);
    setShowDeleteConfirm(false);
    setShowAddErrorForm(false);
    
    if (mock) {
      setEditMockName(mock.name);
      setEditMockPlatform(mock.platform ?? 'Testbook');
      setEditMockDate(mock.date);
      setEditMockType(mock.type);
      setEditMockScore(mock.score);
      setEditMockTotalScore(mock.totalScore);
      setEditMockPercentile(mock.percentile ?? 90.0);
      setEditMockTimeTaken(mock.timeTakenMinutes ?? 15);
      
      if (mock.sections) {
        setEditQuantScore(mock.sections.quant?.score ?? 0);
        setEditReasoningScore(mock.sections.reasoning?.score ?? 0);
        setEditEnglishScore(mock.sections.english?.score ?? 0);
        setEditGaScore(mock.sections.ga?.score ?? 0);
      } else {
        setEditQuantScore(mock.mathScore ?? mock.score ?? 0);
        setEditReasoningScore(0);
        setEditEnglishScore(0);
        setEditGaScore(0);
      }
    }
  };

  const handleSaveMockEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMock) return;
    
    const accuracyVal = Math.round((editMockScore / editMockTotalScore) * 100) || 0;
    
    const updatedSections = editMockType !== 'sectional' ? {
      quant: { attempted: 25, correct: 20, wrong: 5, score: editQuantScore },
      reasoning: { attempted: 25, correct: 20, wrong: 5, score: editReasoningScore },
      english: { attempted: 25, correct: 20, wrong: 5, score: editEnglishScore },
      ga: { attempted: 25, correct: 20, wrong: 5, score: editGaScore }
    } : undefined;

    const updates: Partial<MockTest> = {
      name: editMockName.trim(),
      platform: editMockPlatform.trim(),
      date: editMockDate,
      type: editMockType,
      score: editMockScore,
      totalScore: editMockTotalScore,
      percentile: editMockPercentile,
      timeTakenMinutes: editMockTimeTaken,
      accuracy: accuracyVal,
      sections: updatedSections,
      mathScore: editMockType === 'sectional' ? editQuantScore : undefined,
    };

    updateMockTest(selectedMock.id, updates);
    
    // Update locally selected mock details display
    setSelectedMock(prev => prev ? { ...prev, ...updates } : null);
    setIsEditingMock(false);
  };

  // Sort all mocks chronologically to easily find the "previous" mock for any mock test
  const chronologicalMocks = [...mockTests].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  const getPercentileTrend = (mock: MockTest) => {
    // Find the index of this mock in the chronological list of the same type
    const sameTypeMocks = chronologicalMocks.filter(m => m.type === mock.type);
    const index = sameTypeMocks.findIndex(m => m.id === mock.id);
    if (index <= 0) return null; // No previous mock of the same type

    const prevMock = sameTypeMocks[index - 1];
    const currentPercentile = mock.percentile ?? mock.accuracy;
    const prevPercentile = prevMock.percentile ?? prevMock.accuracy;

    if (currentPercentile > prevPercentile) return 'up';
    if (currentPercentile < prevPercentile) return 'down';
    return 'flat';
  };

  const renderTrendIcon = (mock: MockTest) => {
    const trend = getPercentileTrend(mock);
    if (trend === 'up') {
      return (
        <span className="inline-flex items-center text-emerald-500 shrink-0" title="Improved from previous mock">
          <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7M12 3v18" />
          </svg>
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className="inline-flex items-center text-rose-500 shrink-0" title="Scored lower than previous mock">
          <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7M12 21V3" />
          </svg>
        </span>
      );
    }
    return null;
  };

  // Categorize mock results
  const sectionalMocks = mockTests.filter(m => m.type === 'sectional');
  const fullMocks = mockTests.filter(m => m.type === 'full');
  const pypMocks = mockTests.filter(m => m.type === 'pyp');
  const liveMocks = mockTests.filter(m => m.type === 'live');

  // Filter listings and sort latest first
  const filteredMocks = mockTests
    .filter(m => {
      if (filterType === 'all') return true;
      return m.type === filterType;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  // Calculate Averages
  const avgSectionalScore = sectionalMocks.length > 0
    ? Math.round((sectionalMocks.reduce((sum, m) => sum + m.score, 0) / sectionalMocks.length) * 10) / 10
    : 0;

  const avgFullScore = fullMocks.length > 0
    ? Math.round((fullMocks.reduce((sum, m) => sum + m.score, 0) / fullMocks.length) * 10) / 10
    : 0;

  const avgLiveScore = liveMocks.length > 0
    ? Math.round((liveMocks.reduce((sum, m) => sum + m.score, 0) / liveMocks.length) * 10) / 10
    : 0;

  // Recharts Chronological Data
  const sortedMocks = [...mockTests].sort((a, b) => a.date.localeCompare(b.date));
  
  const sectionalChartData = sortedMocks
    .filter(m => m.type === 'sectional')
    .map(m => ({
      date: m.date.substring(5), // MM-DD
      score: m.score,
      percentile: m.percentile,
      name: m.name
    }));

  const fullChartData = sortedMocks
    .filter(m => m.type === 'full' || m.type === 'pyp')
    .map(m => ({
      date: m.date.substring(5),
      overallScore: m.score,
      mathScore: m.mathScore ?? (m.sections?.quant?.score ?? 0),
      percentile: m.percentile,
      name: m.name
    }));

  const liveChartData = sortedMocks
    .filter(m => m.type === 'live')
    .map(m => ({
      date: m.date.substring(5),
      score: m.score,
      percentile: m.percentile,
      name: m.name
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title Banner */}
      <div>
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
          Mock Test Tracker
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Perform mistake diagnostics, analyze Quant portion improvements, and manage error cards securely.
        </p>
      </div>

      {/* Launcher Area - SEPARATE DESIGNS AND BUTTONS FOR LOGGING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Manual Log Launcher */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md transition-all group">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                <PlusCircle size={18} />
              </div>
              <h3 className="font-display font-bold text-sm text-slate-100">Manually Log Scores</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Key in mock parameters directly including test title, date, percentile, and four-subject section-wise marks breakdown.
            </p>
          </div>
          <button
            onClick={() => {
              if (allConceptsList.length === 0) {
                alert('Please configure at least one Topic & Concept in the Syllabus screen first!');
                return;
              }
              setModalTab('manual');
              handleTypeChange('sectional');
              setShowLogModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer self-start"
          >
            <Plus size={13} />
            Log Score Manually
          </button>
        </div>

        {/* Card 2: AI Markdown Import Launcher */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md transition-all group">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <Sparkles size={18} />
              </div>
              <h3 className="font-display font-bold text-sm text-slate-100">AI Markdown Import</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Paste dashboard screenshot text formatted in markdown. Our parser will automatically ingest sections and overall percentiles.
            </p>
          </div>
          <button
            onClick={() => {
              if (allConceptsList.length === 0) {
                alert('Please configure at least one Topic & Concept in the Syllabus screen first!');
                return;
              }
              setModalTab('import');
              setImportError(null);
              setImportPreview(null);
              setImportMarkdown('');
              setShowLogModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer self-start"
          >
            <Sparkles size={13} className="text-emerald-400 animate-pulse" />
            AI Markdown Import
          </button>
        </div>
      </div>

      {/* Analytics Bento Grid (Charts and trends) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Bento 1: Sectional Math Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Target size={13} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Sectional Math Trend</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400">{avgSectionalScore} / 50 avg</span>
            </div>
            
            {sectionalChartData.length > 1 ? (
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sectionalChartData}>
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-24 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-2 text-[10px] text-slate-500 font-mono">
                <span>Requires at least 2 logs to render performance trend chart</span>
              </div>
            )}
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Performance history ({sectionalMocks.length} logged)</span>
        </div>

        {/* Bento 2: Full Mocks (Math Section Focus) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Award size={13} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Full Mock (Maths Portions)</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">{avgFullScore} / 200 avg</span>
            </div>

            {fullChartData.length > 1 ? (
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fullChartData}>
                    <Line type="monotone" dataKey="mathScore" stroke="#fbbf24" strokeWidth={2.5} name="Math Portion Score" dot={{ r: 3 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-24 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-2 text-[10px] text-slate-500 font-mono">
                <span>Requires at least 2 logs to track math portion trend</span>
              </div>
            )}
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Full / PYP Mocks logged: {fullMocks.length + pypMocks.length}</span>
        </div>

        {/* Bento 3: Live Mock Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Sparkles size={13} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Live Mock Results</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">{avgLiveScore} / 200 avg</span>
            </div>

            {liveChartData.length > 1 ? (
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={liveChartData}>
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-24 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-2 text-[10px] text-slate-500 font-mono">
                <span>No live mocks logged yet to visualize trend</span>
              </div>
            )}
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Live Mock scores & percentiles logged: {liveMocks.length}</span>
        </div>
      </div>

      {/* History Checklist and filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <h3 className="font-display font-semibold text-white text-base tracking-tight flex items-center gap-2">
            <FileText size={18} className="text-indigo-400" />
            Logged Mock History
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-semibold transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({mockTests.length})
              </button>
              <button
                onClick={() => setFilterType('sectional')}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'sectional' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Target size={11} />
                Sectional Math ({sectionalMocks.length})
              </button>
              <button
                onClick={() => setFilterType('full')}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'full' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award size={11} />
                Full ({fullMocks.length})
              </button>
              <button
                onClick={() => setFilterType('pyp')}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'pyp' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen size={11} />
                PYP ({pypMocks.length})
              </button>
              <button
                onClick={() => setFilterType('live')}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'live' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles size={11} />
                Live ({liveMocks.length})
              </button>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Mock List */}
        {filteredMocks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
            <GraduationCap size={40} className="text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-mono">No matching mock logs found in this category.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMocks.map((mock) => {
              const percentileVal = mock.percentile ?? mock.accuracy;
              const pStyle = getPlatformStyle(mock.platform);
              return (
                <div
                  key={mock.id}
                  onClick={() => handleSelectMock(mock)}
                  className={`${pStyle.cardBg} border ${pStyle.cardBorder} border-l-4 ${pStyle.borderAccent} rounded-2xl p-5 flex flex-col justify-between cursor-pointer group transition-all shadow-sm ${pStyle.glow}`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <Calendar size={11} />
                            {formatDateForDisplay(mock.date)}
                          </span>
                          <span className="text-slate-700 font-mono text-[9px]">•</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${pStyle.badge}`}>
                            {mock.platform || 'Testbook'}
                          </span>
                        </div>
                        <h4 className={`font-display font-bold text-sm text-slate-100 mt-1.5 transition-colors ${pStyle.nameColor}`}>
                          {mock.name}
                        </h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${
                          mock.type === 'sectional' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          mock.type === 'pyp' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          mock.type === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {mock.type === 'sectional' ? '🎯 Sectional Math' :
                           mock.type === 'pyp' ? '📚 PYP Mock' :
                           mock.type === 'live' ? '⚡ Live Mock' : '📝 Full Mock'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono font-bold border border-slate-800 flex items-center gap-1">
                          <span>{percentileVal}%ile</span>
                          {renderTrendIcon(mock)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 text-center text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider">Score</span>
                        <div className="font-bold text-indigo-400 mt-0.5">{mock.score}/{mock.totalScore}</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider">Accuracy</span>
                        <div className="font-bold text-slate-300 mt-0.5">{mock.accuracy}%</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider">Mistakes</span>
                        <div className="font-bold text-rose-400 mt-0.5">{mock.weakQuestions.length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 font-semibold pt-4 group-hover:underline">
                    <span>Manage Error Cards</span>
                    <ChevronRight size={12} className="text-indigo-400" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/40 shadow-lg">
            {/* Desktop Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-slate-950/50 text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              <div className="col-span-2 flex items-center gap-1"><Calendar size={11} /> Date</div>
              <div className="col-span-1 flex items-center gap-1"><Award size={11} /> Platform</div>
              <div className="col-span-3 flex items-center gap-1"><FileText size={11} /> Mock Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1 text-center">Score</div>
              <div className="col-span-1 text-center">C / W</div>
              <div className="col-span-1 text-center">Percentile</div>
              <div className="col-span-1 text-right font-semibold">Action</div>
            </div>

            {filteredMocks.map((mock) => {
              const percentileVal = mock.percentile ?? mock.accuracy;
              const platformVal = mock.platform ?? 'Testbook';
              const correctWrongStr = getCorrectWrongString(mock);
              const pStyle = getPlatformStyle(platformVal);
              
              return (
                <div
                  key={mock.id}
                  onClick={() => handleSelectMock(mock)}
                  className={`hover:bg-slate-950/40 border-l-4 ${pStyle.borderAccent} transition-all cursor-pointer text-xs group p-4`}
                >
                  {/* Desktop Row */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-2 text-slate-400 font-mono">{formatDateForDisplay(mock.date)}</div>
                    <div className="col-span-1 truncate">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${pStyle.badge}`}>
                        {platformVal}
                      </span>
                    </div>
                    <div className={`col-span-3 font-semibold text-slate-200 truncate ${pStyle.nameColor} transition-colors`}>
                      {mock.name}
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${
                        mock.type === 'sectional' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        mock.type === 'pyp' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        mock.type === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {mock.type === 'sectional' ? 'Sectional Math' :
                         mock.type === 'pyp' ? 'PYP Mock' :
                         mock.type === 'live' ? 'Live Mock' : 'Full Mock'}
                      </span>
                    </div>
                    <div className="col-span-1 text-center font-mono font-bold text-indigo-400">
                      {mock.score}/{mock.totalScore}
                    </div>
                    <div className="col-span-1 text-center font-mono text-slate-300">
                      {correctWrongStr}
                    </div>
                    <div className="col-span-1 text-center font-mono font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <span>{percentileVal}%ile</span>
                      {renderTrendIcon(mock)}
                    </div>
                    <div className="col-span-1 text-right text-indigo-400 font-mono font-semibold">
                      Manage →
                    </div>
                  </div>

                  {/* Mobile Row */}
                  <div className="md:hidden flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-mono">{formatDateForDisplay(mock.date)}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${pStyle.badge}`}>
                        {platformVal}
                      </span>
                    </div>
                    
                    <div className={`font-bold text-slate-100 ${pStyle.nameColor} transition-colors`}>
                      {mock.name}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono mt-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        mock.type === 'sectional' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        mock.type === 'pyp' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        mock.type === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {mock.type === 'sectional' ? 'Sectional Math' :
                         mock.type === 'pyp' ? 'PYP Mock' :
                         mock.type === 'live' ? 'Live Mock' : 'Full Mock'}
                      </span>
                      <span className="text-indigo-400">Score: {mock.score}/{mock.totalScore}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">C/W: {correctWrongStr}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span>{percentileVal}%ile</span>
                        {renderTrendIcon(mock)}
                      </span>
                    </div>
                    
                    <div className="text-right text-indigo-400 font-mono font-semibold text-[10px] mt-1">
                      Manage →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================== MODAL: DEDICATED LOG WIZARD ==================================== */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                {modalTab === 'manual' ? (
                  <>
                    <PlusCircle className="text-indigo-400" size={20} />
                    Manually Log Mock Score
                  </>
                ) : (
                  <>
                    <Sparkles className="text-emerald-400" size={20} />
                    AI Markdown Mock Import
                  </>
                )}
              </h3>
              <button onClick={() => setShowLogModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* DEDICATED WIZARD VIEWS */}
            {modalTab === 'manual' ? (
              <form onSubmit={handleSubmitMock} className="space-y-4">
                
                {/* Mock Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">Select Mock Exam Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('sectional')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        selectedMockType === 'sectional'
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-xs font-display flex items-center gap-1">
                        <Target size={13} />
                        Sectional Math
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight">25 Questions, 50 Marks</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('full')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        selectedMockType === 'full'
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <span className="font-bold text-xs font-display flex items-center gap-1">
                        <Award size={13} />
                        Full Multi-Subject Mock
                      </span>
                      <span className="text-[10px] text-slate-500 leading-tight">200 Marks Composite</span>
                    </button>
                  </div>
                </div>

                {/* Sub-type selection if Full Mock */}
                {selectedMockType === 'full' && (
                  <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <label className="text-[10px] font-mono text-slate-450 block uppercase tracking-wider">Select Full Mock Subtype</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {(['full', 'pyp', 'live'] as const).map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleSubtypeChange(sub)}
                          className={`py-2 px-1.5 rounded-lg border text-center font-mono text-[10px] uppercase font-bold transition-all cursor-pointer ${
                            selectedFullSubtype === sub
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                              : 'bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {sub === 'pyp' ? 'PYP Mock' : sub === 'live' ? 'Live Mock' : 'Standard Full'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Mock Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Quant Sectional #12"
                      value={mockName}
                      onChange={(e) => setMockName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Platform</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Testbook, Oliveboard"
                      value={mockPlatform}
                      onChange={(e) => setMockPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Test Date</label>
                    <input
                      type="date"
                      required
                      value={mockDate}
                      onChange={(e) => setMockDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Percentile (%)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      max="100"
                      value={mockPercentile}
                      onChange={(e) => setMockPercentile(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Score Controls */}
                {selectedMockType === 'sectional' ? (
                  <div className="p-4 bg-indigo-950/10 border border-indigo-900/30 rounded-2xl space-y-3">
                    <div className="text-xs font-bold text-indigo-400 font-display">Math Section Specific Performance</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500">Attempted (0-25)</span>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={quantAttempted}
                          onChange={(e) => setQuantAttempted(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500">Correct</span>
                        <input
                          type="number"
                          min="0"
                          max={quantAttempted}
                          value={quantCorrect}
                          onChange={(e) => setQuantCorrect(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500">Wrong</span>
                        <input
                          type="number"
                          min="0"
                          max={quantAttempted - quantCorrect}
                          value={quantWrong}
                          onChange={(e) => setQuantWrong(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-400">Score</span>
                        <div className="w-full bg-slate-950 border border-emerald-500/20 p-1.5 rounded-lg text-center font-bold text-emerald-400">
                          {quantScore}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Full Mock Four Section score entry */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase">Composite Total Obtained Score</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={overallScore}
                          onChange={(e) => setOverallScore(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs font-mono text-indigo-400 font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 uppercase">Time Duration (Minutes)</label>
                        <div className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs font-mono text-slate-400">
                          60 minutes (Standard tier-1)
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-amber-400 font-display">Sectional Breakdowns (25 questions / 50 marks each)</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        
                        {/* Quant Section in Full */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-slate-300">Quantitative Aptitude</span>
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            <div>
                              <span>Attempted</span>
                              <input type="number" min="0" max="25" value={quantAttempted} onChange={(e) => setQuantAttempted(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center" />
                            </div>
                            <div>
                              <span>Correct</span>
                              <input type="number" min="0" max="25" value={quantCorrect} onChange={(e) => setQuantCorrect(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center" />
                            </div>
                            <div>
                              <span>Score</span>
                              <input type="number" step="0.5" value={quantScore} onChange={(e) => setQuantScore(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center text-emerald-400 font-bold" />
                            </div>
                          </div>
                        </div>

                        {/* Reasoning Section in Full */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-slate-300">General Intelligence (Reasoning)</span>
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            <div>
                              <span>Attempted</span>
                              <input type="number" min="0" max="25" value={reasoningAttempted} onChange={(e) => setReasoningAttempted(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center" />
                            </div>
                            <div>
                              <span>Correct</span>
                              <input type="number" min="0" max="25" value={reasoningCorrect} onChange={(e) => setReasoningCorrect(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center" />
                            </div>
                            <div>
                              <span>Score</span>
                              <input type="number" step="0.5" value={reasoningScore} onChange={(e) => setReasoningScore(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center text-emerald-400 font-bold" />
                            </div>
                          </div>
                        </div>

                        {/* English Section in Full */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-slate-300">English Comprehension</span>
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            <div>
                              <span>Attempted</span>
                              <input type="number" min="0" max="25" value={englishAttempted} onChange={(e) => setEnglishAttempted(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center" />
                            </div>
                            <div>
                              <span>Correct</span>
                              <input type="number" min="0" max="25" value={englishCorrect} onChange={(e) => setEnglishCorrect(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center" />
                            </div>
                            <div>
                              <span>Score</span>
                              <input type="number" step="0.5" value={englishScore} onChange={(e) => setEnglishScore(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center text-emerald-400 font-bold" />
                            </div>
                          </div>
                        </div>

                        {/* GA Section in Full */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <span className="font-bold text-slate-300">General Awareness</span>
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            <div>
                              <span>Attempted</span>
                              <input type="number" min="0" max="25" value={gaAttempted} onChange={(e) => setGaAttempted(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center" />
                            </div>
                            <div>
                              <span>Correct</span>
                              <input type="number" min="0" max="25" value={gaCorrect} onChange={(e) => setGaCorrect(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center" />
                            </div>
                            <div>
                              <span>Score</span>
                              <input type="number" step="0.5" value={gaScore} onChange={(e) => setGaScore(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center text-emerald-400 font-bold" />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/15 cursor-pointer font-display"
                  >
                    Confirm & Save Scores
                  </button>
                </div>
              </form>
            ) : (
              /* DEDICATED IMPORT VIEW */
              <div className="space-y-4">
                
                {/* Mock Category & Subtype Selector inside import wizard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-850 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Mock Exam Category</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setImportMockType('sectional')}
                        className={`flex-1 py-1.5 rounded font-bold font-mono uppercase text-[10px] ${
                          importMockType === 'sectional' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-900 border border-slate-850 text-slate-500'
                        }`}
                      >
                        Sectional Math
                      </button>
                      <button
                        onClick={() => setImportMockType('full')}
                        className={`flex-1 py-1.5 rounded font-bold font-mono uppercase text-[10px] ${
                          importMockType === 'full' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-900 border border-slate-850 text-slate-500'
                        }`}
                      >
                        Full Mock
                      </button>
                    </div>
                  </div>

                  {importMockType === 'full' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">Subtype</label>
                      <div className="flex gap-1.5">
                        {(['full', 'pyp', 'live'] as const).map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setImportFullSubtype(sub)}
                            className={`flex-1 py-1.5 rounded font-bold font-mono uppercase text-[9px] ${
                              importFullSubtype === sub ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-slate-900 border border-slate-850 text-slate-500'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 text-xs space-y-2 text-slate-300">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-400 font-display">
                    <Sparkles size={14} />
                    How to import using AI
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                    <li>Take a screenshot of your dashboard score.</li>
                    <li>Ask any AI (like Gemini) to: <span className="text-slate-300 italic">"Convert this score into the Markdown format"</span>.</li>
                    <li>Paste the generated markdown below and click <span className="text-slate-300 font-semibold">Preview & Verify</span>.</li>
                  </ol>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleLoadSampleMarkdown('sectional')}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Load Sample Sectional Math Mock
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleMarkdown('full')}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Load Sample Full Mock
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">Paste Markdown Here</label>
                  <textarea
                    rows={8}
                    value={importMarkdown}
                    onChange={(e) => {
                      setImportMarkdown(e.target.value);
                      setImportError(null);
                    }}
                    placeholder="# Mock Test Result..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {importError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleParseMockMarkdown}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-850 text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer font-display"
                  >
                    Preview & Verify Results
                  </button>
                </div>

                {importPreview && (
                  <div className="border border-emerald-500/30 rounded-2xl p-5 bg-slate-950/50 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                        <CheckCircle size={16} className="text-emerald-400" />
                        Extracted Mock Preview & Editor
                      </h4>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold font-mono border border-emerald-500/20">
                        Interactive Preview
                      </span>
                    </div>

                    {/* Section 1: Basic Information */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                        1. Basic Details
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Mock Name</label>
                          <input
                            type="text"
                            value={importPreview.name}
                            onChange={(e) => setImportPreview({ ...importPreview, name: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Date</label>
                          <input
                            type="date"
                            value={importPreview.date}
                            onChange={(e) => setImportPreview({ ...importPreview, date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Category Type</label>
                          <select
                            value={importPreview.type}
                            onChange={(e) => {
                              const newType = e.target.value as 'sectional' | 'full' | 'pyp' | 'live';
                              const newTotalScore = newType === 'sectional' ? 50 : 200;
                              setImportPreview({
                                ...importPreview,
                                type: newType,
                                totalScore: newTotalScore,
                                timeTakenMinutes: newType === 'sectional' ? 15 : 60
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="sectional">Sectional Math</option>
                            <option value="full">Standard Full Mock</option>
                            <option value="pyp">PYP (Previous Year Paper)</option>
                            <option value="live">Live Mock</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Overall Score Metrics */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                        2. Overall Scoring & Metrics
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase font-bold">Score</label>
                          <input
                            type="number"
                            step="0.01"
                            value={importPreview.score}
                            onChange={(e) => setImportPreview({ ...importPreview, score: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase font-bold">Total Score</label>
                          <input
                            type="number"
                            value={importPreview.totalScore}
                            onChange={(e) => setImportPreview({ ...importPreview, totalScore: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase font-bold">Attempted</label>
                          <input
                            type="number"
                            value={importPreview.attempted ?? 0}
                            onChange={(e) => setImportPreview({ ...importPreview, attempted: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase font-bold">Correct</label>
                          <input
                            type="number"
                            value={importPreview.correct ?? 0}
                            onChange={(e) => {
                              const corVal = parseInt(e.target.value, 10) || 0;
                              const attVal = importPreview.attempted ?? 0;
                              const autoAccuracy = attVal > 0 ? Math.round((corVal / attVal) * 100) : importPreview.accuracy;
                              setImportPreview({
                                ...importPreview,
                                correct: corVal,
                                accuracy: autoAccuracy
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase font-bold">Wrong</label>
                          <input
                            type="number"
                            value={importPreview.wrong ?? 0}
                            onChange={(e) => setImportPreview({ ...importPreview, wrong: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase font-bold">Accuracy %</label>
                          <input
                            type="number"
                            value={importPreview.accuracy}
                            onChange={(e) => setImportPreview({ ...importPreview, accuracy: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase font-bold">Percentile Obtained (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={importPreview.percentile}
                            onChange={(e) => setImportPreview({ ...importPreview, percentile: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 block uppercase font-bold">Time Taken (Minutes)</label>
                          <input
                            type="number"
                            value={importPreview.timeTakenMinutes}
                            onChange={(e) => setImportPreview({ ...importPreview, timeTakenMinutes: parseInt(e.target.value, 10) || 0 })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Sectional Breakdown (Only shown for non-sectional types) */}
                    {importPreview.type !== 'sectional' && importPreview.sections && (
                      <div className="space-y-3">
                        <div className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                          3. Section Breakdown Performance
                        </div>
                        <div className="space-y-2">
                          {([
                            { key: 'quant', label: 'Quantitative Aptitude (Math)' },
                            { key: 'reasoning', label: 'General Intelligence (Reasoning)' },
                            { key: 'english', label: 'English Comprehension' },
                            { key: 'ga', label: 'General Awareness' }
                          ] as const).map((sec) => {
                            const secData = importPreview.sections?.[sec.key] || { attempted: 0, correct: 0, wrong: 0, score: 0 };
                            return (
                              <div key={sec.key} className="bg-slate-900/40 border border-slate-850 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs font-mono">
                                <div className="md:col-span-4 font-semibold text-slate-300">
                                  {sec.label}
                                </div>
                                <div className="md:col-span-8 grid grid-cols-4 gap-2">
                                  <div className="space-y-0.5">
                                    <span className="text-[8px] text-slate-500 block uppercase text-center">Attempted</span>
                                    <input
                                      type="number"
                                      value={secData.attempted}
                                      onChange={(e) => updateSectionField(sec.key, 'attempted', parseInt(e.target.value, 10) || 0)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[8px] text-slate-500 block uppercase text-center">Correct</span>
                                    <input
                                      type="number"
                                      value={secData.correct}
                                      onChange={(e) => updateSectionField(sec.key, 'correct', parseInt(e.target.value, 10) || 0)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[8px] text-slate-500 block uppercase text-center">Wrong</span>
                                    <input
                                      type="number"
                                      value={secData.wrong}
                                      onChange={(e) => updateSectionField(sec.key, 'wrong', parseInt(e.target.value, 10) || 0)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[8px] text-slate-500 block uppercase text-center">Score</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={secData.score}
                                      onChange={(e) => updateSectionField(sec.key, 'score', parseFloat(e.target.value) || 0)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section 4: Notes Extracted */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                        4. Parsed Mock Notes
                      </div>
                      <textarea
                        rows={3}
                        value={importPreview.notes ?? ''}
                        onChange={(e) => setImportPreview({ ...importPreview, notes: e.target.value })}
                        placeholder="Add any extra notes, observations, or general weak areas discovered here..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {/* Section 5: Original pasted Raw Markdown info badge */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Info size={13} className="text-indigo-400 shrink-0" />
                        Raw markdown is attached and will be saved along with parsed data.
                      </span>
                      <span className="text-slate-500 text-[10px] shrink-0 font-bold">
                        {importPreview.rawMarkdown ? `${importPreview.rawMarkdown.length} characters` : '0 characters'}
                      </span>
                    </div>

                    {/* Form Controls */}
                    <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={() => setImportPreview(null)}
                        className="px-3.5 py-2 text-xs text-slate-400 hover:text-white cursor-pointer font-semibold font-mono"
                      >
                        Clear Preview
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveImportedMock}
                        className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/15 cursor-pointer font-display"
                      >
                        <CheckSquare size={14} />
                        Log Parsed Mock Test
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setImportMarkdown('');
                      setImportPreview(null);
                      setImportError(null);
                      setShowLogModal(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================== MODAL: MOCK DETAIL OVERLAY & ERROR CARDS MANAGER ==================================== */}
      {selectedMock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDateForDisplay(selectedMock.date)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono font-bold uppercase">
                    {selectedMock.platform ?? 'Testbook'}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-white mt-1">{selectedMock.name}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedMock(null);
                  setShowAddErrorForm(false);
                }}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {isEditingMock ? (
              <form onSubmit={handleSaveMockEdit} className="space-y-4 text-xs animate-fade-in">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center gap-1.5">
                  <Edit3 size={13} />
                  Edit Performance Log Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Mock Name</label>
                    <input
                      type="text"
                      required
                      value={editMockName}
                      onChange={(e) => setEditMockName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Platform</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Testbook, Oliveboard"
                      value={editMockPlatform}
                      onChange={(e) => setEditMockPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <div className="flex gap-1.5 mt-1">
                      {['Testbook', 'Oliveboard', 'RBE', 'Supermock'].map(p => {
                        const isSel = editMockPlatform.toLowerCase().trim() === p.toLowerCase();
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setEditMockPlatform(p)}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${
                              isSel
                                ? p === 'Oliveboard'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold'
                                : 'bg-slate-950/40 text-slate-500 border border-slate-900 hover:text-slate-300'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Test Date</label>
                    <input
                      type="date"
                      required
                      value={editMockDate}
                      onChange={(e) => setEditMockDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Type</label>
                    <select
                      value={editMockType}
                      onChange={(e) => setEditMockType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="sectional">Sectional Math</option>
                      <option value="full">Full Mock</option>
                      <option value="pyp">PYP Mock</option>
                      <option value="live">Live Mock</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Score</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editMockScore}
                      onChange={(e) => setEditMockScore(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Total Score</label>
                    <input
                      type="number"
                      required
                      value={editMockTotalScore}
                      onChange={(e) => setEditMockTotalScore(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Percentile (%ile)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editMockPercentile}
                      onChange={(e) => setEditMockPercentile(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Time Taken (Mins)</label>
                    <input
                      type="number"
                      required
                      value={editMockTimeTaken}
                      onChange={(e) => setEditMockTimeTaken(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Sectional performance block */}
                {editMockType !== 'sectional' ? (
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Sectional scores (out of 50 each)</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono">Quantitative Aptitude</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editQuantScore}
                          onChange={(e) => setEditQuantScore(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono">General Intelligence (Reasoning)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editReasoningScore}
                          onChange={(e) => setEditReasoningScore(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono">English Comprehension</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editEnglishScore}
                          onChange={(e) => setEditEnglishScore(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono">General Awareness</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editGaScore}
                          onChange={(e) => setEditGaScore(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Quantitative Aptitude Score</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editQuantScore}
                        onChange={(e) => {
                          setEditQuantScore(Number(e.target.value));
                          setEditMockScore(Number(e.target.value));
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsEditingMock(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold font-display transition-colors cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold font-display shadow-lg shadow-indigo-600/15 transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Core Statistics Card */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/60">
                <span className="text-[9px] text-slate-500 block uppercase">Score</span>
                <span className="font-bold text-indigo-400 mt-1 block">{selectedMock.score}/{selectedMock.totalScore}</span>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/60">
                <span className="text-[9px] text-slate-500 block uppercase">Accuracy</span>
                <span className="font-bold text-slate-300 mt-1 block">{selectedMock.accuracy}%</span>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/60">
                <span className="text-[9px] text-slate-500 block uppercase">Percentile</span>
                <span className="font-bold text-emerald-400 mt-1 block">{selectedMock.percentile}%ile</span>
              </div>
              <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/60">
                <span className="text-[9px] text-slate-500 block uppercase">Mistakes</span>
                <span className="font-bold text-rose-400 mt-1 block">{selectedMock.weakQuestions.length} cards</span>
              </div>
            </div>

            {/* If Full Mock, show subject portions breakdown */}
            {selectedMock.type !== 'sectional' && selectedMock.sections && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-[11px] font-mono space-y-2">
                <div className="font-bold text-slate-400">Sectional Score Breakdown:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Quantitative Aptitude:</span>
                    <span className="font-bold text-indigo-400">{selectedMock.sections.quant?.score ?? 'N/A'}/50</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">General Intelligence:</span>
                    <span className="font-bold text-indigo-400">{selectedMock.sections.reasoning?.score ?? 'N/A'}/50</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">English Comprehension:</span>
                    <span className="font-bold text-indigo-400">{selectedMock.sections.english?.score ?? 'N/A'}/50</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">General Awareness:</span>
                    <span className="font-bold text-indigo-400">{selectedMock.sections.ga?.score ?? 'N/A'}/50</span>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostics error card segment */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={13} className="text-rose-400" />
                  Mistakes Diagnostic Cards ({selectedMock.weakQuestions.length})
                </h4>
                <button
                  onClick={() => setShowAddErrorForm(!showAddErrorForm)}
                  className="px-2.5 py-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-md border border-indigo-500/20 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={11} />
                  Add Error Card
                </button>
              </div>

              {/* Add Error Card subform */}
              {showAddErrorForm && (
                <form onSubmit={handleAddDiagnosticError} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3 text-xs animate-fade-in">
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                    <PlusCircle size={13} />
                    New Paper Diagnostic Mistake
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono">Question Number (e.g. Q14)</span>
                      <input
                        type="text"
                        required
                        placeholder="Q14"
                        value={errQuestionNumber}
                        onChange={(e) => setErrQuestionNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono">Marks Lost (e.g. 2.0 or 0.66)</span>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={errMarksLost}
                        onChange={(e) => setErrMarksLost(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">Map to Syllabus Concept</span>
                    <select
                      required
                      value={errConceptId}
                      onChange={(e) => setErrConceptId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-[11px]"
                    >
                      {allConceptsList.map(c => (
                        <option key={c.id} value={c.id}>{c.path} : {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500">Correct Answer</span>
                      <input type="text" placeholder="e.g. Option B (45)" value={errCorrectAnswer} onChange={(e) => setErrCorrectAnswer(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500">Your Marked Answer</span>
                      <input type="text" placeholder="e.g. Option C (54)" value={errUserAnswer} onChange={(e) => setErrUserAnswer(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">Failure Diagnosis Reason</span>
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
                          onClick={() => setErrReason(r)}
                          className={`p-1.5 rounded text-[9px] font-bold text-center border transition-all cursor-pointer ${
                            errReason === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">Question text/statement (optional)</span>
                    <textarea
                      rows={2}
                      placeholder="e.g. In a class of 60, ratio of boys and girls..."
                      value={errQuestionText}
                      onChange={(e) => setErrQuestionText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">Personal Analysis Diagnosis Notes</span>
                    <textarea
                      rows={2}
                      placeholder="e.g. Multiplied incorrect numbers in stress. Need to cross-check arithmetic values."
                      value={errNotes}
                      onChange={(e) => setErrNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddErrorForm(false)}
                      className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-white rounded font-semibold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs shadow-md shadow-emerald-600/10"
                    >
                      Save Error Card
                    </button>
                  </div>
                </form>
              )}

              {/* Error cards list */}
              <div className="max-h-[280px] overflow-y-auto space-y-3 pr-1">
                {selectedMock.weakQuestions.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono border border-dashed border-slate-850 rounded-xl">
                    No diagnostic error cards logged yet for this mock test.
                  </div>
                ) : (
                  selectedMock.weakQuestions.map((wq, index) => {
                    const conceptObj = topics.flatMap(t => t.subtopics.flatMap(st => st.concepts)).find(c => c.id === wq.conceptId);
                    return (
                      <div key={wq.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 space-y-2 text-xs relative group">
                        
                        <button
                          onClick={() => handleRemoveDiagnosticError(wq.id)}
                          className="absolute right-3 top-3 p-1 text-slate-500 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Delete Diagnostic Error"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-indigo-400">{wq.questionNumber}</span>
                            {wq.marksLost > 0 && <span className="text-rose-400">(-{wq.marksLost} marks)</span>}
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-mono font-bold uppercase">
                            {wq.reason}
                          </span>
                        </div>

                        {wq.questionText && (
                          <p className="text-slate-300 leading-normal font-sans italic">
                            "{wq.questionText}"
                          </p>
                        )}

                        <div className="text-[10px] text-slate-500 font-mono flex flex-wrap gap-2 justify-between">
                          <span>Syllabus Target: <span className="text-slate-300 font-semibold">{conceptObj ? conceptObj.name : 'Concept'}</span></span>
                          {(wq.correctAnswer || wq.userAnswer) && (
                            <span className="text-slate-400 font-mono text-[9px]">
                              Ans: <span className="text-emerald-400 font-bold">{wq.correctAnswer || 'N/A'}</span> / Yours: <span className="text-rose-400 font-bold">{wq.userAnswer || 'N/A'}</span>
                            </span>
                          )}
                        </div>

                        {wq.notes && (
                          <div className="p-2 bg-slate-900 border border-slate-850 rounded-lg text-slate-400 text-[11px] leading-relaxed font-mono select-text">
                            <span className="font-bold text-slate-300">Analysis:</span> {wq.notes}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-rose-950/20 px-2.5 py-1.5 rounded-xl border border-rose-500/30 animate-pulse">
              <span className="text-[10px] text-rose-400 font-bold font-mono">Confirm Delete?</span>
              <button
                type="button"
                onClick={() => {
                  deleteMockTest(selectedMock.id);
                  handleSelectMock(null);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 text-rose-400 hover:bg-rose-950/20 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Trash2 size={13} />
              Delete Log
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingMock(true)}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-indigo-400 hover:text-indigo-300 rounded-xl font-semibold text-xs border border-slate-850 cursor-pointer flex items-center gap-1 transition-all"
            >
              <Edit3 size={12} />
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => handleSelectMock(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold text-xs border border-slate-700 cursor-pointer font-display transition-all"
            >
              Close Details
            </button>
          </div>
        </div>
          </div>
        </div>
      )}

    </div>
  );
}
