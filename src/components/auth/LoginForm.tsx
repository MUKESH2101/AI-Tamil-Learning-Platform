import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

// LocalStorage utility
const getUsersFromStorage = (): Record<string, any> => {
  try {
    const data = localStorage.getItem('tamil_ai_users');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export default function LoginForm() {
  const { updateUser } = useUser();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    level: 'beginner' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    const email = formData.email.trim();
    const password = formData.password.trim();

    // Validation
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    const users = getUsersFromStorage();
    const existingUser = users[email];

    if (isLogin) {
      // Login mode
      if (!existingUser) {
        setError('Email not found. Please sign up first.');
        return;
      }

      // Check password
      if (existingUser.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }

      // Login successful - load user data
      updateUser(existingUser);
      navigate('/');
    } else {
      // Signup mode
      if (existingUser) {
        setError('Email already registered. Please sign in instead.');
        return;
      }

      if (!formData.name.trim()) {
        setError('Please enter your name');
        return;
      }

      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        return;
      }

      // Create a new user account
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: email,
        password: password,
        level: formData.level,
        streak: 1,
        totalPoints: 0,
        achievements: [],
        learningPath: ['greetings'],
        dailyGoal: 15,
        createdAt: new Date().toISOString(),
      };
      updateUser(newUser);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Tamil Learn AI
              </h1>
              <p className="text-gray-600 mt-2">
                {isLogin ? 'Welcome back!' : 'Start your Tamil journey'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-medium">Incorrect</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter your name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Toggle Form */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center space-x-2 mx-auto"
              >
                <UserPlus className="h-4 w-4" />
                <span>
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600">
            Demo mode - Use any email and password to continue
          </div>
        </div>
      </div>
    </div>
  );
}
