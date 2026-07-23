import { Topic, Question, PracticeSessionQuestionResult, Difficulty } from '../types';

export function getNextPracticeSet(topics: Topic[], questions: Question[], limit: number = 10): Question[] {
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

  // Sort concepts: prioritize lowest mastery first
  const sortedConcepts = [...allConcepts].sort((a, b) => (a.mastery || 0) - (b.mastery || 0));

  // Select questions
  const selectedQuestions: Question[] = [];
  
  let addedInRound = 0;
  
  do {
    addedInRound = 0;
    for (const c of sortedConcepts) {
      if (selectedQuestions.length >= limit) break;
      
      const availableQByDiff = questionsByConcept[c.id];
      if (!availableQByDiff) continue;

      // Determine target difficulty based on single concept mastery score:
      // < 30  -> Easy
      // 30-69 -> Medium
      // >= 70 -> Hard
      const mastery = c.mastery || 0;
      let targetDiff: Difficulty = 'Easy';
      if (mastery >= 70) {
        targetDiff = 'Hard';
      } else if (mastery >= 30) {
        targetDiff = 'Medium';
      }

      // If the target difficulty has no questions, fallback to closest difficulty
      let candidates = availableQByDiff[targetDiff] || [];
      if (candidates.length === 0 && targetDiff === 'Hard') candidates = availableQByDiff['Medium'] || [];
      if (candidates.length === 0 && (targetDiff === 'Hard' || targetDiff === 'Medium')) candidates = availableQByDiff['Easy'] || [];
      if (candidates.length === 0) candidates = [...(availableQByDiff['Medium'] || []), ...(availableQByDiff['Hard'] || [])]; // ultimate fallback

      // Filter out already selected questions in this session
      candidates = candidates.filter(q => !selectedQuestions.some(sq => sq.id === q.id));

      if (candidates.length > 0) {
        // PRIORITY:
        // 1. Unattempted questions first (lastReviewed === null)
        // 2. Oldest reviewed questions second
        candidates.sort((a, b) => {
          const aReviewed = a.srsState?.lastReviewed ? 1 : 0;
          const bReviewed = b.srsState?.lastReviewed ? 1 : 0;
          if (aReviewed !== bReviewed) {
            return aReviewed - bReviewed; // 0 (unattempted) comes before 1 (attempted)
          }

          const tA = a.srsState?.lastReviewed ? new Date(a.srsState.lastReviewed).getTime() : 0;
          const tB = b.srsState?.lastReviewed ? new Date(b.srsState.lastReviewed).getTime() : 0;
          return tA - tB;
        });
        
        selectedQuestions.push(candidates[0]);
        addedInRound++;
      }
    }
  } while (addedInRound > 0 && selectedQuestions.length < limit);

  return selectedQuestions;
}

export function updateSrsAfterPractice(
  results: PracticeSessionQuestionResult[],
  questions: Question[],
  topics: Topic[]
): { updatedTopics: Topic[], updatedQuestions: Question[] } {
  
  // Deep clones for state mutation
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
    
    // 2. Update Concept single mastery score (+10 right, -5 wrong)
    const isCorrect = res.isCorrect;
    
    for (const t of newTopics) {
      for (const st of t.subtopics) {
        for (const c of st.concepts) {
          if (c.id === q.conceptId) {
            let currentMastery = typeof c.mastery === 'number' ? c.mastery : 0;
            
            if (isCorrect) {
              currentMastery = Math.min(100, currentMastery + 10);
            } else {
              currentMastery = Math.max(0, currentMastery - 5);
            }
            
            c.mastery = currentMastery;

            // Update recentPerformance history (last 5)
            const newPerf = [isCorrect, ...(c.recentPerformance || [])].slice(0, 5);
            c.recentPerformance = newPerf;
          }
        }
      }
    }
  });

  return { updatedTopics: newTopics, updatedQuestions: newQuestions };
}
