import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  User as UserIcon, 
  Award, 
  TrendingUp, 
  Calendar, 
  Target, 
  BookOpen,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type StoredDailyTask = {
  id: string;
  type: 'scenario' | 'phrases' | 'roleplay' | 'quiz';
  title: string;
  points: number;
  completed: boolean;
  completedAt?: string;
  content?: {
    phrases?: unknown[];
  };
};

type StoredLessonProgress = Record<string, {
  completed: boolean;
  unlocked: boolean;
  completedAt?: string;
}>;

type StoredGameCooldown = {
  completedAt: string;
};

type ProfileActivity = {
  action: string;
  time: string;
  points: number;
  completedAt: string;
};

const DAILY_TASK_COUNT = 6;
const WORDS_PER_LESSON = 10;
const LESSON_POINTS = 105;
const GAME_COOLDOWNS_STORAGE_KEY = 'tamil_ai_game_cooldowns';
const GAME_STATS_STORAGE_KEY = 'tamil_ai_game_stats';

const lessonProgressStorageKey = (email?: string) =>
  `lessonProgress_${email || 'guest'}`;

const dailyTaskStoragePrefix = (email?: string) =>
  `dailyTasks_${email || 'guest'}_`;

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const toDateKey = (isoDate: string) => new Date(isoDate).toISOString().slice(0, 10);

const getStoredLessonProgress = (email?: string): StoredLessonProgress =>
  safeParse(localStorage.getItem(lessonProgressStorageKey(email)), {});

const getAllStoredDailyTasks = (email?: string) => {
  const prefix = dailyTaskStoragePrefix(email);
  const tasks: Array<StoredDailyTask & { dateKey: string }> = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key?.startsWith(prefix)) continue;

    const dateKey = key.replace(prefix, '');
    const storedTasks = safeParse<StoredDailyTask[]>(localStorage.getItem(key), []);
    storedTasks.forEach((task) => tasks.push({ ...task, dateKey }));
  }

  return tasks;
};

const getTodaysDailyTasks = (email?: string) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  return safeParse<StoredDailyTask[]>(
    localStorage.getItem(`${dailyTaskStoragePrefix(email)}${todayKey}`),
    []
  );
};

const getCompletedGameActivities = (): ProfileActivity[] => {
  const cooldowns = safeParse<Record<string, StoredGameCooldown>>(
    localStorage.getItem(GAME_COOLDOWNS_STORAGE_KEY),
    {}
  );
  const gameStats = safeParse<{ gamesCompleted?: number; lastCompletedAt?: string | null }>(
    localStorage.getItem(GAME_STATS_STORAGE_KEY),
    {}
  );

  const activities = Object.entries(cooldowns)
    .filter(([, cooldown]) => Boolean(cooldown?.completedAt))
    .map(([gameId, cooldown]) => ({
      action: `Completed ${gameId.replace(/-/g, ' ')} game`,
      time: formatRelativeTime(cooldown.completedAt),
      points: 0,
      completedAt: cooldown.completedAt
    }));

  if (gameStats.lastCompletedAt && !activities.some((activity) => activity.completedAt === gameStats.lastCompletedAt)) {
    activities.push({
      action: `Completed ${gameStats.gamesCompleted || 1} game${gameStats.gamesCompleted === 1 ? '' : 's'}`,
      time: formatRelativeTime(gameStats.lastCompletedAt),
      points: 0,
      completedAt: gameStats.lastCompletedAt
    });
  }

  return activities;
};

