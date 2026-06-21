import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { tamilQuestions } from '../data/questions';
import { translationService } from '../services/translationService';
import {
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Flame,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type DailyTaskType = 'scenario' | 'phrases' | 'roleplay' | 'quiz';

interface RealWorldPhrase {
  english: string;
  tamil: string;
  transliteration: string;
}

interface ScenarioContent {
  place: string;
  goal: string;
  steps: string[];
}

interface PhrasesContent {
  phrases: RealWorldPhrase[];
}

interface RoleplayContent {
  situation: string;
  prompt: string;
  sampleAnswer: string;
}

type QuizContent = (typeof tamilQuestions)[number];

interface DailyTask {
  id: string;
  type: DailyTaskType;
  title: string;
  subtitle: string;
  points: number;
  completed: boolean;
  completedAt?: string;
  content: ScenarioContent | PhrasesContent | RoleplayContent | QuizContent;
}

const DAILY_TASK_COUNT = 6;
const PHRASES_PER_TASK = 5;
const PHRASE_TASKS_PER_DAY = 2;

interface TaskAssignmentHistory {
  scenarios: string[];
  phraseSets: string[];
  roleplays: string[];
  quizzes: string[];
}

const realWorldScenarios = [
  {
    id: 'tea-shop',
    place: 'Tea shop',
    goal: 'Order tea, ask the price, and thank the shopkeeper.',
    steps: ['Greet the shopkeeper', 'Ask for one tea', 'Ask how much it costs', 'Say thank you']
  },
  {
    id: 'bus-stand',
    place: 'Bus stand',
    goal: 'Ask where the bus goes and when it leaves.',
    steps: ['Ask for the destination', 'Ask the time', 'Confirm the stop', 'Say thanks before leaving']
  },
  {
    id: 'market',
    place: 'Market',
    goal: 'Buy an item politely and ask for a small discount.',
    steps: ['Ask the price', 'Ask if it is fresh', 'Request a discount', 'Ask for a bag']
  },
  {
    id: 'restaurant',
    place: 'Restaurant',
    goal: 'Ask for a menu, order food, and request the bill.',
    steps: ['Ask for the menu', 'Ask if a dish is vegetarian', 'Order politely', 'Ask for the bill']
  },
  {
    id: 'clinic',
    place: 'Clinic',
    goal: 'Explain that you are not feeling well and ask for help.',
    steps: ['Say you need a doctor', 'Describe the problem simply', 'Ask how long it will take', 'Thank them']
  },
  {
    id: 'railway-station',
    place: 'Railway station',
    goal: 'Ask for a ticket, platform number, and train time.',
    steps: ['Ask for one ticket', 'Say the destination', 'Ask the platform number', 'Confirm the departure time']
  },
  {
    id: 'pharmacy',
    place: 'Pharmacy',
    goal: 'Ask for medicine and understand basic dosage instructions.',
    steps: ['Greet the pharmacist', 'Say what you need', 'Ask how often to take it', 'Thank them politely']
  },
  {
    id: 'auto-ride',
    place: 'Auto stand',
    goal: 'Tell the driver your destination and agree on the fare.',
    steps: ['Ask if the driver can go there', 'Say the place name', 'Ask the fare', 'Confirm before getting in']
  },
  {
    id: 'library',
    place: 'Library',
    goal: 'Ask for a book and learn where to sit quietly.',
    steps: ['Ask where Tamil books are', 'Ask for help finding one', 'Ask where to sit', 'Say thanks softly']
  },
  {
    id: 'school-office',
    place: 'School office',
    goal: 'Ask about class timings and admission details.',
    steps: ['Introduce yourself', 'Ask about class time', 'Ask what documents are needed', 'Thank the staff']
  },
  {
    id: 'grocery-store',
    place: 'Grocery store',
    goal: 'Buy daily essentials and check the total amount.',
    steps: ['Ask for the items', 'Ask if more stock is available', 'Ask the total price', 'Request a receipt']
  },
  {
    id: 'temple-visit',
    place: 'Temple',
    goal: 'Ask about timings and behave respectfully.',
    steps: ['Ask opening time', 'Ask where to leave footwear', 'Ask if photos are allowed', 'Say thanks respectfully']
  }
];

const roleplayPrompts = [
  {
    id: 'buy-water',
    situation: 'You are in a shop and want to buy a bottle of water.',
    prompt: 'Type what you would say in English before trying it in Tamil.',
    sampleAnswer: 'Excuse me, how much does this water cost?'
  },
  {
    id: 'ask-atm',
    situation: 'You are lost and need directions to the nearest ATM.',
    prompt: 'Write a polite sentence you can use with a stranger.',
    sampleAnswer: 'Excuse me, where is the nearest ATM?'
  },
  {
    id: 'request-bill',
    situation: 'You are at a restaurant and want the bill.',
    prompt: 'Write the request you would make to the waiter.',
    sampleAnswer: 'Can I get the bill, please?'
  },
  {
    id: 'self-intro',
    situation: 'You are meeting someone new and want to introduce yourself.',
    prompt: 'Write one simple introduction sentence.',
    sampleAnswer: 'Hello, my name is Arun.'
  },
  {
    id: 'ask-price',
    situation: 'You are buying fruit and want to ask the price per kilo.',
    prompt: 'Write the question you would ask the seller.',
    sampleAnswer: 'How much is one kilo of bananas?'
  },
  {
    id: 'late-bus',
    situation: 'Your bus is late and you want to ask when it will arrive.',
    prompt: 'Write a short polite question.',
    sampleAnswer: 'When will the bus arrive?'
  },
  {
    id: 'phone-number',
    situation: 'You need to ask someone for their phone number.',
    prompt: 'Write the request politely.',
    sampleAnswer: 'Can you please give me your phone number?'
  },
  {
    id: 'need-help',
    situation: 'You need help carrying a bag.',
    prompt: 'Write a simple sentence asking for help.',
    sampleAnswer: 'Can you please help me with this bag?'
  },
  {
    id: 'appointment-time',
    situation: 'You are calling a clinic to ask for an appointment time.',
    prompt: 'Write what you would ask.',
    sampleAnswer: 'Is there an appointment available today?'
  },
  {
    id: 'wrong-address',
    situation: 'You reached the wrong address and need clarification.',
    prompt: 'Write a sentence asking if this is the correct place.',
    sampleAnswer: 'Is this the correct address?'
  },
  {
    id: 'borrow-pen',
    situation: 'You need to borrow a pen in class.',
    prompt: 'Write a polite request.',
    sampleAnswer: 'Can I borrow your pen for a minute?'
  },
  {
    id: 'ask-language',
    situation: 'You want to ask whether someone speaks English.',
    prompt: 'Write one simple question.',
    sampleAnswer: 'Do you speak English?'
  }
];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getYesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return toDateKey(date);
};

