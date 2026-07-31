import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Brain,
  CheckCircle2,
  Clock3,
  Gamepad2,
  Headphones,
  Keyboard,
  Lock,
  Mic,
  Play,
  Puzzle,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';

type GameId = 'quiz' | 'word-search' | 'typing-sprint' | 'sentence-builder' | 'listening-match' | 'pronunciation-lab';
type GameStatus = 'Available' | 'Coming Soon';

type Game = {
  id: GameId;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  level: string;
  duration: string;
  points: number;
  status: GameStatus;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type WordTile = {
  tamil: string;
  meaning: string;
  target: boolean;
};

type TypingPrompt = {
  tamil: string;
  answer: string;
  hint: string;
};

type StoredGameStats = {
  streak: number;
  gamesCompleted: number;
  lastCompletedAt: string | null;
};

type StoredQuizRotation = {
  hourKey: string;
  questionIds: string[];
  usedQuestionIds: string[];
};

type StoredGameCooldown = {
  openedAt: string;
  completedAt: string;
  unlockAt: string;
};

type StoredGameCooldowns = Partial<Record<GameId, StoredGameCooldown>>;

const GAME_STATS_STORAGE_KEY = 'tamil_ai_game_stats';
const GAME_COOLDOWNS_STORAGE_KEY = 'tamil_ai_game_cooldowns';
const QUIZ_ROTATION_STORAGE_KEY = 'tamil_ai_quiz_rotation';
const QUIZ_QUESTIONS_PER_HOUR = 4;
const GAME_COOLDOWN_MS = 60 * 60 * 1000;

const games: Game[] = [
  {
    id: 'quiz',
    title: 'Tamil Quiz',
    subtitle: 'Vocabulary and meaning',
    description: 'Answer quick multiple-choice questions and strengthen everyday Tamil words.',
    icon: Brain,
    accent: 'bg-vermillion-500',
    level: 'Beginner',
    duration: '5 min',
    points: 40,
    status: 'Available',
  },
  {
    id: 'word-search',
    title: 'Word Search',
    subtitle: 'Find hidden Tamil words',
    description: 'Scan the board, select the target words, and build better spelling memory.',
    icon: Puzzle,
    accent: 'bg-teal-500',
    level: 'Beginner',
    duration: '7 min',
    points: 55,
    status: 'Available',
  },
  {
    id: 'typing-sprint',
    title: 'Typing Sprint',
    subtitle: 'Speed and accuracy',
    description: 'Type the English meaning for Tamil prompts and check your accuracy.',
    icon: Keyboard,
    accent: 'bg-marigold-500',
    level: 'Intermediate',
    duration: '6 min',
    points: 60,
    status: 'Available',
  },
  {
    id: 'sentence-builder',
    title: 'Sentence Builder',
    subtitle: 'Grammar practice',
    description: 'Arrange words into natural Tamil sentences and learn structure by doing.',
    icon: BadgeCheck,
    accent: 'bg-teal-500',
    level: 'Intermediate',
    duration: '8 min',
    points: 70,
    status: 'Coming Soon',
  },
  {
    id: 'listening-match',
    title: 'Listening Match',
    subtitle: 'Audio comprehension',
    description: 'Listen carefully and choose the correct word, phrase, or English meaning.',
    icon: Headphones,
    accent: 'bg-vermillion-500',
    level: 'All levels',
    duration: '5 min',
    points: 45,
    status: 'Coming Soon',
  },
  {
    id: 'pronunciation-lab',
    title: 'Pronunciation Lab',
    subtitle: 'Speak and improve',
    description: 'Practice Tamil sounds and prepare for instant speaking feedback activities.',
    icon: Mic,
    accent: 'bg-vermillion-500',
    level: 'Advanced',
    duration: '10 min',
    points: 80,
    status: 'Coming Soon',
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 'vanakkam-meaning',
    question: 'What does "Vanakkam" mean?',
    options: ['Thank you', 'Hello', 'Water', 'Good night'],
    answer: 1,
    explanation: 'Vanakkam is a respectful Tamil greeting.',
  },
  {
    id: 'nandri-word',
    question: 'Which word means "Thank you"?',
    options: ['Nandri', 'Paal', 'Veedu', 'Poo'],
    answer: 0,
    explanation: 'Nandri means thank you.',
  },
  {
    id: 'water-word',
    question: 'What is the Tamil word for water?',
    options: ['Veedu', 'Neer', 'Maram', 'Nila'],
    answer: 1,
    explanation: 'Neer means water.',
  },
  {
    id: 'amma-meaning',
    question: 'What does "Amma" mean?',
    options: ['Father', 'Mother', 'Friend', 'Teacher'],
    answer: 1,
    explanation: 'Amma means mother.',
  },
  {
    id: 'veedu-meaning',
    question: 'What does "Veedu" mean?',
    options: ['House', 'Book', 'Rain', 'Milk'],
    answer: 0,
    explanation: 'Veedu means house or home.',
  },
  {
    id: 'poo-meaning',
    question: 'What does "Poo" mean?',
    options: ['Tree', 'Flower', 'Day', 'Stone'],
    answer: 1,
    explanation: 'Poo means flower.',
  },
  {
    id: 'maram-meaning',
    question: 'What does "Maram" mean?',
    options: ['Tree', 'Moon', 'Water', 'Mother'],
    answer: 0,
    explanation: 'Maram means tree.',
  },
  {
    id: 'nila-meaning',
    question: 'What does "Nila" mean?',
    options: ['Rain', 'Moon', 'House', 'Hello'],
    answer: 1,
    explanation: 'Nila means moon.',
  },
  {
    id: 'paal-meaning',
    question: 'What does "Paal" mean?',
    options: ['Milk', 'Stone', 'Flower', 'Thanks'],
    answer: 0,
    explanation: 'Paal means milk.',
  },
  {
    id: 'mazhai-meaning',
    question: 'What does "Mazhai" mean?',
    options: ['Day', 'Rain', 'Tree', 'Book'],
    answer: 1,
    explanation: 'Mazhai means rain.',
  },
  {
    id: 'kal-meaning',
    question: 'What does "Kal" mean?',
    options: ['Stone', 'Water', 'Home', 'Moon'],
    answer: 0,
    explanation: 'Kal means stone.',
  },
  {
    id: 'naal-meaning',
    question: 'What does "Naal" mean?',
    options: ['Milk', 'Day', 'Flower', 'Rain'],
    answer: 1,
    explanation: 'Naal means day.',
  },
];

const wordTiles: WordTile[] = [
  { tamil: 'வணக்கம்', meaning: 'Hello', target: true },
  { tamil: 'நன்றி', meaning: 'Thanks', target: true },
  { tamil: 'நீர்', meaning: 'Water', target: true },
  { tamil: 'அம்மா', meaning: 'Mother', target: true },
  { tamil: 'வீடு', meaning: 'House', target: true },
  { tamil: 'பூ', meaning: 'Flower', target: false },
  { tamil: 'மரம்', meaning: 'Tree', target: false },
  { tamil: 'நிலா', meaning: 'Moon', target: false },
  { tamil: 'பால்', meaning: 'Milk', target: false },
  { tamil: 'கல்', meaning: 'Stone', target: false },
  { tamil: 'நாள்', meaning: 'Day', target: false },
  { tamil: 'மழை', meaning: 'Rain', target: false },
];

const typingPrompts: TypingPrompt[] = [
  { tamil: 'வணக்கம்', answer: 'hello', hint: 'A greeting' },
  { tamil: 'நன்றி', answer: 'thank you', hint: 'Used for gratitude' },
  { tamil: 'நீர்', answer: 'water', hint: 'You drink it' },
  { tamil: 'வீடு', answer: 'house', hint: 'A place to live' },
  { tamil: 'அம்மா', answer: 'mother', hint: 'Parent' },
];

const weeklyStats = [
  { label: 'Playable games', value: '3', icon: Gamepad2 },
  { label: 'Points ready', value: '155', icon: Trophy },
  { label: 'Avg. session', value: '6m', icon: Clock3 },
];

const normalizeAnswer = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const getCurrentHourKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
};

