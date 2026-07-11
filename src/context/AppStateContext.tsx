import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Topic, Subtopic, Concept, Question, MockTest, PracticeSession, ErrorBookItem, FailureReason, AppState, PastImport } from '../types';
import { saveFullState, loadFullState, deleteAllUserData } from '../lib/supabaseDb';

interface AppContextType {
  topics: Topic[];
  questions: Question[];
  practiceSessions: PracticeSession[];
  mockTests: MockTest[];
  errorBook: ErrorBookItem[];
  pastImports: PastImport[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  addTopic: (name: string) => Topic;
  deleteTopic: (id: string) => void;
  addSubtopic: (topicId: string, name: string) => void;
  addConcept: (subtopicId: string, name: string, description?: string) => void;
  updateConcept: (id: string, updates: Partial<Concept>) => void;
  addQuestion: (question: Omit<Question, 'id' | 'srsState'>) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  importMarkdownPackage: (markdown: string, conceptId: string) => { success: boolean; count: number; error?: string; preview: Partial<Question>[]; parsedMeta?: { topic: string; subtopic: string; concept: string; conceptExplanation?: string; originalQuestion?: string; bestMethod?: string; } };
  confirmImport: (questions: Omit<Question, 'id' | 'srsState'>[], meta?: { topic: string; subtopic: string; concept: string; conceptExplanation?: string; originalQuestion?: string; bestMethod?: string; }) => void;
  trackConceptPerformance: (conceptId: string, isCorrect: boolean) => void;
  deletePastImport: (id: string) => void;
  editPastImport: (id: string, newTopicName: string, newSubtopicName: string, newConceptName: string) => void;
  logMockTest: (mock: Omit<MockTest, 'id'>) => void;
  updateMockTest: (id: string, updates: Partial<MockTest>) => void;
  deleteMockTest: (id: string) => void;
  addErrorBookItem: (item: Omit<ErrorBookItem, 'id' | 'dateAdded' | 'archived'>) => void;
  updateErrorBookItem: (id: string, updates: Partial<ErrorBookItem>) => void;
  completePracticeSession: (
    conceptIds: string[],
    isSrs: boolean,
    durationSeconds: number,
    results: {
      questionId: string;
      userAnswer: number | null;
      isCorrect: boolean;
      timeSpentSeconds: number;
      failureReason?: FailureReason;
      notes?: string;
    }[]
  ) => PracticeSession;
  reorderTopics: (topicId: string, direction: 'up' | 'down') => void;
  reorderSubtopics: (topicId: string, subtopicId: string, direction: 'up' | 'down') => void;
  reorderConcepts: (subtopicId: string, conceptId: string, direction: 'up' | 'down') => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppStateProvider({ children, userId }: { children: ReactNode; userId: string }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [errorBook, setErrorBook] = useState<ErrorBookItem[]>([]);
  const [pastImports, setPastImports] = useState<PastImport[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from Firestore (with localStorage migration on first login)
  useEffect(() => {
    const loadData = async () => {
      try {
        if (userId === 'guest') {
          // Guest Mode - load exclusively from localStorage
          const saved = localStorage.getItem('anki_ssc_maths_state_v5_clean');
          if (saved) {
            try {
              const parsed = JSON.parse(saved) as AppState;
              setTopics(parsed.topics || []);
              setQuestions(parsed.questions || []);
              setPracticeSessions(parsed.practiceSessions || []);
              setMockTests(parsed.mockTests || []);
              setErrorBook(parsed.errorBook || []);
              setPastImports(parsed.pastImports || []);
              setTheme(parsed.theme || 'dark');
            } catch (e) {
              console.error('Failed to parse saved state', e);
              initializeDefaultState();
            }
          } else {
            initializeDefaultState();
          }
          setIsInitialized(true);
          return;
        }

        // Try loading from Firestore first
        const cloudState = await loadFullState(userId);

        if (cloudState) {
          // Cloud data exists — use it
          setTopics(cloudState.topics || []);
          setQuestions(cloudState.questions || []);
          setPracticeSessions(cloudState.practiceSessions || []);
          setMockTests(cloudState.mockTests || []);
          setErrorBook(cloudState.errorBook || []);
          setPastImports(cloudState.pastImports || []);
          setTheme(cloudState.theme || 'dark');
        } else {
          // No cloud data — check for localStorage migration
          const saved = localStorage.getItem('anki_ssc_maths_state_v5_clean');
          if (saved) {
            try {
              const parsed = JSON.parse(saved) as AppState;
              setTopics(parsed.topics || []);
              setQuestions(parsed.questions || []);
              setPracticeSessions(parsed.practiceSessions || []);
              setMockTests(parsed.mockTests || []);
              setErrorBook(parsed.errorBook || []);
              setPastImports(parsed.pastImports || []);
              setTheme(parsed.theme || 'dark');
              // Migrate to cloud
              await saveFullState(userId, parsed);
              console.log('✅ Migrated localStorage data to Firestore');
            } catch (e) {
              console.error('Failed to parse saved state', e);
              initializeDefaultState();
            }
          } else {
            initializeDefaultState();
          }
        }
      } catch (error) {
        console.error('Failed to load from Firestore, falling back to localStorage', error);
        // Fallback to localStorage if Firestore fails
        const saved = localStorage.getItem('anki_ssc_maths_state_v5_clean');
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as AppState;
            setTopics(parsed.topics || []);
            setQuestions(parsed.questions || []);
            setPracticeSessions(parsed.practiceSessions || []);
            setMockTests(parsed.mockTests || []);
            setErrorBook(parsed.errorBook || []);
            setPastImports(parsed.pastImports || []);
            setTheme(parsed.theme || 'dark');
          } catch (e) {
            initializeDefaultState();
          }
        } else {
          initializeDefaultState();
        }
      }
      setIsInitialized(true);
    };
    loadData();
  }, [userId]);

  const initializeDefaultState = () => {
    setTopics([]);
    setQuestions([]);
    setPastImports([]);
    setTheme('dark');
    setMockTests([]);
    setPracticeSessions([]);
    setErrorBook([]);
  };

  // Debounced save to Firestore whenever state changes
  useEffect(() => {
    if (isInitialized) {
      const state: AppState = {
        topics,
        questions,
        practiceSessions,
        mockTests,
        errorBook,
        theme,
        pastImports
      };
      // Also keep localStorage as a fast local cache
      localStorage.setItem('anki_ssc_maths_state_v5_clean', JSON.stringify(state));

      if (userId === 'guest') {
        return; // Skip cloud sync in guest mode
      }

      // Debounce Firestore writes to avoid excessive writes
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveFullState(userId, state).catch(err =>
          console.error('Failed to save to Firestore:', err)
        );
      }, 1500);
    }
  }, [topics, questions, practiceSessions, mockTests, errorBook, theme, pastImports, isInitialized, userId]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const addTopic = (name: string) => {
    const newTopic: Topic = {
      id: `topic_${Date.now()}`,
      name,
      subtopics: []
    };
    setTopics(prev => [...prev, newTopic]);
    return newTopic;
  };