const taskStorageKey = (todayKey: string, email?: string) =>
  `dailyTasks_${email || 'guest'}_${todayKey}`;

const taskHistoryStorageKey = (email?: string) =>
  `dailyTaskHistory_${email || 'guest'}`;

const streakStorageKey = (email?: string) =>
  `dailyTaskStreak_${email || 'guest'}`;

const getEmptyTaskHistory = (): TaskAssignmentHistory => ({
  scenarios: [],
  phraseSets: [],
  roleplays: [],
  quizzes: []
});

const getTaskHistory = (email?: string): TaskAssignmentHistory => {
  try {
    const savedHistory = localStorage.getItem(taskHistoryStorageKey(email));
    return savedHistory ? { ...getEmptyTaskHistory(), ...JSON.parse(savedHistory) } : getEmptyTaskHistory();
  } catch {
    return getEmptyTaskHistory();
  }
};

const saveTaskHistory = (email: string | undefined, history: TaskAssignmentHistory) => {
  localStorage.setItem(taskHistoryStorageKey(email), JSON.stringify(history));
};

const getIdScore = (id: string, todayKey: string, offset: number) => {
  const seed = `${todayKey}-${offset}-${id}`;
  return seed.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
};

const selectUnusedItems = <T extends { id: string }>(
  pool: T[],
  usedIds: string[],
  count: number,
  todayKey: string,
  offset: number
) => {
  const validUsedIds = usedIds.filter((id) => pool.some((item) => item.id === id));
  const unusedPool = pool.filter((item) => !validUsedIds.includes(item.id));
  const isNewCycle = unusedPool.length < count;
  const sourcePool = isNewCycle ? pool : unusedPool;
  const selectedItems = [...sourcePool]
    .sort((first, second) => getIdScore(first.id, todayKey, offset) - getIdScore(second.id, todayKey, offset))
    .slice(0, count);
  const selectedIds = selectedItems.map((item) => item.id);

  return {
    selectedItems,
    nextUsedIds: isNewCycle ? selectedIds : [...validUsedIds, ...selectedIds]
  };
};

