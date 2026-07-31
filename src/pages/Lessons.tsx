import React, { useState, useEffect } from 'react';
import { tamilPhrases } from '../data/phrases';
import { tamilQuestions } from '../data/questions';
import { useUser } from '../contexts/UserContext';
import { translationService } from '../services/translationService';
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Star, 
  Volume2, 
  Brain,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speechService } from '../services/speechService';
import toast from 'react-hot-toast';

const WORDS_PER_LESSON = 10;
const QUIZZES_PER_LESSON = 1;

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  phrases: typeof tamilPhrases;
  questions: typeof tamilQuestions;
  unlocked: boolean;
  completed: boolean;
  completedAt?: string;
  points: number;
}

type StoredLessonProgress = Record<string, {
  completed: boolean;
  unlocked: boolean;
  completedAt?: string;
}>;

const getPhraseKey = (phrase: (typeof tamilPhrases)[number]) =>
  `${phrase.tamil.trim().toLowerCase()}-${phrase.english.trim().toLowerCase()}`;

const getQuestionKey = (question: (typeof tamilQuestions)[number]) =>
  question.question.trim().toLowerCase();

const getUniquePhrases = (phrases: typeof tamilPhrases, seen = new Set<string>()) => {

  return phrases.filter((phrase) => {
    const key = getPhraseKey(phrase);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getUniqueQuestions = (questions: typeof tamilQuestions) => {
  const seen = new Set<string>();

  return questions.filter((question) => {
    const key = getQuestionKey(question);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const buildLessonCards = (): Lesson[] => {
  const phrasePool = getUniquePhrases([
    ...tamilPhrases,
    ...translationService.getLessonPhrases()
  ]);
  const quizPool = getUniqueQuestions(tamilQuestions);
  const lessonCount = Math.min(
    Math.floor(phrasePool.length / WORDS_PER_LESSON),
    Math.floor(quizPool.length / QUIZZES_PER_LESSON)
  );

  return Array.from({ length: lessonCount }, (_, idx) => {
    const phrases = phrasePool.slice(
      idx * WORDS_PER_LESSON,
      (idx + 1) * WORDS_PER_LESSON
    );
    const questions = quizPool.slice(
      idx * QUIZZES_PER_LESSON,
      (idx + 1) * QUIZZES_PER_LESSON
    );
    const difficulty: Lesson['difficulty'] = idx < 2 ? 'beginner' : 'intermediate';

    return {
      id: `lesson-${idx + 1}`,
      title: `Lesson ${idx + 1}`,
      description: `${WORDS_PER_LESSON} new words and ${QUIZZES_PER_LESSON} quiz`,
      difficulty,
      category: 'practice',
      phrases,
      questions,
      unlocked: idx === 0,
      completed: false,
      points: WORDS_PER_LESSON * 10 + QUIZZES_PER_LESSON * 5
    };
  });
};

const lessonProgressStorageKey = (email?: string) =>
  `lessonProgress_${email || 'guest'}`;

const getStoredLessonProgress = (email?: string): StoredLessonProgress => {
  try {
    const data = localStorage.getItem(lessonProgressStorageKey(email));
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveStoredLessonProgress = (email: string | undefined, lessons: Lesson[]) => {
  const progress = lessons.reduce<StoredLessonProgress>((result, lesson) => {
    result[lesson.id] = {
      completed: lesson.completed,
      unlocked: lesson.unlocked,
      completedAt: lesson.completedAt
    };

    return result;
  }, {});

  localStorage.setItem(lessonProgressStorageKey(email), JSON.stringify(progress));
};

const applyStoredLessonProgress = (lessons: Lesson[], email?: string) => {
  const progress = getStoredLessonProgress(email);

  return lessons.map((lesson, index) => {
    const storedLesson = progress[lesson.id];

    return {
      ...lesson,
      completed: Boolean(storedLesson?.completed),
      completedAt: storedLesson?.completedAt,
      unlocked: index === 0 || Boolean(storedLesson?.unlocked) || Boolean(progress[`lesson-${index}`]?.completed)
    };
  });
};

const Lessons: React.FC = () => {
  const { user, addPoints, incrementStreak, addAchievement } = useUser();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionCorrect, setQuestionCorrect] = useState<boolean | null>(null);

  const [lessons, setLessons] = useState<Lesson[]>(() => applyStoredLessonProgress(buildLessonCards(), user?.email));

  useEffect(() => {
    setLessons(applyStoredLessonProgress(buildLessonCards(), user?.email));
  }, [user?.email]);

  // Complete a lesson
  const completeLesson = () => {
    if (selectedLesson) {
      const existingLesson = lessons.find((lesson) => lesson.id === selectedLesson.id);

      if (existingLesson?.completed) {
        setSelectedLesson(null);
        setCurrentStep(0);
        return;
      }

      addPoints(selectedLesson.points);
      incrementStreak();
      toast.success(`Lesson completed! +${selectedLesson.points} points, streak increased!`);
      // mark lesson completed and unlock next lesson
      setLessons(prev => {
        const idx = prev.findIndex(l => l.id === selectedLesson.id);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], completed: true, completedAt: new Date().toISOString() };
        if (idx + 1 < updated.length) {
          updated[idx + 1] = { ...updated[idx + 1], unlocked: true };
        }
        saveStoredLessonProgress(user?.email, updated);

        if (!prev.some((lesson) => lesson.completed)) {
          addAchievement('First Lesson');
        }

        if (updated.filter((lesson) => lesson.completed).length >= 5) {
          addAchievement('Lesson Builder');
        }

        return updated;
      });
      setSelectedLesson(null);
      setCurrentStep(0);
    }
  };

  // Auto-complete lesson when all steps are done
  useEffect(() => {
    if (selectedLesson) {
      const totalSteps = selectedLesson.phrases.length + selectedLesson.questions.length;
      if (currentStep >= totalSteps) {
        completeLesson();
      }
    }
  }, [currentStep, selectedLesson]);

  // Go to next step or complete lesson
  const nextStep = () => {
    if (selectedLesson) {
      const totalSteps = selectedLesson.phrases.length + selectedLesson.questions.length;
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        completeLesson();
      }
    }
  };

  // Play audio for a phrase
  const playAudio = async (text: string, language: 'en' | 'ta' = 'ta') => {
    try {
      await speechService.speak(text, language);
    } catch (error) {
      console.error('Audio playback error:', error);
      toast.error('Could not play audio');
    }
  };

  // Start a lesson
  const startLesson = (lesson: Lesson) => {
    if (!lesson.unlocked) {
      toast.error('Complete previous lessons to unlock this one');
      return;
    }
    if (lesson.completed) {
      toast('You already completed this lesson.');
      return;
    }
    setSelectedOption(null);
    setShowAnswer(false);
    setQuestionCorrect(null);
    setSelectedLesson(lesson);
    setCurrentStep(0);
  };

  const generateExpandedLessons = () => {
    setLessons(applyStoredLessonProgress(buildLessonCards(), user?.email));
    toast.success('Lesson cards regenerated with 10 unique words and 1 unique quiz each');
  };

    return (
  <div className="min-h-screen bg-cream-200 dark:bg-ink-800 p-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-vermillion-500 via-marigold-500 to-teal-500 mb-2 drop-shadow-lg">Tamil Lessons</h1>
            <p className="text-lg text-ink-600 dark:text-cream-200 font-medium">Structured learning path from basics to advanced</p>
            {/* Progress Overview */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
              <div className="bg-cream-300 dark:bg-ink-600 rounded-xl p-4 flex flex-col items-center border">
                <BookOpen className="text-vermillion-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-ink-700 dark:text-cream-100">{lessons.length}</p>
                <p className="text-sm text-ink-400 dark:text-cream-300/70">Total Lessons</p>
              </div>
              <div className="bg-cream-300 dark:bg-ink-600 rounded-xl p-4 border flex flex-col items-center">
                <CheckCircle className="text-teal-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-ink-700 dark:text-cream-100">
                  {lessons.filter(l => l.completed).length}
                </p>
                <p className="text-sm text-ink-400 dark:text-cream-300/70">Completed</p>
              </div>
              <div className="bg-cream-300 dark:bg-ink-600 rounded-xl p-4 border flex flex-col items-center">
                <Lock className="text-ink-300 dark:text-cream-300/60 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-ink-700 dark:text-cream-100">
                  {lessons.filter(l => !l.unlocked).length}
                </p>
                <p className="text-sm text-ink-400 dark:text-cream-300/70">Locked</p>
              </div>
              <div className="bg-cream-300 dark:bg-ink-600 rounded-xl p-4 border flex flex-col items-center">
                <Trophy className="text-marigold-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-ink-700 dark:text-cream-100">
                  {lessons.reduce((sum, l) => sum + (l.completed ? l.points : 0), 0)}
                </p>
                <p className="text-sm text-ink-400 dark:text-cream-300/70">Points Earned</p>
              </div>
              <div className="bg-cream-300 dark:bg-ink-600 rounded-xl p-4 border flex flex-col items-center">
                <span role="img" aria-label="fire" className="mx-auto mb-2 text-3xl" style={{ color: (user?.streak ?? 0) > 0 ? '#f59e42' : '#d1d5db' }}>🔥</span>
                <p className="text-2xl font-bold text-ink-700 dark:text-cream-100">{user?.streak ?? 0}</p>
                <p className="text-sm text-ink-400 dark:text-cream-300/70">Streak</p>
                {(user?.streak ?? 0) > 0 && (
                  <span className="text-xs text-marigold-500 mt-1 font-semibold">Keep it up!</span>
                )}
              </div>
              <div className="bg-cream-300 dark:bg-ink-600 rounded-xl p-4 border flex flex-col items-center">
                <Brain className="text-vermillion-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-ink-700 dark:text-cream-100">{user?.level || 'beginner'}</p>
                <p className="text-sm text-ink-400 dark:text-cream-300/70 capitalize">Your Level</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={generateExpandedLessons}
                className="inline-flex items-center px-4 py-2 bg-vermillion-600 text-white rounded-xl hover:bg-vermillion-700 transition-colors"
              >
                <ArrowRight size={16} className="mr-2" />
                Generate Expanded Lessons
              </button>
            </div>
          </motion.div>

          {/* Lessons Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className={
                  idx % 2 === 0
                    ? 'bg-gradient-to-br from-vermillion-100 via-marigold-100 to-teal-100 rounded-xl2'
                    : 'bg-gradient-to-br from-vermillion-100 via-marigold-100 to-teal-100 rounded-xl2'
                }
              >
                {/* You may want to use a LessonCard component here for more detail */}
                <div
                  className="cursor-pointer p-6 hover:shadow-card transition-all rounded-xl2"
                  onClick={() => startLesson(lesson)}
                >
                  <h3 className="text-xl font-bold text-ink-700 dark:text-cream-100 mb-2">{lesson.title}</h3>
                  <p className="text-ink-400 dark:text-cream-300/70 mb-2">{lesson.description}</p>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 mb-2">{lesson.difficulty}</span>
                  <div className="flex items-center space-x-2">
                    <Star size={16} className="text-marigold-500" />
                    <span className="font-semibold">{lesson.points} points</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Lesson Modal */}
        <AnimatePresence>
          {selectedLesson && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedLesson(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-ink-600 rounded-xl2 shadow-card p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Lesson Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-ink-700 dark:text-cream-100">{selectedLesson.title}</h2>
                    <p className="text-ink-400 dark:text-cream-300/70">{selectedLesson.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-ink-300 dark:text-cream-300/60 mb-1">
                      Step {currentStep + 1} of {selectedLesson.phrases.length + selectedLesson.questions.length}
                    </div>
                    <div className="w-32 bg-ink-50 dark:bg-ink-500 rounded-full h-2">
                      <div 
                        className="bg-vermillion-500 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${((currentStep + 1) / (selectedLesson.phrases.length + selectedLesson.questions.length)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="min-h-[300px]">
                  {currentStep < selectedLesson.phrases.length ? (
                    // Phrase Step
                    <div className="text-center">
                      <div className="bg-vermillion-50 rounded-xl p-8 mb-6">
                        <p className="text-4xl font-bold text-ink-700 dark:text-cream-100 mb-3">
                          {selectedLesson.phrases[currentStep].tamil}
                        </p>
                        <p className="text-2xl text-ink-400 dark:text-cream-300/70 mb-3">
                          {selectedLesson.phrases[currentStep].transliteration}
                        </p>
                        <p className="text-xl text-vermillion-700">
                          "{selectedLesson.phrases[currentStep].english}"
                        </p>
                        <button
                          onClick={() => playAudio(selectedLesson.phrases[currentStep].tamil)}
                          className="mt-4 flex items-center space-x-2 mx-auto px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
                        >
                          <Volume2 size={20} />
                          <span>Listen</span>
                        </button>
                      </div>
                      {selectedLesson.phrases[currentStep].culturalContext && (
                        <div className="bg-marigold-50 rounded-xl p-4 mb-6">
                          <h4 className="font-semibold text-marigold-700 mb-2">Cultural Context:</h4>
                          <p className="text-marigold-700">
                            {selectedLesson.phrases[currentStep].culturalContext}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Question Step
                    <div>
                      {(() => {
                        const questionIndex = currentStep - selectedLesson.phrases.length;
                        const question = selectedLesson.questions[questionIndex];
                        
                        // Guard: if question doesn't exist, we're past the end
                        if (!question) {
                          return <div className="text-center text-ink-400 dark:text-cream-300/70">Lesson completing...</div>;
                        }
                        
                        return (
                          <div>
                            <h3 className="text-xl font-semibold text-ink-700 dark:text-cream-100 mb-6">
                              {question.question}
                            </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                      {question.options.map((option, index) => {
                                        const isSelected = selectedOption === index;
                                        const reveal = showAnswer;
                                        const isCorrect = reveal && index === question.correctAnswer;
                                        const isWrongSelected = reveal && isSelected && !isCorrect;
                                        return (
                                          <button
                                            key={index}
                                            onClick={() => {
                                              if (showAnswer) return; // already answered
                                              setSelectedOption(index);
                                              setShowAnswer(true);
                                              const correct = index === question.correctAnswer;
                                              setQuestionCorrect(correct);
                                              if (correct) {
                                                // small delay then advance
                                                setTimeout(() => {
                                                  setSelectedOption(null);
                                                  setShowAnswer(false);
                                                  setQuestionCorrect(null);
                                                  setCurrentStep(prev => prev + 1);
                                                }, 800);
                                              }
                                            }}
                                            className={`p-4 text-left border rounded-xl transition-colors dark:border-ink-400 ${isSelected ? 'ring-2 ring-vermillion-300' : 'bg-cream-200 dark:bg-ink-700 hover:bg-marigold-50 dark:hover:bg-ink-500'} ${isCorrect ? 'bg-teal-50 dark:bg-teal-500/10 border-teal-300 dark:border-teal-500/40' : ''} ${isWrongSelected ? 'bg-vermillion-50 dark:bg-vermillion-500/10 border-vermillion-300 dark:border-vermillion-500/40' : ''}`}
                                          >
                                            <span className="font-medium text-vermillion-600 mr-2">
                                              {String.fromCharCode(65 + index)}.
                                            </span>
                                            {option}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {showAnswer && (
                                      <div className="mt-4">
                                        {questionCorrect ? (
                                          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                                            <p className="font-semibold text-teal-700 mb-2">Correct!</p>
                                            <p className="text-teal-700">{String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}</p>
                                            <p className="text-teal-600 mt-2 text-sm">{question.explanation}</p>
                                          </div>
                                        ) : (
                                          <div className="bg-vermillion-50 border border-vermillion-200 rounded-xl p-4">
                                            <p className="font-semibold text-vermillion-700 mb-2">Incorrect — try again</p>
                                            <p className="text-vermillion-600 mt-2 text-sm">Select the correct option to continue.</p>
                                            <div className="mt-3">
                                              <button
                                                onClick={() => {
                                                  // allow retry
                                                  setSelectedOption(null);
                                                  setShowAnswer(false);
                                                  setQuestionCorrect(null);
                                                }}
                                                className="px-4 py-2 bg-marigold-400 text-ink-800 rounded-xl"
                                              >Try Again</button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                          </div>
                        );
                        })()}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="px-6 py-3 bg-ink-500 text-white rounded-xl hover:bg-ink-600 transition-colors"
                  >
                    Close Lesson
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-vermillion-500 text-white rounded-xl hover:bg-vermillion-600 transition-colors"
                  >
                    {currentStep < selectedLesson.phrases.length + selectedLesson.questions.length - 1 
                      ? 'Next' 
                      : 'Complete Lesson'
                    }
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
};

export default Lessons;