const Profile: React.FC = () => {
  const { user, sessions, updateUser, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    dailyGoal: user?.dailyGoal || 15,
    level: user?.level || 'beginner',
    photo: user?.photo || ''
  });
  const [photoPreview, setPhotoPreview] = useState<string>(user?.photo || '');

  useEffect(() => {
    if (!user) return;

    setEditForm({
      name: user.name,
      dailyGoal: user.dailyGoal,
      level: user.level,
      photo: user.photo || ''
    });
    setPhotoPreview(user.photo || '');
  }, [user]);

  const handleSave = () => {
    if (user) {
      updateUser({
        ...user,
        name: editForm.name,
        dailyGoal: editForm.dailyGoal,
        level: editForm.level as 'beginner' | 'intermediate' | 'advanced',
        photo: photoPreview
      });
    }
    setIsEditing(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const profileProgress = useMemo(() => {
    if (!user) {
      return {
        completedLessons: 0,
        lessonPoints: 0,
        wordsLearned: 0,
        daysLearning: 0,
        todayCompletedTasks: 0,
        todayTotalTasks: DAILY_TASK_COUNT,
        todayPoints: 0,
        todayEstimatedMinutes: 0,
        recentActivity: [] as ProfileActivity[]
      };
    }

    const lessonProgress = getStoredLessonProgress(user.email);
    const completedLessons = Object.entries(lessonProgress)
      .filter(([, lesson]) => lesson.completed);
    const allDailyTasks = getAllStoredDailyTasks(user.email);
    const completedDailyTasks = allDailyTasks.filter((task) => task.completed);
    const todaysDailyTasks = getTodaysDailyTasks(user.email);
    const todaysCompletedTasks = todaysDailyTasks.filter((task) => task.completed);
    const completedPhraseTasks = completedDailyTasks.filter((task) => task.type === 'phrases');
    const learnedPhraseCount = completedPhraseTasks.reduce((total, task) => {
      const phraseCount = Array.isArray(task.content?.phrases) ? task.content.phrases.length : 0;
      return total + phraseCount;
    }, 0);
    const lessonActivities = completedLessons
      .filter(([, lesson]) => Boolean(lesson.completedAt))
      .map(([lessonId, lesson]) => ({
        action: `Completed ${lessonId.replace('-', ' ')}`,
        time: formatRelativeTime(lesson.completedAt || ''),
        points: LESSON_POINTS,
        completedAt: lesson.completedAt || ''
      }));
    const dailyActivities = completedDailyTasks
      .filter((task) => Boolean(task.completedAt))
      .map((task) => ({
        action: `Completed ${task.title}`,
        time: formatRelativeTime(task.completedAt || ''),
        points: task.points,
        completedAt: task.completedAt || ''
      }));
    const sessionActivities = sessions
      .filter((session) => session.userId === user.id)
      .map((session) => {
        const completedAt = new Date(session.completedAt).toISOString();

        return {
          action: `Completed ${session.type} session`,
          time: formatRelativeTime(completedAt),
          points: session.score,
          completedAt
        };
      });
    const recentActivity = [
      ...lessonActivities,
      ...dailyActivities,
      ...sessionActivities,
      ...getCompletedGameActivities()
    ]
      .filter((activity) => activity.completedAt)
      .sort((first, second) => new Date(second.completedAt).getTime() - new Date(first.completedAt).getTime())
      .slice(0, 6);
    const activeDates = new Set<string>();

    completedLessons.forEach(([, lesson]) => {
      if (lesson.completedAt) activeDates.add(toDateKey(lesson.completedAt));
    });
    completedDailyTasks.forEach((task) => {
      activeDates.add(task.completedAt ? toDateKey(task.completedAt) : task.dateKey);
    });
    recentActivity.forEach((activity) => activeDates.add(toDateKey(activity.completedAt)));

    return {
      completedLessons: completedLessons.length,
      lessonPoints: completedLessons.length * LESSON_POINTS,
      wordsLearned: completedLessons.length * WORDS_PER_LESSON + learnedPhraseCount,
      daysLearning: activeDates.size,
      todayCompletedTasks: todaysCompletedTasks.length,
      todayTotalTasks: todaysDailyTasks.length || DAILY_TASK_COUNT,
      todayPoints: todaysCompletedTasks.reduce((total, task) => total + task.points, 0),
      todayEstimatedMinutes: todaysCompletedTasks.length * 5,
      recentActivity
    };
  }, [sessions, user?.email, user?.id, user?.totalPoints, user?.achievements.length]);

  if (!user) return null;

  // Camera capture handler using getUserMedia
  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Create a modal for camera preview and capture
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.7)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';

      const container = document.createElement('div');
      container.style.background = '#fff';
      container.style.padding = '16px';
      container.style.borderRadius = '12px';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';

      video.style.width = '320px';
      video.style.height = '240px';
      video.style.borderRadius = '8px';
      container.appendChild(video);

      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture';
      captureBtn.style.margin = '16px 0 0 0';
      captureBtn.style.padding = '8px 24px';
      captureBtn.style.background = '#2563eb';
      captureBtn.style.color = '#fff';
      captureBtn.style.border = 'none';
      captureBtn.style.borderRadius = '6px';
      captureBtn.style.fontSize = '16px';
      captureBtn.style.cursor = 'pointer';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.margin = '16px 0 0 12px';
      cancelBtn.style.padding = '8px 24px';
      cancelBtn.style.background = '#aaa';
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '6px';
      cancelBtn.style.fontSize = '16px';
      cancelBtn.style.cursor = 'pointer';

      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex';
      btnRow.appendChild(captureBtn);
      btnRow.appendChild(cancelBtn);
      container.appendChild(btnRow);

      modal.appendChild(container);
      document.body.appendChild(modal);

      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          setPhotoPreview(dataUrl);
        }
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };

      cancelBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
    } catch (err) {
      alert('Camera not supported or permission denied.');
    }
  };

  const achievements = user.achievements.map((achievement) => ({
    id: achievement.toLowerCase().replace(/\s+/g, '-'),
    name: achievement,
    description: 'Earned from completed learning activity',
    earned: true
  }));

  const stats = [
    { label: 'Current Streak', value: user.streak, icon: TrendingUp, color: 'text-marigold-600' },
    { label: 'Total Points', value: user.totalPoints, icon: Target, color: 'text-vermillion-600' },
    { label: 'Achievements', value: user.achievements.length, icon: Award, color: 'text-marigold-600' },
    { label: 'Days Learning', value: profileProgress.daysLearning, icon: Calendar, color: 'text-teal-600' },
    { label: 'Lessons Completed', value: profileProgress.completedLessons, icon: BookOpen, color: 'text-vermillion-600' },
    { label: 'Words Learned', value: profileProgress.wordsLearned, icon: BookOpen, color: 'text-vermillion-600' }
  ];

  const learningPathProgress = [
    { topic: 'Daily Tasks', progress: profileProgress.todayCompletedTasks, total: profileProgress.todayTotalTasks },
    { topic: 'Daily Goal', progress: Math.min(profileProgress.todayEstimatedMinutes, user.dailyGoal), total: user.dailyGoal },
    { topic: 'Daily Points', progress: profileProgress.todayPoints, total: 105 },
    { topic: 'Lessons', progress: profileProgress.completedLessons, total: Math.max(profileProgress.completedLessons, 5) },
    { topic: 'Achievement Progress', progress: user.achievements.length, total: Math.max(user.achievements.length, 6) }
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-vermillion-100 via-marigold-50 to-teal-50 dark:from-ink-800 dark:via-ink-800 dark:to-ink-800 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-ink-600 rounded-xl2 shadow-card p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-vermillion-500 to-marigold-600 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-transparent hover:ring-vermillion-100 focus:outline-none focus:ring-vermillion-200 transition-all">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-20 h-20 object-cover rounded-full" />
                ) : (
                  <UserIcon className="text-white" size={32} />
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold text-ink-700 dark:text-cream-100 border-b border-ink-100 dark:border-ink-400 focus:outline-none focus:border-vermillion-500"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-ink-700 dark:text-cream-100">{user.name}</h1>
                )}
                <p className="text-ink-400 dark:text-cream-300/70 capitalize">{user.level} Learner</p>
                <p className="text-sm text-ink-300 dark:text-cream-300/60">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                      Profile Photo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full border border-ink-100 dark:border-ink-400 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vermillion-500"
                        style={{ maxWidth: 180 }}
                      />
                      <button
                        type="button"
                        onClick={handleTakePhoto}
                        className="px-4 py-2 bg-vermillion-500 text-white rounded-xl hover:bg-vermillion-600 transition-colors"
                      >
                        Take Photo
                      </button>
                    </div>
                    <p className="text-xs text-ink-300 dark:text-cream-300/60 mt-1">Choose from gallery or use your camera</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                      Daily Goal (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={editForm.dailyGoal}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) }))}
                      className="w-full border border-ink-100 dark:border-ink-400 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vermillion-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                      Learning Level
                    </label>
                    <select
                      value={editForm.level}
                      onChange={(e) => setEditForm(prev => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                      className="w-full border border-ink-100 dark:border-ink-400 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vermillion-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-cream-300 dark:bg-ink-600 rounded-xl2 p-6 text-center border hover:scale-105 transition-transform"
            >
              <stat.icon className="mx-auto mb-2 drop-shadow-lg" size={24} />
              <p className="text-2xl font-extrabold text-ink-700 dark:text-cream-100">{stat.value}</p>
              <p className="text-sm text-ink-600 dark:text-cream-200 font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-ink-600 rounded-xl2 shadow-card p-6"
          >
            <h2 className="text-2xl font-bold text-ink-700 dark:text-cream-100 mb-4 flex items-center">
              <Award className="text-marigold-500 mr-2" />
              Achievements
            </h2>
            
            {achievements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink-100 dark:border-ink-400 bg-cream-200 dark:bg-ink-700 p-6 text-center text-ink-400 dark:text-cream-300/70">
                Complete lessons, daily tasks, or streak goals to earn achievements.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-lg border-2 transition-all 
                    ${achievement.earned 
                      ? 'bg-gradient-to-br from-vermillion-200 via-marigold-100 to-teal-100 border-teal-400' 
                      : 'bg-gradient-to-br from-ink-100 via-ink-200 to-ink-300 border-ink-100 dark:border-ink-400 opacity-60'}
                  `}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-marigold-400' : 'bg-ink-300'
                    }`}>
                      <Award className="text-white" size={16} />
                    </div>
                    <h3 className={`font-semibold ${
                      achievement.earned ? 'text-marigold-700' : 'text-ink-400 dark:text-cream-300/70'
                    }`}>
                      {achievement.name}
                    </h3>
                  </div>
                  <p className={`text-xs ${
                    achievement.earned ? 'text-marigold-700' : 'text-ink-300 dark:text-cream-300/60'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.earned && <span className="text-teal-600 font-semibold text-xs">Earned</span>}
                </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Learning Path */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-cream-300 dark:bg-ink-600 rounded-xl2 p-6 border"
          >
            <h2 className="text-2xl font-bold text-ink-700 dark:text-cream-100 mb-4 flex items-center">
              <TrendingUp className="text-vermillion-500 mr-2" />
              Learning Progress
            </h2>
            
            <div className="space-y-4">
              {learningPathProgress.map((topic) => (
                <div key={topic.topic} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-ink-700 dark:text-cream-100">{topic.topic}</h3>
                    <span className="text-sm text-ink-400 dark:text-cream-300/70">
                      {Math.floor((topic.progress / Math.max(topic.total, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-ink-50 dark:bg-ink-500 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((topic.progress / Math.max(topic.total, 1)) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        topic.progress === topic.total 
                          ? 'bg-teal-500' 
                          : topic.progress > 0 
                            ? 'bg-vermillion-500' 
                            : 'bg-ink-300'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white rounded-xl2 shadow-card p-6"
        >
          <h2 className="text-2xl font-bold text-ink-700 dark:text-cream-100 mb-4 flex items-center">
            <Calendar className="text-teal-500 mr-2" />
            Recent Activity
          </h2>
          
          <div className="space-y-3">
            {profileProgress.recentActivity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink-100 dark:border-ink-400 bg-cream-200 dark:bg-ink-700 p-6 text-center text-ink-400 dark:text-cream-300/70">
                No completed learning activity yet. Finished lessons and daily tasks will appear here.
              </div>
            ) : profileProgress.recentActivity.map((activity, index) => (
              <motion.div
                key={`${activity.action}-${activity.completedAt}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-cream-200 dark:bg-ink-700 rounded-xl"
              >
                <div>
                  <p className="font-medium text-ink-700 dark:text-cream-100">{activity.action}</p>
                  <p className="text-sm text-ink-400 dark:text-cream-300/70">{activity.time}</p>
                </div>
                <span className="text-sm font-semibold text-vermillion-600">
                  {activity.points > 0 ? `+${activity.points} pts` : 'Completed'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