const buildPhraseSets = () => {
  const phrasePool = translationService.getLessonPhrases();
  const phraseSetCount = Math.floor(phrasePool.length / PHRASES_PER_TASK);

  return Array.from({ length: phraseSetCount }, (_, setIndex) => {
    const start = setIndex * PHRASES_PER_TASK;
    const phrases = phrasePool.slice(start, start + PHRASES_PER_TASK).map((phrase) => ({
      english: phrase.english,
      tamil: phrase.tamil,
      transliteration: phrase.transliteration
    }));

    return {
      id: `phrase-set-${setIndex + 1}`,
      title: setIndex === 0 ? 'Useful lines' : `Useful lines ${setIndex + 1}`,
      phrases
    };
  });
};

const buildDailyTasks = (todayKey: string, email?: string): DailyTask[] => {
  const phraseSets = buildPhraseSets();
  const quizPool = tamilQuestions.map((question) => ({ ...question, id: `quiz-${question.id}` }));
  const history = getTaskHistory(email);
  const selectedScenarios = selectUnusedItems(realWorldScenarios, history.scenarios, 2, todayKey, 0);
  const selectedPhraseSets = selectUnusedItems(phraseSets, history.phraseSets, PHRASE_TASKS_PER_DAY, todayKey, 20);
  const selectedRoleplays = selectUnusedItems(roleplayPrompts, history.roleplays, 1, todayKey, 40);
  const selectedQuizzes = selectUnusedItems(quizPool, history.quizzes, 1, todayKey, 60);
  const [firstScenario, secondScenario] = selectedScenarios.selectedItems;
  const [roleplay] = selectedRoleplays.selectedItems;
  const [quiz] = selectedQuizzes.selectedItems;

  saveTaskHistory(email, {
    scenarios: selectedScenarios.nextUsedIds,
    phraseSets: selectedPhraseSets.nextUsedIds,
    roleplays: selectedRoleplays.nextUsedIds,
    quizzes: selectedQuizzes.nextUsedIds
  });

  return [
    {
      id: `scenario-${firstScenario.id}`,
      type: 'scenario',
      title: `${firstScenario.place} mission`,
      subtitle: firstScenario.goal,
      content: firstScenario,
      points: 15,
      completed: false
    },
    {
      id: `scenario-${secondScenario.id}`,
      type: 'scenario',
      title: `${secondScenario.place} mission`,
      subtitle: secondScenario.goal,
      content: secondScenario,
      points: 15,
      completed: false
    },
    ...selectedPhraseSets.selectedItems.map((phraseSet, index) => ({
      id: `phrases-${phraseSet.id}`,
      type: 'phrases',
      title: index === 0 ? 'Useful lines' : 'More useful lines',
      subtitle: 'Practice five phrases you can actually use today.',
      content: { phrases: phraseSet.phrases },
      points: 20,
      completed: false
    } satisfies DailyTask)),
    {
      id: `roleplay-${roleplay.id}`,
      type: 'roleplay',
      title: 'Speak it out',
      subtitle: roleplay.situation,
      content: roleplay,
      points: 20,
      completed: false
    },
    {
      id: quiz.id,
      type: 'quiz',
      title: 'One-minute quiz',
      subtitle: 'Answer one question to finish the day.',
      content: quiz,
      points: 15,
      completed: false
    }
  ];
};

