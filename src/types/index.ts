export interface User {
  id: string;
  name: string;
  email: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  streak: number;
  totalPoints: number;
  achievements: string[];
  learningPath: string[];
  dailyGoal: number;
  createdAt: string;
  photo?: string; // base64 or URL for profile photo
}

export interface Phrase {
  id: string;
  english: string;
  tamil: string;
  transliteration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  culturalContext?: string;
  audioUrl?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'translation' | 'correction' | 'lesson';
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation: string;
}

export interface LearningSession {
  id: string;
  userId: string;
  type: 'lesson' | 'quiz' | 'conversation';
  score: number;
  duration: number;
  completedAt: Date;
}