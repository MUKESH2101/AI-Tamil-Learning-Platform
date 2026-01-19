import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  User as UserIcon, 
  Award, 
  TrendingUp, 
  Calendar, 
  Target, 
  BookOpen,
  Settings,
  Edit,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    dailyGoal: user?.dailyGoal || 15,
    level: user?.level || 'beginner',
    photo: user?.photo || ''
  });
  const [photoPreview, setPhotoPreview] = useState<string>(user?.photo || '');

  if (!user) return null;

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

  const achievements = [
    { id: 'first-lesson', name: 'First Steps', description: 'Completed first lesson', earned: user.achievements.includes('First Lesson') },
    { id: 'week-streak', name: 'Week Warrior', description: '7-day learning streak', earned: user.achievements.includes('Week Streak') },
    { id: 'daily-master', name: 'Daily Master', description: 'Completed all daily tasks', earned: user.achievements.includes('Daily Master') },
    { id: 'quiz-champion', name: 'Quiz Champion', description: 'Perfect quiz score', earned: false },
    { id: 'pronunciation-pro', name: 'Pronunciation Pro', description: '90%+ speech accuracy', earned: false },
    { id: 'culture-explorer', name: 'Culture Explorer', description: 'Read 10 cultural insights', earned: false }
  ];

  const stats = [
    { label: 'Current Streak', value: user.streak, icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Total Points', value: user.totalPoints, icon: Target, color: 'text-blue-600' },
    { label: 'Achievements', value: user.achievements.length, icon: Award, color: 'text-yellow-600' },
    { label: 'Days Learning', value: 15, icon: Calendar, color: 'text-green-600' },
    { label: 'Lessons Completed', value: 8, icon: BookOpen, color: 'text-purple-600' },
    { label: 'Words Learned', value: 124, icon: BookOpen, color: 'text-pink-600' }
  ];

  const learningPathProgress = [
    { topic: 'Greetings', progress: 100, total: 10 },
    { topic: 'Numbers', progress: 80, total: 15 },
    { topic: 'Family', progress: 60, total: 12 },
    { topic: 'Food', progress: 30, total: 20 },
    { topic: 'Travel', progress: 0, total: 18 }
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-pink-200 via-yellow-100 to-green-200 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
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
                    className="text-2xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                )}
                <p className="text-gray-600 capitalize">{user.level} Learner</p>
                <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                    <span>Logout</span>
                  </button>
                </>
              )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ maxWidth: 180 }}
                      />
                      <button
                        type="button"
                        onClick={handleTakePhoto}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Take Photo
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Choose from gallery or use your camera</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Goal (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={editForm.dailyGoal}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Level
                    </label>
                    <select
                      value={editForm.level}
                      onChange={(e) => setEditForm(prev => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-gray-100 rounded-xl p-6 text-center border hover:scale-105 transition-transform"
            >
              <stat.icon className="mx-auto mb-2 drop-shadow-lg" size={24} />
              <p className="text-2xl font-extrabold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-700 font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="text-yellow-500 mr-2" />
              Achievements
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement, idx) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.05 }}
                  className={`p-4 rounded-lg border-2 transition-all 
                    ${achievement.earned 
                      ? 'bg-gradient-to-br from-green-200 via-green-100 to-yellow-100 border-green-400' 
                      : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 border-gray-300 opacity-60'}
                  `}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-yellow-400' : 'bg-gray-300'
                    }`}>
                      <Award className="text-white" size={16} />
                    </div>
                    <h3 className={`font-semibold ${
                      achievement.earned ? 'text-yellow-800' : 'text-gray-600'
                    }`}>
                      {achievement.name}
                    </h3>
                  </div>
                  <p className={`text-xs ${
                    achievement.earned ? 'text-yellow-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  {achievement.earned && <span className="text-green-600 font-semibold text-xs">Earned</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Learning Path */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-100 rounded-xl p-6 border"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="text-blue-500 mr-2" />
              Learning Progress
            </h2>
            
            <div className="space-y-4">
              {learningPathProgress.map((topic) => (
                <div key={topic.topic} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{topic.topic}</h3>
                    <span className="text-sm text-gray-600">
                      {Math.floor((topic.progress / topic.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(topic.progress / topic.total) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        topic.progress === topic.total 
                          ? 'bg-green-500' 
                          : topic.progress > 0 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
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
          className="mt-6 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="text-green-500 mr-2" />
            Recent Activity
          </h2>
          
          <div className="space-y-3">
            {[
              { action: 'Completed Daily Phrase', time: '2 hours ago', points: 10 },
              { action: 'Perfect Quiz Score', time: '1 day ago', points: 25 },
              { action: 'Speech Practice Session', time: '2 days ago', points: 15 },
              { action: 'Cultural Insight Read', time: '3 days ago', points: 20 }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  +{activity.points} pts
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