const Daily: React.FC = () => {
  const { user, addPoints, addAchievement, updateUser } = useUser();
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [roleplayAnswer, setRoleplayAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTodayKey(toDateKey(new Date()));
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedTasks = localStorage.getItem(taskStorageKey(todayKey, user?.email));

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks) as DailyTask[];

        if (parsedTasks.length === DAILY_TASK_COUNT) {
          setDailyTasks(parsedTasks);
          return;
        }
      } catch {
        localStorage.removeItem(taskStorageKey(todayKey, user?.email));
      }
    }

    const tasks = buildDailyTasks(todayKey, user?.email);
    setDailyTasks(tasks);
    localStorage.setItem(taskStorageKey(todayKey, user?.email), JSON.stringify(tasks));
  }, [todayKey, user?.email]);

  const updateDailyStreak = () => {
    if (!user) return;

    const key = streakStorageKey(user.email);
    const lastCompletedDate = localStorage.getItem(key);

    if (lastCompletedDate === todayKey) {
      return;
    }

    const nextStreak = lastCompletedDate === getYesterdayKey()
      ? user.streak + 1
      : Math.max(1, user.streak && !lastCompletedDate ? user.streak : 1);

    updateUser({ ...user, streak: nextStreak });
    localStorage.setItem(key, todayKey);
    toast.success(`Daily streak: ${nextStreak} day${nextStreak === 1 ? '' : 's'}`);
  };

  const completeTask = (taskId: string) => {
    const task = dailyTasks.find(item => item.id === taskId);
    if (!task || task.completed) return;

    const updatedTasks = dailyTasks.map(item =>
      item.id === taskId ? { ...item, completed: true, completedAt: new Date().toISOString() } : item
    );

    addPoints(task.points);
    toast.success(`+${task.points} points earned`);

    const allDone = updatedTasks.every(item => item.completed);
    if (allDone) {
      addAchievement('Daily Master');
      updateDailyStreak();
    }

    setDailyTasks(updatedTasks);
    localStorage.setItem(taskStorageKey(todayKey, user?.email), JSON.stringify(updatedTasks));
    setSelectedTask(null);
    setCurrentAnswer('');
    setRoleplayAnswer('');
    setShowResult(false);
  };

  const handleQuizSubmit = () => {
    if (!selectedTask || selectedTask.type !== 'quiz') return;

    const question = selectedTask.content as QuizContent;
    const isCorrect = Number(currentAnswer) === question.correctAnswer;
    setShowResult(true);

    if (isCorrect) {
      window.setTimeout(() => completeTask(selectedTask.id), 1000);
    }
  };

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalPoints = dailyTasks.reduce((sum, task) =>
    task.completed ? sum + task.points : sum, 0
  );
  const progress = dailyTasks.length ? (completedTasks / dailyTasks.length) * 100 : 0;

  const TaskCard: React.FC<{ task: DailyTask }> = ({ task }) => {
    const Icon = task.type === 'scenario'
      ? MapPin
      : task.type === 'phrases'
        ? ShoppingBag
        : task.type === 'roleplay'
          ? MessageCircle
          : ClipboardCheck;

    return (
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        className={`text-left bg-white border rounded-lg p-5 shadow-sm transition-all ${
          task.completed
            ? 'border-green-300 bg-green-50'
            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        }`}
        onClick={() => !task.completed && setSelectedTask(task)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon size={20} />
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">{task.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{task.subtitle}</p>
            </div>
          </div>
          {task.completed && <CheckCircle className="shrink-0 text-green-600" size={20} />}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            {task.completed ? 'Completed' : 'Start task'}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {task.points} pts
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Daily Tamil
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">Real-world practice</h1>
              <p className="mt-2 max-w-2xl text-gray-600">
                Finish today&apos;s fresh set: two situations, two phrase drills, a speaking prompt, and one quiz.
              </p>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-orange-800">
              <div className="flex items-center gap-2">
                <Flame size={20} />
                <span className="text-2xl font-bold">{user?.streak || 0}</span>
              </div>
              <p className="text-sm">day streak</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border bg-white p-4">
              <Calendar className="mb-2 text-blue-500" size={22} />
              <p className="text-2xl font-bold text-gray-900">{new Date().getDate()}</p>
              <p className="text-sm text-gray-600">Today</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <CheckCircle className="mb-2 text-green-500" size={22} />
              <p className="text-2xl font-bold text-gray-900">{completedTasks}/{DAILY_TASK_COUNT}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <Star className="mb-2 text-yellow-500" size={22} />
              <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
              <p className="text-sm text-gray-600">Points today</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <ClipboardCheck className="mb-2 text-purple-500" size={22} />
              <p className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</p>
              <p className="text-sm text-gray-600">Progress</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {dailyTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </motion.div>

        <div className="rounded-lg border bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Today&apos;s completion</h3>
            <span className="text-sm font-medium text-gray-600">
              {completedTasks}/{dailyTasks.length || DAILY_TASK_COUNT}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-blue-600"
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
              <p className="mt-1 text-gray-600">{selectedTask.subtitle}</p>

              {selectedTask.type === 'scenario' && (
                <div className="mt-6">
                  {(selectedTask.content as ScenarioContent).steps.map((step, index) => (
                    <div key={step} className="mb-3 flex items-center gap-3 rounded-lg border p-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {index + 1}
                      </span>
                      <span className="text-gray-800">{step}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => completeTask(selectedTask.id)}
                    className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    I can handle this (+{selectedTask.points} pts)
                  </button>
                </div>
              )}

              {selectedTask.type === 'phrases' && (
                <div className="mt-6">
                  {(selectedTask.content as PhrasesContent).phrases.map((phrase) => (
                    <div key={`${phrase.english}-${phrase.tamil}`} className="mb-3 rounded-lg border p-4">
                      <p className="text-lg font-semibold text-gray-900">{phrase.tamil}</p>
                      <p className="text-sm text-gray-500">{phrase.transliteration}</p>
                      <p className="mt-1 text-blue-700">{phrase.english}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => completeTask(selectedTask.id)}
                    className="mt-4 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                  >
                    Practiced these lines (+{selectedTask.points} pts)
                  </button>
                </div>
              )}

              {selectedTask.type === 'roleplay' && (
                <div className="mt-6">
                  <div className="rounded-lg bg-indigo-50 p-4 text-indigo-900">
                    {(selectedTask.content as RoleplayContent).situation}
                  </div>
                  <label className="mt-5 block text-sm font-semibold text-gray-700">
                    {(selectedTask.content as RoleplayContent).prompt}
                  </label>
                  <textarea
                    value={roleplayAnswer}
                    onChange={(event) => setRoleplayAnswer(event.target.value)}
                    className="mt-2 min-h-28 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                    placeholder="Type your sentence here"
                  />
                  <p className="mt-3 text-sm text-gray-600">
                    Example: {(selectedTask.content as RoleplayContent).sampleAnswer}
                  </p>
                  <button
                    onClick={() => completeTask(selectedTask.id)}
                    disabled={roleplayAnswer.trim().length < 4}
                    className="mt-4 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save practice (+{selectedTask.points} pts)
                  </button>
                </div>
              )}

              {selectedTask.type === 'quiz' && (
                <div className="mt-6">
                  {(() => {
                    const question = selectedTask.content as QuizContent;
                    const selectedIndex = Number(currentAnswer);
                    const isCorrect = selectedIndex === question.correctAnswer;

                    return (
                      <>
                        <h3 className="mb-4 text-xl font-semibold text-gray-900">{question.question}</h3>
                        <div className="space-y-2">
                          {question.options.map((option, index) => (
                            <label
                              key={option}
                              className={`block cursor-pointer rounded-lg border p-3 ${
                                currentAnswer === index.toString()
                                  ? 'border-blue-400 bg-blue-50'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="daily-answer"
                                value={index}
                                checked={currentAnswer === index.toString()}
                                onChange={(event) => setCurrentAnswer(event.target.value)}
                                className="mr-3"
                              />
                              {option}
                            </label>
                          ))}
                        </div>

                        {showResult && (
                          <div className={`mt-4 rounded-lg border p-4 ${
                            isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                          }`}>
                            <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {isCorrect ? 'Correct' : 'Try again'}
                            </p>
                            <p className="mt-1 text-gray-700">{question.explanation}</p>
                          </div>
                        )}

                        {!showResult ? (
                          <button
                            onClick={handleQuizSubmit}
                            disabled={!currentAnswer}
                            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Submit answer
                          </button>
                        ) : !isCorrect && (
                          <button
                            onClick={() => {
                              setCurrentAnswer('');
                              setShowResult(false);
                            }}
                            className="mt-5 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
                          >
                            Try again
                          </button>
                        )}
                      </>
                    );
                  })()}
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
