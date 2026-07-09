export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface SrsState {
  interval: number; // in days
  ease: number; // ease factor, default 2.5
  repetitions: number; // count of consecutive correct reviews
  dueDate: string; // ISO date string
  lastReviewed: string | null; // ISO date string
}

export type FailureReason =
  | 'Concept not cleared'
  | 'Calculation mistake'
  | 'Silly mistake'
  | 'Insufficient time'
  | 'Question language unclear'
  | 'Pressure/Panic'
  | 'Other';

export interface Question {
  id: string;
  conceptId: string;
  text: string;
  image?: string; // Data URL or description
  options: [string, string, string, string]; // Exactly 4 options
  correctOption: number; // 0 for A, 1 for B, 2 for C, 3 for D
  difficulty: Difficulty;
  explanation?: string;
  srsState: SrsState;
  notes?: string;
}

export interface Concept {
  id: string;
  subtopicId: string;
  name: string;
  description?: string;
  mastery: number; // 0 to 100
  questionsCount: number;
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  concepts: Concept[];
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface PracticeSessionQuestionResult {
  questionId: string;
  userAnswer: number | null; // 0, 1, 2, 3 or null if skipped
  isCorrect: boolean;
  timeSpentSeconds: number;
  failureReason?: FailureReason;
  notes?: string;
}

export interface PracticeSession {
  id: string;
  date: string; // ISO string
  conceptIds: string[];
  isSrs: boolean;
  totalQuestions: number;
  score: number; // e.g., points: +2 for correct, -0.5 for wrong
  accuracy: number; // percentage
  durationSeconds: number;
  results: PracticeSessionQuestionResult[];
}

export interface WeakQuestionLog {
  id: string;
  conceptId: string;
  questionNumber: string; // e.g. "Q14"
  marksLost: number;
  reason: FailureReason;
  notes?: string;
  questionText?: string;
  correctAnswer?: string;
  userAnswer?: string;
}

export interface MockSectionPerformance {
  attempted: number;
  correct: number;
  wrong: number;
  score: number;
}

export interface MockTest {
  id: string;
  date: string; // YYYY-MM-DD
  name: string; // Mock name/source, e.g. "SSC CGL Mains 2024 - Test 3"
  platform?: string; // Platform like Testbook, Oliveboard, RBE etc.
  type: 'sectional' | 'full' | 'pyp' | 'live';
  score: number; // e.g., 142
  totalScore: number; // e.g., 200
  timeTakenMinutes: number;
  accuracy: number; // overall accuracy
  percentile: number; // percentile obtained in the mock, e.g., 94.5
  weakQuestions: WeakQuestionLog[];
  rawMarkdown?: string; // Pasted raw markdown from user
  notes?: string; // Notes parsed from the markdown
  attempted?: number;
  correct?: number;
  wrong?: number;
  sections?: {
    quant?: MockSectionPerformance;
    reasoning?: MockSectionPerformance;
    english?: MockSectionPerformance;
    ga?: MockSectionPerformance;
  };
  mathQuestionsAttempted?: number;
  mathQuestionsCorrect?: number;
  mathScore?: number;
  mathTotalScore?: number;
}

export interface ErrorBookItem {
  id: string; // can be original question ID or custom mockup ID
  questionText: string;
  image?: string;
  options?: [string, string, string, string];
  correctOption?: number;
  userAnswerText?: string;
  correctAnswerText?: string;
  source: 'practice' | 'mock';
  sourceName: string; // name of practice session or mock test
  dateAdded: string; // ISO string
  reason: FailureReason;
  notes?: string;
  conceptId: string;
  archived: boolean;
}

export interface PastImport {
  id: string;
  timestamp: string; // ISO string
  topicName: string;
  subtopicName: string;
  conceptName: string;
  questionsCount: number;
  questionIds: string[]; // Keep track of the question IDs imported in this batch
}

export interface AppState {
  topics: Topic[];
  questions: Question[];
  practiceSessions: PracticeSession[];
  mockTests: MockTest[];
  errorBook: ErrorBookItem[];
  theme: 'light' | 'dark';
  pastImports?: PastImport[];
}
