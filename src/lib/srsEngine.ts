import { Topic, Question, Concept, Difficulty, DifficultySrsState, ConceptSrsData, PracticeSessionQuestionResult } from '../types';

export function initializeConceptSrsData(): ConceptSrsData {
  const now = new Date().toISOString();
  const defaultState = (): DifficultySrsState => ({
    mastery: 0,
    interval: 1,
    ease: 2.5,
    repetitions: 0,
    dueDate: now,
    lastReviewed: null
  });
  return {
    Easy: defaultState(),
    Medium: defaultState(),
    Hard: defaultState()
  };
}

export function getNextPracticeSet(topics: Topic[], questions: Question[], limit: number = 10): Question[] {
  const now = new Date().toISOString();
  
  // Flatten concepts
  const allConcepts = topics.flatMap(t => t.subtopics.flatMap(st => st.concepts));
  
  // Group questions by concept and difficulty
  const questionsByConcept: Record<string, Record<Difficulty, Question[]>> = {};
  questions.forEach(q => {
    if (!questionsByConcept[q.conceptId]) {
      questionsByConcept[q.conceptId] = { Easy: [], Medium: [], Hard: [] };
    }
    questionsByConcept[q.conceptId][q.difficulty].push(q);
  });

  // Calculate concept priorities
  const conceptPriorities = allConcepts.map(c => {
    const srsData = c.srsData || initializeConceptSrsData();
    let isDue = false;
    let dueScore = 0;
    
    // Check if any difficulty is due
    (['Easy', 'Medium', 'Hard'] as Difficulty[]).forEach(diff => {
      const state = srsData[diff];
      if (state.dueDate <= now) {
        isDue = true;
        // Higher score for older due dates
        const daysOverdue = (new Date(now).getTime() - new Date(state.dueDate).getTime()) / (1000 * 3600 * 24);
        dueScore += daysOverdue;
      }
    });

    return {
      concept: c,
      isDue,
      dueScore,
      srsData
    };
  });

  // Sort concepts: Due first (ranked by lowest mastery + dueScore), then not due (ranked by lowest mastery)
  conceptPriorities.sort((a, b) => {
    if (a.isDue && !b.isDue) return -1;
    if (!a.isDue && b.isDue) return 1;
    
    // If both are due or both not due, prioritize lower mastery
    if (a.concept.mastery !== b.concept.mastery) {
       return a.concept.mastery - b.concept.mastery;
    }
    return b.dueScore - a.dueScore; 
  });

  // Select questions
  const selectedQuestions: Question[] = [];
  
  // We loop through concepts repeatedly, taking 1 question per concept per round, until limit is reached
  let round = 0;
  let addedInRound = 0;
  
  do {
    addedInRound = 0;
    for (const cp of conceptPriorities) {
      if (selectedQuestions.length >= limit) break;
      
      const availableQByDiff = questionsByConcept[cp.concept.id];
      if (!availableQByDiff) continue;

      // Determine target difficulty based on mastery logic
      const srsData = cp.srsData;
      let targetDiff: Difficulty = 'Easy';
      
      if (srsData.Easy.mastery >= 70) {
        if (srsData.Medium.mastery >= 70) {
          targetDiff = 'Hard';
        } else {
          targetDiff = 'Medium';
        }
      }

      // If the target difficulty has no questions, fallback to closest difficulty
      let candidates = availableQByDiff[targetDiff];
      if (candidates.length === 0 && targetDiff === 'Hard') candidates = availableQByDiff['Medium'];
      if (candidates.length === 0) candidates = availableQByDiff['Easy'];
      if (candidates.length === 0) candidates = availableQByDiff['Hard']; // ultimate fallback

      // Filter out already selected
      candidates = candidates.filter(q => !selectedQuestions.some(sq => sq.id === q.id));

      if (candidates.length > 0) {
        // Pick the oldest reviewed question
        candidates.sort((a, b) => {
          const tA = a.srsState?.lastReviewed ? new Date(a.srsState.lastReviewed).getTime() : 0;
          const tB = b.srsState?.lastReviewed ? new Date(b.srsState.lastReviewed).getTime() : 0;
          return tA - tB;
        });
        
        selectedQuestions.push(candidates[0]);
        addedInRound++;
      }
    }
    round++;
  } while (addedInRound > 0 && selectedQuestions.length < limit);

  return selectedQuestions;
}

export function updateSrsAfterPractice(
  results: PracticeSessionQuestionResult[],
  questions: Question[],
  topics: Topic[]
): { updatedTopics: Topic[], updatedQuestions: Question[] } {
  
  // We need deep clones for the update
  const newTopics = JSON.parse(JSON.stringify(topics)) as Topic[];
  const newQuestions = JSON.parse(JSON.stringify(questions)) as Question[];

  const now = new Date().toISOString();

  results.forEach(res => {
    // 1. Update Question lastReviewed
    const qIndex = newQuestions.findIndex(q => q.id === res.questionId);
    if (qIndex === -1) return;
    const q = newQuestions[qIndex];
    if (!q.srsState) {
        q.srsState = { interval: 1, ease: 2.5, repetitions: 0, dueDate: now, lastReviewed: null };
    }
    q.srsState.lastReviewed = now;
    
    // 2. Update Concept SRS Data
    for (const t of newTopics) {
      for (const st of t.subtopics) {
        for (const c of st.concepts) {
          if (c.id === q.conceptId) {
            if (!c.srsData) {
              c.srsData = initializeConceptSrsData();
            }

            const srsDiff = c.srsData[q.difficulty];
            const isCorrect = res.isCorrect;
            const reason = res.failureReason;

            if (isCorrect) {
              // Increase mastery
              srsDiff.mastery = Math.min(100, srsDiff.mastery + 15);
              srsDiff.repetitions += 1;
              srsDiff.ease = Math.min(3.0, srsDiff.ease + 0.15);
              
              if (srsDiff.repetitions === 1) {
                srsDiff.interval = 1;
              } else if (srsDiff.repetitions === 2) {
                srsDiff.interval = 3;
              } else {
                srsDiff.interval = Math.ceil(srsDiff.interval * srsDiff.ease);
              }
            } else {
              // Decrease mastery based on reason
              let penalty = 15;
              if (reason === 'Concept not cleared') penalty = 30;
              else if (reason === 'Calculation mistake') penalty = 10;
              else if (reason === 'Silly mistake') penalty = 5;

              srsDiff.mastery = Math.max(0, srsDiff.mastery - penalty);
              srsDiff.repetitions = 0;
              srsDiff.interval = 1; // review immediately tomorrow
              srsDiff.ease = Math.max(1.3, srsDiff.ease - 0.2);
            }

            srsDiff.lastReviewed = now;
            const nextDue = new Date();
            nextDue.setDate(nextDue.getDate() + srsDiff.interval);
            srsDiff.dueDate = nextDue.toISOString();

            // Update recentPerformance
            const newPerf = [isCorrect, ...(c.recentPerformance || [])].slice(0, 5);
            c.recentPerformance = newPerf;

            // Re-calculate overall concept mastery as average of difficulties
            c.mastery = Math.round((c.srsData.Easy.mastery + c.srsData.Medium.mastery + c.srsData.Hard.mastery) / 3);
          }
        }
      }
    }
  });

  return { updatedTopics: newTopics, updatedQuestions: newQuestions };
}
