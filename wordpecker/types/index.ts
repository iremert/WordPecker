export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: string;
  lastActive: string;
  settings?: {
    receiveNotifications: boolean;
    language?: string;
    theme?: string;
    dailyGoal?: number;
  };
}

export interface WordList {
  id: string;
  userId: string;
  title: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  category: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  totalWords: number;
  learnedWords: number;
  words: Word[];
}

export interface Word {
  id: string;
  listId: string;
  sourceWord: string;
  targetWord: string;
  pronunciation?: string;
  contextSentence?: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  reviewCount: number;
  mastered: boolean;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface QuizResult {
  listId: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  wrongAnswers: string[];
}

export interface LearningSession {
  listId: string;
  date: string;
  wordsReviewed: number;
  wordsMastered: number;
  timeSpent: number;
}

export interface UserStats {
  totalWordsMastered: number;
  totalWordsLearned: number;
  totalLists: number;
  streakDays: number;
  lastStreak: string;
  quizResults: QuizResult[];
  learningSessions: LearningSession[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}