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
  Users,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { user } = useUser();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Advanced AI adapts to your learning style and pace',
      path: '/chat',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'Interactive Chat',
      description: 'Practice conversations with our Tamil chatbot',
      path: '/chat',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: BookOpen,
      title: 'Structured Lessons',
      description: 'Learn Tamil through carefully crafted lessons',
      path: '/lessons',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Mic,
      title: 'Speech Recognition',
      description: 'Perfect your pronunciation with AI feedback',
      path: '/speech',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'Listen to proper Tamil pronunciation',
      path: '/audio',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Calendar,
      title: 'Daily Practice',
      description: 'New phrases and exercises every day',
      path: '/daily',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const stats = [
    { label: 'Learning Streak', value: user?.streak || 0, icon: TrendingUp },
    { label: 'Total Points', value: user?.totalPoints || 0, icon: Target },
    { label: 'Achievements', value: user?.achievements.length || 0, icon: Target },
    { label: 'Lessons Completed', value: 12, icon: BookOpen }
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 drop-shadow-lg">
            Welcome to Your Tamil Learning Journey
          </h2>
          <p className="text-xl text-gray-700 mb-8 font-medium">
            Master the beautiful Tamil language with AI-powered tools and personalized learning
          </p>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon }, idx) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-6 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow border"
              >
                <Icon className="mb-2 text-gray-600" size={28} />
                <p className="text-2xl font-extrabold text-gray-800">{value}</p>
                <p className="text-sm font-semibold text-gray-600">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link to={feature.path}>
                <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-md hover:shadow-lg transition-shadow border">
                  <feature.icon size={40} className="mb-4 text-gray-600" />
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">{feature.title}</h2>
                  <p className="text-gray-600 text-center mb-2 font-medium">{feature.description}</p>
                  <span className="inline-block mt-2 px-5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-400 to-pink-400 text-white shadow">Go</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Today's Progress */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="text-blue-500 mr-2" />
            Today's Progress
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Daily Goal</h4>
              <div className="flex items-center justify-between">
                <span className="text-blue-600">8 / {user?.dailyGoal || 15} minutes</span>
                <div className="w-20 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${((8 / (user?.dailyGoal || 15)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Words Learned</h4>
              <div className="flex items-center justify-between">
                <span className="text-green-600">12 new words</span>
                <BookOpen className="text-green-500" size={20} />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Accuracy</h4>
              <div className="flex items-center justify-between">
                <span className="text-purple-600">92% correct</span>
                <Target className="text-purple-500" size={20} />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Cultural Insight */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg p-6 text-white"
        >
          <h3 className="text-2xl font-bold mb-4 flex items-center">
            <Globe className="mr-2" />
            Cultural Insight of the Day
          </h3>
          <p className="text-lg leading-relaxed">
            "வணக்கம் (Vanakkam)" is more than just a greeting - it's a gesture of respect that 
            acknowledges the divine in every person. When you say Vanakkam, you're not just saying 
            hello, you're expressing reverence and humility.
          </p>
        </motion.section>
      </motion.section>
    </div>
  );
};

export default Home;