import React, { useState, useEffect } from 'react';
import { tamilPhrases } from '../data/phrases';
import { tamilQuestions } from '../data/questions';
import { useUser } from '../contexts/UserContext';
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
  points: number;
}

const Lessons: React.FC = () => {
  const { user, addPoints, incrementStreak } = useUser();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionCorrect, setQuestionCorrect] = useState<boolean | null>(null);

  // Generate lessons dynamically from phrase categories to create larger, topic-focused lessons
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    // default seed lessons (keeps backward compatibility)
    return [
      {
        id: 'seed-1',
        title: 'Basic Greetings',
        description: 'Learn essential Tamil greetings and polite expressions',
        difficulty: 'beginner',
        category: 'greetings',
        phrases: tamilPhrases.filter(p => p.category === 'greetings'),
        questions: tamilQuestions.filter(q => q.category === 'greetings'),
        unlocked: true,
        completed: false,
        points: 50
      }
    ];
  });

  // Complete a lesson
  const completeLesson = () => {
    if (selectedLesson) {
      addPoints(selectedLesson.points);
      incrementStreak();
      toast.success(`Lesson completed! +${selectedLesson.points} points, streak increased!`);
      // mark lesson completed and unlock next lesson
      setLessons(prev => {
        const idx = prev.findIndex(l => l.id === selectedLesson.id);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], completed: true };
        if (idx + 1 < updated.length) {
          updated[idx + 1] = { ...updated[idx + 1], unlocked: true };
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
    setSelectedOption(null);
    setShowAnswer(false);
    setQuestionCorrect(null);
    setSelectedLesson(lesson);
    setCurrentStep(0);
  };

  const generateExpandedLessons = () => {
    const categories = Array.from(new Set(tamilPhrases.map(p => p.category || 'misc')));
    const generated: Lesson[] = categories.map((cat, idx) => {
      const catPhrases = tamilPhrases.filter(p => p.category === cat);
      // make lesson 'huge' by including related phrases from nearby categories
      const extra = tamilPhrases.filter(p => p.category !== cat).slice(0, 5);
      const phrases = [...catPhrases, ...extra];
      const questions = tamilQuestions.filter(q => q.category === cat).slice(0, 8);
      const difficulty: Lesson['difficulty'] = phrases.length > 10 ? 'intermediate' : 'beginner';
      return {
        id: `gen-${idx + 1}`,
        title: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Deep Dive`,
        description: `Comprehensive ${cat} lessons that cover vocabulary, phrases and practice exercises`,
        difficulty,
        category: cat,
        phrases,
        questions,
        unlocked: idx === 0,
        completed: false,
        points: Math.min(250, phrases.length * 10 + questions.length * 5)
      };
    });

    setLessons(generated);
    toast.success('Expanded lessons generated based on card topics');
  };

    return (
  <div className="min-h-screen bg-white p-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-2 drop-shadow-lg">Tamil Lessons</h1>
            <p className="text-lg text-gray-700 font-medium">Structured learning path from basics to advanced</p>
            {/* Progress Overview */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
              <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center border">
                <BookOpen className="text-blue-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-800">{lessons.length}</p>
                <p className="text-sm text-gray-600">Total Lessons</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 border flex flex-col items-center">
                <CheckCircle className="text-green-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-800">
                  {lessons.filter(l => l.completed).length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 border flex flex-col items-center">
                <Lock className="text-gray-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-800">
                  {lessons.filter(l => !l.unlocked).length}
                </p>
                <p className="text-sm text-gray-600">Locked</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 border flex flex-col items-center">
                <Trophy className="text-yellow-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-800">
                  {lessons.reduce((sum, l) => sum + (l.completed ? l.points : 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 border flex flex-col items-center">
                <span role="img" aria-label="fire" className="mx-auto mb-2 text-3xl" style={{ color: (user?.streak ?? 0) > 0 ? '#f59e42' : '#d1d5db' }}>🔥</span>
                <p className="text-2xl font-bold text-gray-800">{user?.streak ?? 0}</p>
                <p className="text-sm text-gray-600">Streak</p>
                {(user?.streak ?? 0) > 0 && (
                  <span className="text-xs text-orange-500 mt-1 font-semibold">Keep it up!</span>
                )}
              </div>
              <div className="bg-gray-100 rounded-lg p-4 border flex flex-col items-center">
                <Brain className="text-purple-500 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-gray-800">{user?.level || 'beginner'}</p>
                <p className="text-sm text-gray-600 capitalize">Your Level</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={generateExpandedLessons}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                    ? 'bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100 rounded-xl'
                    : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-xl'
                }
              >
                {/* You may want to use a LessonCard component here for more detail */}
                <div
                  className="cursor-pointer p-6 hover:shadow-xl transition-all rounded-xl"
                  onClick={() => startLesson(lesson)}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
                  <p className="text-gray-600 mb-2">{lesson.description}</p>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">{lesson.difficulty}</span>
                  <div className="flex items-center space-x-2">
                    <Star size={16} className="text-yellow-500" />
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
                className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Lesson Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedLesson.title}</h2>
                    <p className="text-gray-600">{selectedLesson.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">
                      Step {currentStep + 1} of {selectedLesson.phrases.length + selectedLesson.questions.length}
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
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
                      <div className="bg-blue-50 rounded-lg p-8 mb-6">
                        <p className="text-4xl font-bold text-gray-800 mb-3">
                          {selectedLesson.phrases[currentStep].tamil}
                        </p>
                        <p className="text-2xl text-gray-600 mb-3">
                          {selectedLesson.phrases[currentStep].transliteration}
                        </p>
                        <p className="text-xl text-blue-700">
                          "{selectedLesson.phrases[currentStep].english}"
                        </p>
                        <button
                          onClick={() => playAudio(selectedLesson.phrases[currentStep].tamil)}
                          className="mt-4 flex items-center space-x-2 mx-auto px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Volume2 size={20} />
                          <span>Listen</span>
                        </button>
                      </div>
                      {selectedLesson.phrases[currentStep].culturalContext && (
                        <div className="bg-orange-50 rounded-lg p-4 mb-6">
                          <h4 className="font-semibold text-orange-800 mb-2">Cultural Context:</h4>
                          <p className="text-orange-700">
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
                          return <div className="text-center text-gray-600">Lesson completing...</div>;
                        }
                        
                        return (
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">
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
                                            className={`p-4 text-left border rounded-lg transition-colors ${isSelected ? 'ring-2 ring-indigo-300' : 'bg-gray-50 hover:bg-blue-50'} ${isCorrect ? 'bg-green-50 border-green-300' : ''} ${isWrongSelected ? 'bg-red-50 border-red-300' : ''}`}
                                          >
                                            <span className="font-medium text-blue-600 mr-2">
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
                                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="font-semibold text-green-800 mb-2">Correct!</p>
                                            <p className="text-green-700">{String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}</p>
                                            <p className="text-green-600 mt-2 text-sm">{question.explanation}</p>
                                          </div>
                                        ) : (
                                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="font-semibold text-red-800 mb-2">Incorrect — try again</p>
                                            <p className="text-red-600 mt-2 text-sm">Select the correct option to continue.</p>
                                            <div className="mt-3">
                                              <button
                                                onClick={() => {
                                                  // allow retry
                                                  setSelectedOption(null);
                                                  setShowAnswer(false);
                                                  setQuestionCorrect(null);
                                                }}
                                                className="px-4 py-2 bg-yellow-400 text-white rounded-lg"
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
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close Lesson
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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