  const deleteTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    const conceptIds = topic.subtopics.flatMap(st => st.concepts.map(c => c.id));

    // Remove topic
    setTopics(prev => prev.filter(t => t.id !== topicId));

    // Remove questions associated with these concepts
    setQuestions(prev => prev.filter(q => !conceptIds.includes(q.conceptId)));

    // Remove errorBook items associated with these concepts
    setErrorBook(prev => prev.filter(eb => !conceptIds.includes(eb.conceptId)));
  };

  const addSubtopic = (topicId: string, name: string) => {
    setTopics(prev =>
      prev.map(t => {
        if (t.id === topicId) {
          return {
            ...t,
            subtopics: [
              ...t.subtopics,
              {
                id: `subtopic_${Date.now()}`,
                topicId,
                name,
                concepts: []
              }
            ]
          };
        }
        return t;
      })
    );
  };

  const addConcept = (subtopicId: string, name: string, description?: string) => {
    setTopics(prev =>
      prev.map(t => {
        return {
          ...t,
          subtopics: t.subtopics.map(st => {
            if (st.id === subtopicId) {
              return {
                ...st,
                concepts: [
                  ...st.concepts,
                  {
                    id: `concept_${Date.now()}`,
                    subtopicId,
                    name,
                    description: description || '',
                    mastery: 0,
                    questionsCount: 0
                  }
                ]
              };
            }
            return st;
          })
        };
      })
    );
  };

  const updateConcept = (conceptId: string, updates: Partial<Concept>) => {
    setTopics(prev =>
      prev.map(t => ({
        ...t,
        subtopics: t.subtopics.map(st => ({
          ...st,
          concepts: st.concepts.map(c => {
            if (c.id === conceptId) {
              return { ...c, ...updates };
            }
            return c;
          })
        }))
      }))
    );
  };

  const trackConceptPerformance = (conceptId: string, isCorrect: boolean) => {
    setTopics(prev =>
      prev.map(t => ({
        ...t,
        subtopics: t.subtopics.map(st => ({
          ...st,
          concepts: st.concepts.map(c => {
            if (c.id === conceptId) {
              const currentPerf = c.recentPerformance || [];
              const newPerf = [isCorrect, ...currentPerf].slice(0, 5); // Keep last 5 attempts
              return { ...c, recentPerformance: newPerf };
            }
            return c;
          })
        }))
      }))
    );
  };

  const addQuestion = (qData: Omit<Question, 'id' | 'srsState'>) => {
    const newQ: Question = {
      ...qData,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      srsState: {
        interval: 1,
        ease: 2.5,
        repetitions: 0,
        dueDate: new Date().toISOString(),
        lastReviewed: null
      }
    };

    setQuestions(prev => [...prev, newQ]);

    // Update questionsCount in concept
    setTopics(prev =>
      prev.map(t => ({
        ...t,
        subtopics: t.subtopics.map(st => ({
          ...st,
          concepts: st.concepts.map(c => {
            if (c.id === qData.conceptId) {
              return { ...c, questionsCount: c.questionsCount + 1 };
            }
            return c;
          })
        }))
      }))
    );
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === id) {
          return { ...q, ...updates };
        }
        return q;
      })
    );
  };

  const deleteQuestion = (id: string) => {
    const targetQ = questions.find(q => q.id === id);
    if (!targetQ) return;

    setQuestions(prev => prev.filter(q => q.id !== id));

    // Update questionsCount in concept
    setTopics(prev =>
      prev.map(t => ({
        ...t,
        subtopics: t.subtopics.map(st => ({
          ...st,
          concepts: st.concepts.map(c => {
            if (c.id === targetQ.conceptId) {
              return { ...c, questionsCount: Math.max(0, c.questionsCount - 1) };
            }
            return c;
          })
        }))
      }))
    );
  };

  const confirmImport = (
    importedQs: Omit<Question, 'id' | 'srsState'>[],
    meta?: { topic: string; subtopic: string; concept: string; conceptExplanation?: string; originalQuestion?: string; bestMethod?: string; }
  ) => {
    let finalConceptId = '';

    if (meta && meta.topic && meta.concept) {
      let existingTopic = topics.find(t => t.name.toLowerCase() === meta.topic.toLowerCase());
      let topicId = existingTopic ? existingTopic.id : `topic_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      let subtopicId = '';
      if (existingTopic) {
        const subtopicName = meta.subtopic || 'General';
        let existingSub = existingTopic.subtopics.find(st => st.name.toLowerCase() === subtopicName.toLowerCase());
        subtopicId = existingSub ? existingSub.id : `subtopic_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      } else {
        subtopicId = `subtopic_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      }

      if (existingTopic) {
        const subtopicName = meta.subtopic || 'General';
        let existingSub = existingTopic.subtopics.find(st => st.name.toLowerCase() === subtopicName.toLowerCase());
        if (existingSub) {
          let existingConcept = existingSub.concepts.find(c => c.name.toLowerCase() === meta.concept.toLowerCase());
          finalConceptId = existingConcept ? existingConcept.id : `concept_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        } else {
          finalConceptId = `concept_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }
      } else {
        finalConceptId = `concept_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      }

      setTopics(prev => {
        const updated = [...prev];
        let tIndex = updated.findIndex(t => t.name.toLowerCase() === meta.topic.toLowerCase());
        if (tIndex === -1) {
          const newT: Topic = {
            id: topicId,
            name: meta.topic,
            subtopics: [{
              id: subtopicId,
              topicId: topicId,
              name: meta.subtopic || 'General',
              concepts: [{
                id: finalConceptId,
                subtopicId: subtopicId,
                name: meta.concept,
                description: meta.conceptExplanation || `Imported questions for ${meta.concept}`,
                conceptExplanation: meta.conceptExplanation,
                originalQuestion: meta.originalQuestion,
                bestMethod: meta.bestMethod,
                recentPerformance: [],
                mastery: 0,
                questionsCount: importedQs.length
              }]
            }]
          };
          updated.push(newT);
        } else {
          const t = updated[tIndex];
          const subtopicName = meta.subtopic || 'General';
          let stIndex = t.subtopics.findIndex(st => st.name.toLowerCase() === subtopicName.toLowerCase());
          if (stIndex === -1) {
            const newSt = {
              id: subtopicId,
              topicId: t.id,
              name: subtopicName,
              concepts: [{
                id: finalConceptId,
                subtopicId: subtopicId,
                name: meta.concept,
                description: meta.conceptExplanation || `Imported questions for ${meta.concept}`,
                conceptExplanation: meta.conceptExplanation,
                originalQuestion: meta.originalQuestion,
                bestMethod: meta.bestMethod,
                recentPerformance: [],
                mastery: 0,
                questionsCount: importedQs.length
              }]
            };
            updated[tIndex] = {
              ...t,
              subtopics: [...t.subtopics, newSt]
            };
          } else {
            const st = t.subtopics[stIndex];
            let cIndex = st.concepts.findIndex(c => c.name.toLowerCase() === meta.concept.toLowerCase());
            if (cIndex === -1) {
              const newC = {
                id: finalConceptId,
                subtopicId: st.id,
                name: meta.concept,
                description: meta.conceptExplanation || `Imported questions for ${meta.concept}`,
                conceptExplanation: meta.conceptExplanation,
                originalQuestion: meta.originalQuestion,
                bestMethod: meta.bestMethod,
                recentPerformance: [],
                mastery: 0,
                questionsCount: importedQs.length
              };
              const updatedSt = {
                ...st,
                concepts: [...st.concepts, newC]
              };
              const updatedSub = [...t.subtopics];
              updatedSub[stIndex] = updatedSt;
              updated[tIndex] = {
                ...t,
                subtopics: updatedSub
              };
            } else {
              const c = st.concepts[cIndex];
              const updatedC = {
                ...c,
                conceptExplanation: meta.conceptExplanation || c.conceptExplanation,
                originalQuestion: meta.originalQuestion || c.originalQuestion,
                bestMethod: meta.bestMethod || c.bestMethod,
                questionsCount: c.questionsCount + importedQs.length
              };
              const updatedSt = {
                ...st,
                concepts: st.concepts.map(item => item.id === c.id ? updatedC : item)
              };
              const updatedSub = [...t.subtopics];
              updatedSub[stIndex] = updatedSt;
              updated[tIndex] = {
                ...t,
                subtopics: updatedSub
              };
            }
          }
        }
        return updated;
      });
    }

    const toAdd = importedQs.map(q => ({
      ...q,
      conceptId: finalConceptId || q.conceptId,
      id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      srsState: {
        interval: 1,
        ease: 2.5,
        repetitions: 0,
        dueDate: new Date().toISOString(),
        lastReviewed: null
      }
    }));

    setQuestions(prev => [...prev, ...toAdd]);

    // Record the past import
    let topicName = meta?.topic || 'General';
    let subtopicName = meta?.subtopic || 'General';
    let conceptName = meta?.concept || 'General';

    if (!meta && toAdd.length > 0) {
      const firstQConceptId = toAdd[0].conceptId;
      let found = false;
      for (const t of topics) {
        for (const st of t.subtopics) {
          const match = st.concepts.find(c => c.id === firstQConceptId);
          if (match) {
            topicName = t.name;
            subtopicName = st.name;
            conceptName = match.name;
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }

    const newImport: PastImport = {
      id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      topicName,
      subtopicName,
      conceptName,
      questionsCount: toAdd.length,
      questionIds: toAdd.map(q => q.id)
    };

    setPastImports(prev => [newImport, ...prev]);

    if (!meta) {
      const countByConcept: Record<string, number> = {};
      toAdd.forEach(q => {
        countByConcept[q.conceptId] = (countByConcept[q.conceptId] || 0) + 1;
      });

      setTopics(prev =>
        prev.map(t => ({
          ...t,
          subtopics: t.subtopics.map(st => ({
            ...st,
            concepts: st.concepts.map(c => {
              if (countByConcept[c.id]) {
                return { ...c, questionsCount: c.questionsCount + countByConcept[c.id] };
              }
              return c;
            })
          }))
        }))
      );
    }
  };

  const deletePastImport = (importId: string) => {
    const item = pastImports.find(p => p.id === importId);
    if (!item) return;

    const idsToRemove = new Set(item.questionIds);

    // Remove questions
    setQuestions(prev => prev.filter(q => !idsToRemove.has(q.id)));

    // Remove from errorBook
    setErrorBook(prev => prev.filter(errItem => !idsToRemove.has(errItem.id)));

    // Calculate how many questions of each concept are being removed
    const removedCountByConcept: Record<string, number> = {};
    questions.forEach(q => {
      if (idsToRemove.has(q.id)) {
        removedCountByConcept[q.conceptId] = (removedCountByConcept[q.conceptId] || 0) + 1;
      }
    });

    // Update questionsCount in concept
    setTopics(prev =>
      prev.map(t => ({
        ...t,
        subtopics: t.subtopics.map(st => ({
          ...st,
          concepts: st.concepts.map(c => {
            const countToRemove = removedCountByConcept[c.id] || 0;
            if (countToRemove > 0) {
              return { ...c, questionsCount: Math.max(0, c.questionsCount - countToRemove) };
            }
            return c;
          })
        }))
      }))
    );

    // Remove from pastImports list
    setPastImports(prev => prev.filter(p => p.id !== importId));
  };

  const editPastImport = (importId: string, newTopicName: string, newSubtopicName: string, newConceptName: string) => {
    const itemIndex = pastImports.findIndex(p => p.id === importId);
    if (itemIndex === -1) return;
    const item = pastImports[itemIndex];

    const targetQuestionId = item.questionIds[0];
    const targetQuestion = questions.find(q => q.id === targetQuestionId);
    if (!targetQuestion) return; 

    const targetConceptId = targetQuestion.conceptId;
    let conceptToMove: Concept | undefined;

    let cleanedTopics = topics.map(t => {
      return {
        ...t,
        subtopics: t.subtopics.map(st => {
          const cIndex = st.concepts.findIndex(c => c.id === targetConceptId);
          if (cIndex !== -1) {
            conceptToMove = { ...st.concepts[cIndex] };
            return { ...st, concepts: st.concepts.filter(c => c.id !== targetConceptId) };
          }
          return st;
        }).filter(st => st.concepts.length > 0) 
      };
    }).filter(t => t.subtopics.length > 0); 

    if (!conceptToMove) return;

    conceptToMove.name = newConceptName;

    let tIndex = cleanedTopics.findIndex(t => t.name.toLowerCase() === newTopicName.toLowerCase());
    let topicId = tIndex !== -1 ? cleanedTopics[tIndex].id : `topic_${Date.now()}`;
    
    if (tIndex === -1) {
      cleanedTopics.push({
        id: topicId,
        name: newTopicName,
        subtopics: []
      });
      tIndex = cleanedTopics.length - 1;
    }

    let t = cleanedTopics[tIndex];
    let stIndex = t.subtopics.findIndex(st => st.name.toLowerCase() === newSubtopicName.toLowerCase());
    let subtopicId = stIndex !== -1 ? t.subtopics[stIndex].id : `subtopic_${Date.now()}`;

    if (stIndex === -1) {
      t.subtopics.push({
        id: subtopicId,
        topicId: topicId,
        name: newSubtopicName,
        concepts: []
      });
      stIndex = t.subtopics.length - 1;
    }

    conceptToMove.subtopicId = subtopicId;
    t.subtopics[stIndex].concepts.push(conceptToMove);

    setTopics(cleanedTopics);

    const updatedImports = [...pastImports];
    updatedImports[itemIndex] = {
      ...item,
      topicName: newTopicName,
      subtopicName: newSubtopicName,
      conceptName: newConceptName
    };
    setPastImports(updatedImports);
  };

  // Helper to parse Markdown package.
  // The expected markdown format:
  // # Question
  // [Question content text]
  // ## Options
  // A. Option 1
  // B. Option 2
  // C. Option 3
  // D. Option 4
  // ## Answer
  // [A or B or C or D]
  // ## Explanation
  // [Explanation text]
  // ## Difficulty
  // [Easy or Medium or Hard]
  const importMarkdownPackage = (markdown: string, conceptId: string) => {
    try {
      if (!markdown.trim()) {
        return { success: false, count: 0, error: 'Markdown input is empty', preview: [] };
      }

      let parsedQuestions: Partial<Question>[] = [];
      let parsedTopicName = '';
      let parsedSubtopicName = '';
      let parsedConceptName = '';

      const topicMatch = markdown.match(/Topic:\s*(.+)/i);
      const subtopicMatch = markdown.match(/Subtopic:\s*(.+)/i);
      const conceptMatch = markdown.match(/Concept:\s*(.+)/i);

      if (topicMatch) parsedTopicName = topicMatch[1].trim();
      if (subtopicMatch) parsedSubtopicName = subtopicMatch[1].trim();
      if (conceptMatch) parsedConceptName = conceptMatch[1].trim();

      let parsedOriginalExplanation = '';
      let parsedOriginalQuestion = '';
      let parsedBestMethod = '';

      const isNewFormat = !!(topicMatch || subtopicMatch || conceptMatch);

      if (isNewFormat) {
        const originalMatch = markdown.match(/#Original\s*\n([\s\S]*?)(?=\n## Generated Questions|$)/i);
        if (originalMatch) {
          const originalBlock = originalMatch[1];
          const expMatch = originalBlock.match(/Concept Explanation:\s*([\s\S]*?)(?=\nOriginal Question:|$)/i);
          if (expMatch) parsedOriginalExplanation = expMatch[1].trim();

          const oqFullMatch = originalBlock.match(/Original Question:\s*([\s\S]*?)(?=\nBest Method to Solve:|$)/i);
          if (oqFullMatch) parsedOriginalQuestion = oqFullMatch[1].trim();

          const bmMatch = originalBlock.match(/Best Method to Solve:\s*([\s\S]*?)$/i);
          if (bmMatch) parsedBestMethod = bmMatch[1].trim();
        }
        const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

        const extractSection = (text: string, header: string): string => {
          const startIndex = text.indexOf(header);
          if (startIndex === -1) return '';
          const contentStart = startIndex + header.length;
          const nextHeaderIndex = text.indexOf('\n#', contentStart);
          if (nextHeaderIndex === -1) {
            return text.substring(contentStart);
          }
          return text.substring(contentStart, nextHeaderIndex);
        };

        const extractOption = (blockText: string, letter: string, nextLetters: string[]): string => {
          const patterns = [
            new RegExp(`\\n+${letter}\\.\\s*([\\s\\S]*?)(?=\\n+(?:${nextLetters.join('|')})|$)`, 'i'),
            new RegExp(`\\n+${letter}\\)\\s*([\\s\\S]*?)(?=\\n+(?:${nextLetters.join('|')})|$)`, 'i'),
            new RegExp(`\\n+${letter}\\s*:\\s*([\\s\\S]*?)(?=\\n+(?:${nextLetters.join('|')})|$)`, 'i')
          ];

          for (const pattern of patterns) {
            const match = blockText.match(pattern);
            if (match) return match[1].trim();
          }
          return '';
        };

        for (const diff of difficulties) {
          const sectionContent = extractSection(markdown, `### ${diff}`);
          if (!sectionContent) continue;

          const questionBlocks = sectionContent.split(/(?=Q\d+\.)/i).filter(b => b.trim().length > 10);

          for (const block of questionBlocks) {
            let blockClean = block.trim();
            blockClean = blockClean.replace(/^Q\d+\.\s*/i, '').trim();

            const textMatch = blockClean.match(/^([\s\S]*?)(?=\n+Options:|\n+A\.)/i);
            const questionText = textMatch ? textMatch[1].trim() : '';

            if (!questionText) continue;

            const optA = extractOption(blockClean, 'A', ['B\\.', 'B\\)', 'B:', 'Answer:', 'Explanation:']);
            const optB = extractOption(blockClean, 'B', ['C\\.', 'C\\)', 'C:', 'Answer:', 'Explanation:']);
            const optC = extractOption(blockClean, 'C', ['D\\.', 'D\\)', 'D:', 'Answer:', 'Explanation:']);
            const optD = extractOption(blockClean, 'D', ['Answer:', 'Explanation:']);

            let options = [optA, optB, optC, optD].filter(Boolean);
            while (options.length < 4) {
              options.push(`Option ${options.length + 1}`);
            }
            options = options.slice(0, 4);

            const answerMatch = blockClean.match(/\n+Answer\s*:\s*([A-D])/i) || blockClean.match(/\n+Answer\s*([A-D])/i);
            const answerLetter = answerMatch ? answerMatch[1].trim().toUpperCase() : 'A';
            let correctOption = 0;
            if (answerLetter === 'B') correctOption = 1;
            else if (answerLetter === 'C') correctOption = 2;
            else if (answerLetter === 'D') correctOption = 3;

            const explMatch = blockClean.match(/\n+Explanation\s*:\s*([\s\S]*?)(?=\n+Q\d+\.|$)/i) || blockClean.match(/\n+Explanation\s*([\s\S]*?)(?=\n+Q\d+\.|$)/i);
            const explanation = explMatch ? explMatch[1].trim() : '';

            parsedQuestions.push({
              conceptId,
              text: questionText,
              options: options as [string, string, string, string],
              correctOption,
              difficulty: diff,
              explanation
            });
          }
        }
      } else {
        // Fallback to `# Question` blocks
        const questionBlocks = markdown.split(/(?=# Question)/i).filter(b => b.trim().length > 10);

        if (questionBlocks.length > 0) {
          for (const block of questionBlocks) {
            const qMatch = block.match(/# Question\s*\n+([\s\S]*?)(?=\n+## Options|\n+## Answer|\n+## Explanation|\n+## Difficulty|$)/i);
            const questionText = qMatch ? qMatch[1].trim() : '';

            const optionsMatch = block.match(/## Options\s*\n+([\s\S]*?)(?=\n+## Answer|\n+## Explanation|\n+## Difficulty|$)/i);
            let options: string[] = [];
            if (optionsMatch) {
              const optLines = optionsMatch[1].split('\n').map(l => l.trim()).filter(l => l.length > 0);
              options = optLines.map(line => {
                return line.replace(/^[A-D](\.|\)|:)\s*/i, '').trim();
              });
            }

            while (options.length < 4) {
              options.push(`Option ${options.length + 1}`);
            }
            options = options.slice(0, 4);

            const answerMatch = block.match(/## Answer\s*\n+([\s\S]*?)(?=\n+## Explanation|\n+## Difficulty|$)/i);
            const answerText = answerMatch ? answerMatch[1].trim().toUpperCase() : 'A';
            let correctOption = 0;
            if (answerText.includes('B') || answerText === '1') correctOption = 1;
            else if (answerText.includes('C') || answerText === '2') correctOption = 2;
            else if (answerText.includes('D') || answerText === '3') correctOption = 3;

            const expMatch = block.match(/## Explanation\s*\n+([\s\S]*?)(?=\n+## Difficulty|$)/i);
            const explanation = expMatch ? expMatch[1].trim() : '';

            const diffMatch = block.match(/## Difficulty\s*\n+([\s\S]*?)(?=$)/i);
            let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
            if (diffMatch) {
              const dText = diffMatch[1].trim().toLowerCase();
              if (dText.includes('easy')) difficulty = 'Easy';
              if (dText.includes('hard')) difficulty = 'Hard';
            }

            if (questionText) {
              parsedQuestions.push({
                conceptId,
                text: questionText,
                options: options as [string, string, string, string],
                correctOption,
                difficulty,
                explanation,
              });
            }
          }
        }
      }

      if (parsedQuestions.length === 0) {
        return { success: false, count: 0, error: 'Could not parse any valid questions. Please check the markdown formatting.', preview: [] };
      }

      return {
        success: true,
        count: parsedQuestions.length,
        preview: parsedQuestions,
        parsedMeta: isNewFormat ? {
          topic: parsedTopicName,
          subtopic: parsedSubtopicName,
          concept: parsedConceptName,
          conceptExplanation: parsedOriginalExplanation,
          originalQuestion: parsedOriginalQuestion,
          bestMethod: parsedBestMethod
        } : undefined
      };

    } catch (e: any) {
      return { success: false, count: 0, error: e.message || 'Error occurred during parsing', preview: [] };
    }
  };

  const logMockTest = (mockData: Omit<MockTest, 'id'>) => {
    const id = `mock_${Date.now()}`;
    const newMock: MockTest = {
      ...mockData,
      id,
      weakQuestions: mockData.weakQuestions.map((wq, index) => ({
        ...wq,
        id: `wq_${Date.now()}_${index}`,
      }))
    };

    setMockTests(prev => [newMock, ...prev]);

    // Also automatically log weak questions to the error book!
    mockData.weakQuestions.forEach(wq => {
      // Find concept name
      let conceptName = 'Unknown Concept';
      topics.forEach(t => {
        t.subtopics.forEach(st => {
          st.concepts.forEach(c => {
            if (c.id === wq.conceptId) {
              conceptName = c.name;
            }
          });
        });
      });

      const errorBookItem: ErrorBookItem = {
        id: `err_mock_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        conceptId: wq.conceptId,
        questionText: wq.questionText || `Concept error from ${mockData.name}`,
        correctAnswerText: wq.correctAnswer,
        userAnswerText: wq.userAnswer,
        source: 'mock',
        sourceName: mockData.name,
        dateAdded: new Date().toISOString(),
        reason: wq.reason,
        notes: wq.notes,
        archived: false,
      };
      setErrorBook(prev => [errorBookItem, ...prev]);
    });
  };

  const deleteMockTest = (id: string) => {
    setMockTests(prev => prev.filter(m => m.id !== id));
  };

  const updateMockTest = (id: string, updates: Partial<MockTest>) => {
    setMockTests(prev =>
      prev.map(mock => {
        if (mock.id === id) {
          const merged = { ...mock, ...updates };
          // If weak questions are added, also auto-add them to the Error Book if not already present
          if (updates.weakQuestions) {
            updates.weakQuestions.forEach(wq => {
              // Only add if it doesn't have an ID yet (meaning it's newly added)
              if (!wq.id) {
                const wqId = `wq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                wq.id = wqId;

                const errorBookItem: ErrorBookItem = {
                  id: `err_mock_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  conceptId: wq.conceptId,
                  questionText: wq.questionText || `Concept error from ${merged.name}`,
                  correctAnswerText: wq.correctAnswer,
                  userAnswerText: wq.userAnswer,
                  source: 'mock',
                  sourceName: merged.name,
                  dateAdded: new Date().toISOString(),
                  reason: wq.reason,
                  notes: wq.notes,
                  archived: false,
                };
                setErrorBook(prevErr => [errorBookItem, ...prevErr]);
              }
            });
          }
          return merged;
        }
        return mock;
      })
    );
  };

  const addErrorBookItem = (itemData: Omit<ErrorBookItem, 'id' | 'dateAdded' | 'archived'>) => {
    const newItem: ErrorBookItem = {
      ...itemData,
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      dateAdded: new Date().toISOString(),
      archived: false
    };
    setErrorBook(prev => [newItem, ...prev]);
  };

  const updateErrorBookItem = (id: string, updates: Partial<ErrorBookItem>) => {
    setErrorBook(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
  };

  const completePracticeSession = (
    conceptIds: string[],
    isSrs: boolean,
    durationSeconds: number,
    results: {
      questionId: string;
      userAnswer: number | null;
      isCorrect: boolean;
      timeSpentSeconds: number;
      failureReason?: FailureReason;
      notes?: string;
    }[]
  ) => {
    const correctCount = results.filter(r => r.isCorrect).length;
    const wrongCount = results.filter(r => r.userAnswer !== null && !r.isCorrect).length;
    // Calculate Score: +2 for correct, -0.5 for wrong
    const score = correctCount * 2 - wrongCount * 0.5;
    const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

    const newSession: PracticeSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toISOString(),
      conceptIds,
      isSrs,
      totalQuestions: results.length,
      score,
      accuracy,
      durationSeconds,
      results
    };

    setPracticeSessions(prev => [newSession, ...prev]);

    // Update SRS schedule for each question
    setQuestions(prevQs =>
      prevQs.map(q => {
        const res = results.find(r => r.questionId === q.id);
        if (!res) return q;

        const srs = { ...q.srsState };
        const isCorrect = res.isCorrect;

        // Repetitions
        if (isCorrect) {
          srs.repetitions += 1;
          // Interval calculations
          if (srs.repetitions === 1) {
            srs.interval = 1; // 1 day
          } else if (srs.repetitions === 2) {
            srs.interval = 3; // 3 days
          } else {
            srs.interval = Math.ceil(srs.interval * srs.ease);
          }
          // Adjust ease
          srs.ease = Math.min(3.0, srs.ease + 0.15);
        } else {
          srs.repetitions = 0;
          srs.interval = 1; // Review tomorrow
          // Decrease ease for incorrect
          srs.ease = Math.max(1.3, srs.ease - 0.2);
        }

        srs.lastReviewed = new Date().toISOString();
        // Due Date = Now + interval * 24 hours
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() + srs.interval);
        srs.dueDate = dueDateObj.toISOString();

        return { ...q, srsState: srs };
      })
    );

    // Automatically send wrong answers to error book if they aren't already there
    results.forEach(res => {
      if (res.userAnswer !== null && !res.isCorrect) {
        const fullQ = questions.find(q => q.id === res.questionId);
        if (fullQ) {
          const errorBookItem: ErrorBookItem = {
            id: `err_practice_${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${res.questionId}`,
            conceptId: fullQ.conceptId,
            questionText: fullQ.text,
            options: fullQ.options,
            correctOption: fullQ.correctOption,
            userAnswerText: fullQ.options[res.userAnswer],
            correctAnswerText: fullQ.options[fullQ.correctOption],
            source: 'practice',
            sourceName: 'Smart Practice Session',
            dateAdded: new Date().toISOString(),
            reason: res.failureReason || 'Concept not cleared',
            notes: res.notes,
            archived: false,
          };
          setErrorBook(prev => [errorBookItem, ...prev]);
        }
      }
    });

    // Recalculate concept masteries based on recent practice sessions
    // Let's compute average accuracy of the last few results for that concept
    setTopics(prevTopics => {
      return prevTopics.map(t => ({
        ...t,
        subtopics: t.subtopics.map(st => ({
          ...st,
          concepts: st.concepts.map(c => {
            if (conceptIds.includes(c.id)) {
              // Find all session results for this concept
              // We'll calculate a simple weighted average accuracy
              const conceptResults = [...results, ...practiceSessions.flatMap(ps => ps.results)]
                .filter(res => {
                  const q = questions.find(qu => qu.id === res.questionId);
                  return q && q.conceptId === c.id;
                });

              if (conceptResults.length === 0) return c;
              const conceptCorrect = conceptResults.filter(r => r.isCorrect).length;
              const mastery = Math.round((conceptCorrect / conceptResults.length) * 100);
              
              const currentSessionResultsForConcept = results.filter(res => {
                  const q = questions.find(qu => qu.id === res.questionId);
                  return q && q.conceptId === c.id;
              });
              
              let newPerf = c.recentPerformance || [];
              currentSessionResultsForConcept.forEach(res => {
                newPerf = [res.isCorrect, ...newPerf].slice(0, 5);
              });

              return { ...c, mastery, recentPerformance: newPerf };
            }
            return c;
          })
        }))
      }));
    });

    return newSession;
  };

  // Reorder syllabus items for premium customizability
  const reorderTopics = (topicId: string, direction: 'up' | 'down') => {
    const index = topics.findIndex(t => t.id === topicId);
    if (index === -1) return;
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= topics.length) return;

    const newTopics = [...topics];
    const [removed] = newTopics.splice(index, 1);
    newTopics.splice(nextIndex, 0, removed);
    setTopics(newTopics);
  };

  const reorderSubtopics = (topicId: string, subtopicId: string, direction: 'up' | 'down') => {
    setTopics(prev =>
      prev.map(t => {
        if (t.id === topicId) {
          const index = t.subtopics.findIndex(st => st.id === subtopicId);
          if (index === -1) return t;
          const nextIndex = direction === 'up' ? index - 1 : index + 1;
          if (nextIndex < 0 || nextIndex >= t.subtopics.length) return t;

          const newSubtopics = [...t.subtopics];
          const [removed] = newSubtopics.splice(index, 1);
          newSubtopics.splice(nextIndex, 0, removed);
          return { ...t, subtopics: newSubtopics };
        }
        return t;
      })
    );
  };

  const reorderConcepts = (subtopicId: string, conceptId: string, direction: 'up' | 'down') => {
    setTopics(prev =>
      prev.map(t => {
        return {
          ...t,
          subtopics: t.subtopics.map(st => {
            if (st.id === subtopicId) {
              const index = st.concepts.findIndex(c => c.id === conceptId);
              if (index === -1) return st;
              const nextIndex = direction === 'up' ? index - 1 : index + 1;
              if (nextIndex < 0 || nextIndex >= st.concepts.length) return st;

              const newConcepts = [...st.concepts];
              const [removed] = newConcepts.splice(index, 1);
              newConcepts.splice(nextIndex, 0, removed);
              return { ...st, concepts: newConcepts };
            }
            return st;
          })
        };
      })
    );
  };

  const resetAllData = () => {
    localStorage.removeItem('anki_ssc_maths_state_v5_clean');
    if (userId !== 'guest') {
      deleteAllUserData(userId).catch(err =>
        console.error('Failed to delete Firestore data:', err)
      );
    }
    initializeDefaultState();
  };

  return (
    <AppContext.Provider
      value={{
        topics,
        questions,
        practiceSessions,
        mockTests,
        errorBook,
        pastImports,
        theme,
        toggleTheme,
        addTopic,
        deleteTopic,
        addSubtopic,
        addConcept,
        updateConcept,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        importMarkdownPackage,
        confirmImport,
        trackConceptPerformance,
        deletePastImport,
        editPastImport,
        logMockTest,
        updateMockTest,
        deleteMockTest,
        addErrorBookItem,
        updateErrorBookItem,
        completePracticeSession,
        reorderTopics,
        reorderSubtopics,
        reorderConcepts,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