const getGameStatsFromStorage = (): StoredGameStats => {
  try {
    const data = localStorage.getItem(GAME_STATS_STORAGE_KEY);
    return data ? JSON.parse(data) : { streak: 0, gamesCompleted: 0, lastCompletedAt: null };
  } catch {
    return { streak: 0, gamesCompleted: 0, lastCompletedAt: null };
  }
};

const saveGameStatsToStorage = (stats: StoredGameStats) => {
  localStorage.setItem(GAME_STATS_STORAGE_KEY, JSON.stringify(stats));
};

const getGameCooldownsFromStorage = (): StoredGameCooldowns => {
  try {
    const data = localStorage.getItem(GAME_COOLDOWNS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveGameCooldownsToStorage = (cooldowns: StoredGameCooldowns) => {
  localStorage.setItem(GAME_COOLDOWNS_STORAGE_KEY, JSON.stringify(cooldowns));
};

const pruneExpiredCooldowns = (cooldowns: StoredGameCooldowns) => {
  const now = Date.now();
  const activeCooldowns: StoredGameCooldowns = {};

  Object.entries(cooldowns).forEach(([gameId, cooldown]) => {
    if (cooldown && new Date(cooldown.unlockAt).getTime() > now) {
      activeCooldowns[gameId as GameId] = cooldown;
    }
  });

  return activeCooldowns;
};

const formatRemainingTime = (unlockAt: string) => {
  const remainingMs = Math.max(0, new Date(unlockAt).getTime() - Date.now());
  const minutes = Math.ceil(remainingMs / (60 * 1000));

  if (minutes >= 60) {
    return '1h';
  }

  return `${minutes}m`;
};

const getQuizRotationFromStorage = (): StoredQuizRotation | null => {
  try {
    const data = localStorage.getItem(QUIZ_ROTATION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveQuizRotationToStorage = (rotation: StoredQuizRotation) => {
  localStorage.setItem(QUIZ_ROTATION_STORAGE_KEY, JSON.stringify(rotation));
};

const getHourlyQuizQuestions = () => {
  const hourKey = getCurrentHourKey();
  const questionIds = quizQuestions.map((question) => question.id);
  const storedRotation = getQuizRotationFromStorage();

  if (storedRotation?.hourKey === hourKey) {
    const storedQuestions = storedRotation.questionIds
      .map((id) => quizQuestions.find((question) => question.id === id))
      .filter((question): question is QuizQuestion => Boolean(question));

    if (storedQuestions.length === QUIZ_QUESTIONS_PER_HOUR) {
      return storedQuestions;
    }
  }

  const usedQuestionIds = storedRotation?.usedQuestionIds.filter((id) => questionIds.includes(id)) || [];
  const availableQuestionIds = questionIds.filter((id) => !usedQuestionIds.includes(id));
  const pool = availableQuestionIds.length >= QUIZ_QUESTIONS_PER_HOUR ? availableQuestionIds : questionIds;
  const seed = hourKey.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const rotatedPool = [...pool].sort((first, second) => {
    const firstScore = (first.charCodeAt(0) + seed + first.length) % 97;
    const secondScore = (second.charCodeAt(0) + seed + second.length) % 97;
    return firstScore - secondScore;
  });
  const nextQuestionIds = rotatedPool.slice(0, QUIZ_QUESTIONS_PER_HOUR);
  const nextUsedIds = pool === questionIds ? nextQuestionIds : [...usedQuestionIds, ...nextQuestionIds];

  saveQuizRotationToStorage({
    hourKey,
    questionIds: nextQuestionIds,
    usedQuestionIds: nextUsedIds,
  });

  return nextQuestionIds
    .map((id) => quizQuestions.find((question) => question.id === id))
    .filter((question): question is QuizQuestion => Boolean(question));
};

const Games: React.FC = () => {
  const { addPoints } = useUser();
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [activeGameOpenedAt, setActiveGameOpenedAt] = useState<string | null>(null);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [gameStats, setGameStats] = useState<StoredGameStats>(() => getGameStatsFromStorage());
  const [gameCooldowns, setGameCooldowns] = useState<StoredGameCooldowns>(() => pruneExpiredCooldowns(getGameCooldownsFromStorage()));
  const [, setCooldownTick] = useState(0);

  useEffect(() => {
    saveGameCooldownsToStorage(gameCooldowns);
  }, [gameCooldowns]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCooldownTick((current) => current + 1);
      setGameCooldowns((current) => pruneExpiredCooldowns(current));
    }, 30 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const startGame = (gameId: GameId) => {
    const game = games.find((item) => item.id === gameId);
    const cooldown = gameCooldowns[gameId];

    if (game?.status === 'Available' && !cooldown) {
      setActiveGameOpenedAt(new Date().toISOString());
      setActiveGame(gameId);
    }
  };

  const completeGame = (gameId: GameId, points: number) => {
    if (gameCooldowns[gameId]) {
      return;
    }

    const openedAt = activeGameOpenedAt || new Date().toISOString();
    const unlockAt = new Date(new Date(openedAt).getTime() + GAME_COOLDOWN_MS).toISOString();

    setSessionPoints((current) => current + points);
    setGameCooldowns((current) => ({
      ...current,
      [gameId]: {
        openedAt,
        completedAt: new Date().toISOString(),
        unlockAt,
      },
    }));
    setGameStats((current) => {
      const updated = {
        streak: current.streak + 1,
        gamesCompleted: current.gamesCompleted + 1,
        lastCompletedAt: new Date().toISOString(),
      };
      saveGameStatsToStorage(updated);
      return updated;
    });
    addPoints(points);
  };

  const activeGameTitle = games.find((game) => game.id === activeGame)?.title;
  const completedCooldownCount = games.filter((game) => gameCooldowns[game.id]).length;

  if (activeGame) {
    return (
      <div className="min-h-screen bg-cream-200 dark:bg-ink-800">
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveGame(null);
                setActiveGameOpenedAt(null);
              }}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-ink-50 dark:border-ink-500 bg-white px-4 py-2 text-sm font-bold text-ink-600 dark:text-cream-200 shadow-sm transition hover:bg-cream-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to games
            </button>
            <div className="rounded-full border border-marigold-200 bg-marigold-50 px-4 py-2 text-sm font-bold text-marigold-700">
              Session points: {sessionPoints}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-300 dark:text-cream-300/60">Now Playing</p>
            <h1 className="mt-1 text-3xl font-bold text-ink-900">{activeGameTitle}</h1>
          </div>

          {activeGame === 'quiz' && <QuizGame onComplete={(points) => completeGame('quiz', points)} />}
          {activeGame === 'word-search' && <WordSearchGame onComplete={(points) => completeGame('word-search', points)} />}
          {activeGame === 'typing-sprint' && <TypingSprintGame onComplete={(points) => completeGame('typing-sprint', points)} />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-ink-700">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 overflow-hidden rounded-2xl border border-ink-50 dark:border-ink-500 bg-white shadow-sm"
        >
          <div className="grid gap-6 p-6 lg:grid-cols-[1.6fr_1fr] lg:p-8">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-marigold-200 bg-marigold-50 px-3 py-1 text-sm font-semibold text-marigold-700">
                <Sparkles className="h-4 w-4" />
                Practice through play
              </div>
              <h1 className="text-3xl font-bold tracking-normal text-ink-900 sm:text-4xl">
                Tamil Knowledge Games
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-ink-400 dark:text-cream-300/70">
                Three games are live now: quiz, word search, and typing sprint. Complete a game once, then it reopens one hour after you started that round.
              </p>
            </div>

            <div className="rounded-xl2 border border-ink-50 dark:border-ink-500 bg-cream-200 dark:bg-ink-700 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-300 dark:text-cream-300/60">
                    Daily Challenge
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-ink-900">Finish all 3 games</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 text-white">
                  <Puzzle className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm leading-6 text-ink-400 dark:text-cream-300/70">
                Completed games show a recharge timer. Come back when the timer ends to play again.
              </p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink-50 dark:bg-ink-500">
                <div className="h-full w-3/5 rounded-full bg-teal-500" />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm font-medium text-ink-400 dark:text-cream-300/70">
                <span>Completed now</span>
                <span>{completedCooldownCount} of 3</span>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ...weeklyStats,
            { label: 'Game streak', value: gameStats.streak.toString(), icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl2 border border-ink-50 dark:border-ink-500 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-300 dark:text-cream-300/60">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-ink-900">{value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-300 dark:bg-ink-600 text-ink-600 dark:text-cream-200">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink-900">Game Library</h2>
              <p className="mt-1 text-sm text-ink-400 dark:text-cream-300/70">Choose an available game. Completed games reopen after their one-hour recharge.</p>
            </div>
            <span className="w-fit rounded-full border border-ink-50 dark:border-ink-500 bg-white px-3 py-1 text-sm font-semibold text-ink-400 dark:text-cream-300/70">
              3 live games
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game, index) => {
              const cooldown = gameCooldowns[game.id];
              const isCompleted = Boolean(cooldown);
              const isPlayable = game.status === 'Available' && !isCompleted;
              const statusLabel = isCompleted ? 'Completed' : game.status;
              const buttonLabel = isCompleted && cooldown
                ? `Reopens in ${formatRemainingTime(cooldown.unlockAt)}`
                : isPlayable
                  ? 'Play Now'
                  : 'Launch Soon';

              return (
                <motion.article
                  key={game.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className={`group flex min-h-[260px] flex-col rounded-xl border bg-white p-5 shadow-sm transition ${
                    isCompleted
                      ? 'border-marigold-200 ring-2 ring-marigold-100'
                      : 'border-ink-50 dark:border-ink-500 hover:-translate-y-1 hover:border-ink-100 hover:shadow-soft'
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${game.accent}`}>
                      <game.icon className="h-6 w-6" />
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                      isCompleted
                        ? 'border-marigold-200 bg-marigold-50 text-marigold-700'
                        : game.status === 'Available'
                          ? 'border-teal-100 bg-teal-50 text-teal-700'
                          : 'border-ink-50 dark:border-ink-500 bg-cream-200 dark:bg-ink-700 text-ink-400 dark:text-cream-300/70'
                    }`}
                    >
                      {isCompleted ? <Trophy className="h-3.5 w-3.5" /> : game.status === 'Available' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-300 dark:text-cream-300/60">{game.subtitle}</p>
                    <h3 className="mt-1 text-xl font-bold text-ink-900">{game.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink-400 dark:text-cream-300/70">{game.description}</p>
                    {isCompleted && cooldown && (
                      <div className="mt-4 rounded-xl border border-marigold-200 bg-marigold-50 px-3 py-2 text-sm font-bold text-marigold-700">
                        Great run! This game is recharging until {new Date(cooldown.unlockAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-ink-100 pt-4 text-sm">
                    <div>
                      <p className="text-ink-200 dark:text-cream-300/40">Level</p>
                      <p className="mt-1 font-semibold text-ink-600 dark:text-cream-200">{game.level}</p>
                    </div>
                    <div>
                      <p className="text-ink-200 dark:text-cream-300/40">Time</p>
                      <p className="mt-1 font-semibold text-ink-600 dark:text-cream-200">{game.duration}</p>
                    </div>
                    <div>
                      <p className="text-ink-200 dark:text-cream-300/40">Points</p>
                      <p className="mt-1 font-semibold text-ink-600 dark:text-cream-200">{game.points}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isPlayable}
                    onClick={() => startGame(game.id)}
                    className={`mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition ${
                      isPlayable
                        ? 'bg-ink-900 text-white hover:bg-ink-800'
                        : isCompleted
                          ? 'bg-marigold-100 text-marigold-700 disabled:cursor-not-allowed'
                          : 'bg-cream-300 dark:bg-ink-600 text-ink-300 dark:text-cream-300/60 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isPlayable ? <Play className="h-4 w-4" /> : isCompleted ? <Trophy className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {buttonLabel}
                  </button>
                </motion.article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

const QuizGame: React.FC<{ onComplete: (points: number) => void }> = ({ onComplete }) => {
  const [hourKey, setHourKey] = useState(() => getCurrentHourKey());
  const currentQuestions = useMemo(() => getHourlyQuizQuestions(), [hourKey]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = currentQuestions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const latestHourKey = getCurrentHourKey();
      if (latestHourKey !== hourKey) {
        setHourKey(latestHourKey);
        setAnswers({});
        setSubmitted(false);
      }
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, [hourKey]);

  const submit = () => {
    if (!submitted) {
      onComplete(score * 10);
    }
    setSubmitted(true);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <section className="rounded-2xl border border-ink-50 dark:border-ink-500 bg-white p-5 shadow-sm sm:p-6">
      <GameHeader
        title="Quiz Round"
        description="Choose the correct answer. This question set refreshes once every hour without repeating used questions until the bank is complete."
        action={submitted ? null : <ResetButton onClick={reset} />}
      />
      <div className="space-y-5">
        {currentQuestions.map((question, questionIndex) => (
          <div key={question.question} className="rounded-xl2 border border-ink-50 dark:border-ink-500 p-4">
            <p className="font-bold text-ink-900">{questionIndex + 1}. {question.question}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => {
                const selected = answers[questionIndex] === optionIndex;
                const correct = submitted && optionIndex === question.answer;
                const wrong = submitted && selected && optionIndex !== question.answer;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => !submitted && setAnswers({ ...answers, [questionIndex]: optionIndex })}
                    className={`min-h-12 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                      correct
                        ? 'border-teal-400 bg-teal-50 text-teal-700'
                        : wrong
                          ? 'border-vermillion-300 bg-vermillion-50 text-vermillion-700'
                          : selected
                            ? 'border-vermillion-300 bg-vermillion-50 text-vermillion-700'
                            : 'border-ink-50 dark:border-ink-500 bg-cream-200 dark:bg-ink-700 text-ink-600 dark:text-cream-200 hover:bg-cream-300'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-3 text-sm font-medium text-ink-400 dark:text-cream-300/70">{question.explanation}</p>
            )}
          </div>
        ))}
      </div>
      <GameFooter
        disabled={Object.keys(answers).length !== currentQuestions.length || submitted}
        label={submitted ? `Score: ${score}/${currentQuestions.length}` : 'Submit Quiz'}
        onClick={submit}
      />
      {submitted && (
        <ResultBanner
          type="success"
          title="Quiz conquered"
          text="Nice work. This game is marked completed and will reopen one hour after this round started."
        />
      )}
    </section>
  );
};

const WordSearchGame: React.FC<{ onComplete: (points: number) => void }> = ({ onComplete }) => {
  const targetCount = wordTiles.filter((tile) => tile.target).length;
  const [selected, setSelected] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);
  const foundCount = selected.length;

  const shuffledTiles = useMemo(() => wordTiles, []);

  const selectTile = (tile: WordTile) => {
    if (completed || selected.includes(tile.tamil)) {
      return;
    }

    if (!tile.target) {
      setMistakes((current) => current + 1);
      return;
    }

    const nextSelected = [...selected, tile.tamil];
    setSelected(nextSelected);

    if (nextSelected.length === targetCount) {
      setCompleted(true);
      onComplete(Math.max(10, 55 - mistakes * 5));
    }
  };

  const reset = () => {
    setSelected([]);
    setMistakes(0);
    setCompleted(false);
  };

  return (
    <section className="rounded-2xl border border-ink-50 dark:border-ink-500 bg-white p-5 shadow-sm sm:p-6">
      <GameHeader
        title="Word Search Board"
        description="Find these target words: Vanakkam, Nandri, Neer, Amma, and Veedu."
        action={completed ? null : <ResetButton onClick={reset} />}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatusPill label="Found" value={`${foundCount}/${targetCount}`} />
        <StatusPill label="Mistakes" value={mistakes.toString()} />
        <StatusPill label="Reward" value="Up to 55 pts" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shuffledTiles.map((tile) => {
          const isFound = selected.includes(tile.tamil);
          return (
            <button
              key={`${tile.tamil}-${tile.meaning}`}
              type="button"
              onClick={() => selectTile(tile)}
              className={`min-h-24 rounded-xl border p-3 text-center transition ${
                isFound
                  ? 'border-teal-400 bg-teal-50 text-teal-700'
                  : 'border-ink-50 dark:border-ink-500 bg-cream-200 dark:bg-ink-700 text-ink-700 dark:text-cream-100 hover:border-teal-100 hover:bg-teal-50'
              }`}
            >
              <span className="block text-xl font-bold">{tile.tamil}</span>
              <span className="mt-1 block text-xs font-semibold text-ink-300 dark:text-cream-300/60">{tile.meaning}</span>
            </button>
          );
        })}
      </div>
      {completed && (
        <ResultBanner
          type="success"
          title="Board cleared"
          text={`You completed the board with ${mistakes} mistake${mistakes === 1 ? '' : 's'}. This game will reopen one hour after this round started.`}
        />
      )}
    </section>
  );
};

const TypingSprintGame: React.FC<{ onComplete: (points: number) => void }> = ({ onComplete }) => {
  const [promptIndex, setPromptIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | ''>('');
  const [completed, setCompleted] = useState(false);
  const prompt = typingPrompts[promptIndex];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completed) {
      return;
    }

    const isCorrect = normalizeAnswer(input) === prompt.answer;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setCorrect(nextCorrect);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    window.setTimeout(() => {
      if (promptIndex === typingPrompts.length - 1) {
        setCompleted(true);
        onComplete(nextCorrect * 12);
      } else {
        setPromptIndex((current) => current + 1);
        setInput('');
        setFeedback('');
      }
    }, 550);
  };

  const reset = () => {
    setPromptIndex(0);
    setInput('');
    setCorrect(0);
    setFeedback('');
    setCompleted(false);
  };

  return (
    <section className="rounded-2xl border border-ink-50 dark:border-ink-500 bg-white p-5 shadow-sm sm:p-6">
      <GameHeader
        title="Typing Sprint"
        description="Type the English meaning for each Tamil word. Spelling and spacing matter."
        action={completed ? null : <ResetButton onClick={reset} />}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatusPill label="Prompt" value={`${Math.min(promptIndex + 1, typingPrompts.length)}/${typingPrompts.length}`} />
        <StatusPill label="Correct" value={correct.toString()} />
        <StatusPill label="Reward" value="12 pts each" />
      </div>

      {completed ? (
        <ResultBanner
          type="success"
          title="Typing sprint crushed"
          text={`You typed ${correct} out of ${typingPrompts.length} meanings correctly. This game will reopen one hour after this round started.`}
        />
      ) : (
        <form onSubmit={submit} className="rounded-xl2 border border-ink-50 dark:border-ink-500 bg-cream-200 dark:bg-ink-700 p-5">
          <div className="mb-5 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-300 dark:text-cream-300/60">Tamil word</p>
            <p className="mt-2 text-5xl font-bold text-ink-900">{prompt.tamil}</p>
            <p className="mt-3 text-sm font-medium text-ink-300 dark:text-cream-300/60">Hint: {prompt.hint}</p>
          </div>
          <label className="block text-sm font-bold text-ink-600 dark:text-cream-200" htmlFor="typing-answer">
            English meaning
          </label>
          <input
            id="typing-answer"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-ink-100 dark:border-ink-400 bg-white px-4 text-base font-semibold text-ink-900 outline-none transition focus:border-marigold-400 focus:ring-2 focus:ring-marigold-100"
            placeholder="Type your answer"
            autoComplete="off"
          />
          {feedback && (
            <div className={`mt-3 flex items-center gap-2 text-sm font-bold ${
              feedback === 'correct' ? 'text-teal-700' : 'text-vermillion-700'
            }`}
            >
              {feedback === 'correct' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {feedback === 'correct' ? 'Correct' : `Answer: ${prompt.answer}`}
            </div>
          )}
          <button
            type="submit"
            disabled={!input.trim()}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-ink-900 px-4 text-sm font-bold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-300"
          >
            Check Answer
          </button>
        </form>
      )}
    </section>
  );
};

const GameHeader: React.FC<{ title: string; description: string; action: React.ReactNode }> = ({ title, description, action }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold text-ink-900">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-ink-400 dark:text-cream-300/70">{description}</p>
    </div>
    {action}
  </div>
);

const ResetButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex w-fit items-center gap-2 rounded-xl border border-ink-50 dark:border-ink-500 bg-white px-4 py-2 text-sm font-bold text-ink-600 dark:text-cream-200 shadow-sm transition hover:bg-cream-300"
  >
    <RotateCcw className="h-4 w-4" />
    Reset
  </button>
);

const StatusPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl2 border border-ink-50 dark:border-ink-500 bg-cream-200 dark:bg-ink-700 p-4">
    <p className="text-sm font-medium text-ink-300 dark:text-cream-300/60">{label}</p>
    <p className="mt-1 text-xl font-bold text-ink-900">{value}</p>
  </div>
);

const GameFooter: React.FC<{ disabled: boolean; label: string; onClick: () => void }> = ({ disabled, label, onClick }) => (
  <div className="mt-6 flex justify-end">
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-ink-900 px-5 text-sm font-bold text-white transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-300"
    >
      {label}
    </button>
  </div>
);

const ResultBanner: React.FC<{ type: 'success'; title: string; text: string }> = ({ title, text }) => (
  <div className="mt-6 rounded-xl2 border border-teal-100 bg-teal-50 p-4 text-teal-700">
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm font-medium">{text}</p>
      </div>
    </div>
  </div>
);

export default Games;
