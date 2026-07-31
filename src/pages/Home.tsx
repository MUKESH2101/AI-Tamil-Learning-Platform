import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  MessageCircle,
  BookOpen,
  Mic,
  Volume2,
  Calendar,
  TrendingUp,
  Target,
  Brain,
  Globe,
  Gamepad2,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityKolam from '../components/ActivityKolam';
import WordOfTheDay from '../components/WordOfTheDay';

const Home: React.FC = () => {
  const { user } = useUser();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Advanced AI adapts to your learning style and pace',
      path: '/chat',
      accent: 'text-vermillion-500 bg-vermillion-50 dark:bg-vermillion-500/10'
    },
    {
      icon: MessageCircle,
      title: 'Interactive Chat',
      description: 'Practice conversations with our Tamil chatbot',
      path: '/chat',
      accent: 'text-teal-600 bg-teal-50 dark:bg-teal-500/10'
    },
    {
      icon: BookOpen,
      title: 'Structured Lessons',
      description: 'Learn Tamil through carefully crafted lessons',
      path: '/lessons',
      accent: 'text-marigold-600 bg-marigold-50 dark:bg-marigold-500/10'
    },
    {
      icon: Mic,
      title: 'Speech Recognition',
      description: 'Perfect your pronunciation with AI feedback',
      path: '/speech',
      accent: 'text-vermillion-500 bg-vermillion-50 dark:bg-vermillion-500/10'
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'Listen to proper Tamil pronunciation',
      path: '/audio',
      accent: 'text-teal-600 bg-teal-50 dark:bg-teal-500/10'
    },
    {
      icon: Gamepad2,
      title: 'Learning Games',
      description: 'Reinforce vocabulary with quick, playful challenges',
      path: '/games',
      accent: 'text-marigold-600 bg-marigold-50 dark:bg-marigold-500/10'
    },
    {
      icon: Calendar,
      title: 'Daily Practice',
      description: 'New phrases and exercises every day',
      path: '/daily',
      accent: 'text-vermillion-500 bg-vermillion-50 dark:bg-vermillion-500/10'
    }
  ];

  const stats = [
    { label: 'Learning Streak', value: user?.streak || 0, icon: TrendingUp, suffix: ' days' },
    { label: 'Total Points', value: user?.totalPoints || 0, icon: Target, suffix: '' },
    { label: 'Achievements', value: user?.achievements.length || 0, icon: Target, suffix: '' },
    { label: 'Daily Goal', value: user?.dailyGoal || 15, icon: BookOpen, suffix: ' min' }
  ];

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-ink-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-700 text-cream-100">
        <div className="absolute inset-0 kolam-field text-marigold-400/[0.06] pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-vermillion-500/10 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative container mx-auto px-4 pt-12 pb-10"
        >
          <p className="section-eyebrow mb-4 text-marigold-300">
            {user ? `Vanakkam, ${user.name.split(' ')[0]}` : 'Vanakkam'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] max-w-3xl mb-5">
            Your Tamil learning journey, guided by AI.
          </h1>
          <p className="text-cream-300/80 text-lg max-w-xl mb-8">
            Master the beautiful Tamil language through conversation, structured lessons,
            pronunciation feedback, and a little daily practice.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/chat" className="btn-accent">
              Start a conversation <ArrowUpRight size={18} />
            </Link>
            <Link to="/lessons" className="btn-ghost !text-cream-100 !border-white/20 hover:!bg-white/10">
              Browse lessons
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
            {stats.map(({ label, value, icon: Icon, suffix }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="rounded-xl2 bg-white/[0.06] border border-white/10 px-4 py-4 backdrop-blur-sm"
              >
                <Icon className="mb-2 text-marigold-300" size={20} />
                <p className="text-2xl font-display font-semibold">{value}{suffix}</p>
                <p className="text-xs font-medium text-cream-300/70">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Word of the day + Activity kolam */}
        <div className="grid lg:grid-cols-5 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <WordOfTheDay />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 card p-6"
          >
            <ActivityKolam days={35} />
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mb-2">
          <p className="section-eyebrow mb-2">Explore the platform</p>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-ink-700 dark:text-cream-100 mb-8">
            Everything you need to learn Tamil
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
            >
              <Link to={feature.path} className="group block h-full">
                <div className="card card-hover h-full p-6 flex flex-col">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.accent}`}>
                    <feature.icon size={22} />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-1.5 text-ink-700 dark:text-cream-100">
                    {feature.title}
                  </h3>
                  <p className="text-ink-400 dark:text-cream-300/70 text-sm flex-1">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-vermillion-600 dark:text-marigold-300 group-hover:gap-2 transition-all">
                    Open <ArrowUpRight size={15} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Today's Progress */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-6 sm:p-8 mb-6"
        >
          <h3 className="text-xl font-display font-semibold text-ink-700 dark:text-cream-100 mb-5 flex items-center gap-2">
            <Calendar className="text-vermillion-500" size={22} />
            Today's Progress
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-marigold-50 dark:bg-ink-600 p-4">
              <h4 className="font-semibold text-marigold-700 dark:text-marigold-300 mb-2 text-sm">Daily Goal</h4>
              <div className="flex items-center justify-between">
                <span className="text-marigold-800 dark:text-marigold-200 text-sm font-medium">
                  8 / {user?.dailyGoal || 15} minutes
                </span>
                <div className="w-20 h-2 bg-marigold-200 dark:bg-ink-500 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-marigold-500 transition-all duration-500"
                    style={{ width: `${((8 / (user?.dailyGoal || 15)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-teal-50 dark:bg-ink-600 p-4">
              <h4 className="font-semibold text-teal-700 dark:text-teal-300 mb-2 text-sm">Words Learned</h4>
              <div className="flex items-center justify-between">
                <span className="text-teal-800 dark:text-teal-200 text-sm font-medium">12 new words</span>
                <BookOpen className="text-teal-500" size={20} />
              </div>
            </div>

            <div className="rounded-xl bg-vermillion-50 dark:bg-ink-600 p-4">
              <h4 className="font-semibold text-vermillion-700 dark:text-vermillion-300 mb-2 text-sm">Accuracy</h4>
              <div className="flex items-center justify-between">
                <span className="text-vermillion-800 dark:text-vermillion-200 text-sm font-medium">92% correct</span>
                <Target className="text-vermillion-500" size={20} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Cultural Insight */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-vermillion-500 to-vermillion-600 text-white p-6 sm:p-8 shadow-card"
        >
          <div className="absolute inset-0 kolam-field text-white/[0.08] pointer-events-none" />
          <h3 className="relative text-xl font-display font-semibold mb-3 flex items-center gap-2">
            <Globe size={22} />
            Cultural Insight of the Day
          </h3>
          <p className="relative text-lg leading-relaxed max-w-2xl">
            "வணக்கம் (Vanakkam)" is more than just a greeting - it's a gesture of respect that
            acknowledges the divine in every person. When you say Vanakkam, you're not just saying
            hello, you're expressing reverence and humility.
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
