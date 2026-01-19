import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { tamilPhrases } from '../data/phrases';
import { tamilQuestions } from '../data/questions';
import { Calendar, CheckCircle, Flame, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface DailyTask {
  id: string;
  type: 'phrase' | 'quiz' | 'cultural';
  title: string;
  content: any;
  points: number;
  completed: boolean;
}

const Daily: React.FC = () => {
  const { user, addPoints, incrementStreak, addAchievement } = useUser();
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    generateDailyTasks();
  }, []);

  const generateDailyTasks = () => {
    const today = new Date().toDateString();
    const savedTasks = localStorage.getItem(`dailyTasks_${today}`);
    
    if (savedTasks) {
      setDailyTasks(JSON.parse(savedTasks));
    } else {
      const newTasks: DailyTask[] = [
        {
          id: '1',
          type: 'phrase',
          title: 'Daily Phrase',
          content: tamilPhrases[Math.floor(Math.random() * tamilPhrases.length)],
          points: 10,
          completed: false
        },
        {
          id: '2',
          type: 'quiz',
          title: 'Quick Quiz',
          content: tamilQuestions[Math.floor(Math.random() * tamilQuestions.length)],
          points: 15,
          completed: false
        },
        {
          id: '3',
          type: 'cultural',
          title: 'Cultural Insight',
          content: {
            title: 'Tamil Festival: Pongal',
            description: 'Pongal is a harvest festival celebrated in Tamil Nadu. It marks the beginning of the sun\'s six-month northward journey, and is dedicated to the sun god Surya.',
            vocabulary: ['பொங்கல் (Pongal)', 'அரிசி (Arisi - Rice)', 'கரும்பு (Karumbu - Sugarcane)']
          },
          points: 20,
          completed: false
        }
      ];
      
      setDailyTasks(newTasks);
      localStorage.setItem(`dailyTasks_${today}`, JSON.stringify(newTasks));
    }
  };

  const completeTask = (taskId: string) => {
    const updatedTasks = dailyTasks.map(task => {
      if (task.id === taskId && !task.completed) {
        const updatedTask = { ...task, completed: true };
        
        // Add points and achievements
        addPoints(task.points);
        toast.success(`+${task.points} points earned!`);
        
        // Check for achievements
        const completedCount = updatedTasks.filter(t => t.completed).length + 1;
        if (completedCount === dailyTasks.length) {
          addAchievement('Daily Master');
          incrementStreak();
          toast.success('🎉 All daily tasks completed! Streak increased!');
        }
        
        return updatedTask;
      }
      return task;
    });
    
    setDailyTasks(updatedTasks);
    const today = new Date().toDateString();
    localStorage.setItem(`dailyTasks_${today}`, JSON.stringify(updatedTasks));
    
    setSelectedTask(null);
    setCurrentAnswer('');
    setShowResult(false);
  };

  const handleQuizSubmit = () => {
    if (!selectedTask || selectedTask.type !== 'quiz') return;
    
    const isCorrect = parseInt(currentAnswer) === selectedTask.content.correctAnswer;
    setShowResult(true);
    
    if (isCorrect) {
      setTimeout(() => completeTask(selectedTask.id), 2000);
    }
  };

  const TaskCard: React.FC<{ task: DailyTask }> = ({ task }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
        task.completed 
          ? 'border-2 border-green-200 bg-green-50' 
          : 'hover:shadow-xl border border-gray-200'
      }`}
      onClick={() => !task.completed && setSelectedTask(task)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        <div className="flex items-center space-x-2">
          {task.completed && <CheckCircle className="text-green-500" size={20} />}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.completed 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {task.points} pts
          </span>
        </div>
      </div>
      
      <div className="text-gray-600">
        {task.type === 'phrase' && (
          <div>
            <p className="text-xl font-medium text-gray-800 mb-1">
              {task.content.tamil}
            </p>
            <p className="text-sm">{task.content.english}</p>
          </div>
        )}
        
        {task.type === 'quiz' && (
          <p>Test your Tamil knowledge with today's quiz question</p>
        )}
        
        {task.type === 'cultural' && (
          <p>Learn about Tamil culture and traditions</p>
        )}
      </div>
      
      {!task.completed && (
        <div className="mt-4 text-right">
          <span className="text-blue-600 text-sm font-medium">
            Click to complete →
          </span>
        </div>
      )}
    </motion.div>
  );

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalPoints = dailyTasks.reduce((sum, task) => 
    task.completed ? sum + task.points : sum, 0
  );

  return (
  <div className="min-h-screen bg-white p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Practice</h1>
          <p className="text-gray-600">Complete daily tasks to improve your Tamil skills</p>
          
          {/* Progress Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <Calendar className="text-blue-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-800">{new Date().getDate()}</p>
              <p className="text-sm text-gray-600">Today</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <CheckCircle className="text-green-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-800">{completedTasks}/{dailyTasks.length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <Star className="text-yellow-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-800">{totalPoints}</p>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <Flame className="text-orange-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-bold text-gray-800">{user?.streak || 0}</p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Daily Tasks Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {dailyTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Progress</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tasks Completed</span>
            <span className="text-sm font-medium text-gray-800">
              {completedTasks}/{dailyTasks.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedTasks / dailyTasks.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{selectedTask.title}</h2>
              
              {/* Phrase Task */}
              {selectedTask.type === 'phrase' && (
                <div className="text-center">
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <p className="text-3xl font-bold text-gray-800 mb-2">
                      {selectedTask.content.tamil}
                    </p>
                    <p className="text-xl text-gray-600 mb-2">
                      {selectedTask.content.transliteration}
                    </p>
                    <p className="text-lg text-blue-700">
                      "{selectedTask.content.english}"
                    </p>
                  </div>
                  
                  {selectedTask.content.culturalContext && (
                    <div className="bg-orange-50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-orange-800 mb-2">Cultural Context:</h4>
                      <p className="text-orange-700">{selectedTask.content.culturalContext}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => completeTask(selectedTask.id)}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Mark as Learned (+{selectedTask.points} pts)
                  </button>
                </div>
              )}
              
              {/* Quiz Task */}
              {selectedTask.type === 'quiz' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {selectedTask.content.question}
                    </h3>
                    
                    <div className="space-y-2">
                      {selectedTask.content.options.map((option: string, index: number) => (
                        <label
                          key={index}
                          className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                            currentAnswer === index.toString() 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={index}
                            checked={currentAnswer === index.toString()}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            className="mr-3"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg mb-4 ${
                        parseInt(currentAnswer) === selectedTask.content.correctAnswer
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <p className={`font-semibold ${
                        parseInt(currentAnswer) === selectedTask.content.correctAnswer
                          ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {parseInt(currentAnswer) === selectedTask.content.correctAnswer
                          ? '✅ Correct!' : '❌ Incorrect'}
                      </p>
                      <p className="text-gray-700 mt-2">{selectedTask.content.explanation}</p>
                    </motion.div>
                  )}
                  
                  {!showResult ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!currentAnswer}
                      className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Answer
                    </button>
                  ) : parseInt(currentAnswer) !== selectedTask.content.correctAnswer && (
                    <button
                      onClick={() => {
                        setCurrentAnswer('');
                        setShowResult(false);
                      }}
                      className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
              
              {/* Cultural Task */}
              {selectedTask.type === 'cultural' && (
                <div>
                  <div className="bg-purple-50 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-purple-800 mb-3">
                      {selectedTask.content.title}
                    </h3>
                    <p className="text-purple-700 mb-4">{selectedTask.content.description}</p>
                    
                    <h4 className="font-semibold text-purple-800 mb-2">Today's Vocabulary:</h4>
                    <div className="space-y-1">
                      {selectedTask.content.vocabulary.map((word: string, index: number) => (
                        <p key={index} className="text-purple-700 font-medium">{word}</p>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => completeTask(selectedTask.id)}
                    className="bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Mark as Read (+{selectedTask.points} pts)
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Daily;