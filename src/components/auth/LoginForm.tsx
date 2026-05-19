import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, Lock, Mail, User, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  voiceGender?: 'male' | 'female';
  level: 'beginner' | 'intermediate' | 'advanced';
  streak: number;
  totalPoints: number;
  achievements: string[];
  learningPath: string[];
  dailyGoal: number;
  createdAt: string;
  photo?: string;
};

type PasswordResetRequest = {
  email: string;
  expiresAt: string;
};

const USERS_STORAGE_KEY = 'tamil_ai_users';
const PASSWORD_RESETS_STORAGE_KEY = 'tamil_ai_password_resets';

const getUsersFromStorage = (): Record<string, StoredUser> => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const getPasswordResetsFromStorage = (): Record<string, PasswordResetRequest> => {
  try {
    const data = localStorage.getItem(PASSWORD_RESETS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const savePasswordResetsToStorage = (requests: Record<string, PasswordResetRequest>) => {
  localStorage.setItem(PASSWORD_RESETS_STORAGE_KEY, JSON.stringify(requests));
};

const createResetToken = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export default function LoginForm() {
  const { updateUser } = useUser();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    voiceGender: 'female' as 'male' | 'female',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setResetLink('');
  };

  const showLogin = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
    clearMessages();
  };

  const showSignup = () => {
    setIsForgotPassword(false);
    setIsLogin(false);
    clearMessages();
  };

  const showForgotPassword = () => {
    setIsForgotPassword(true);
    setIsLogin(true);
    clearMessages();
  };

  const copyResetLink = async () => {
    try {
      await navigator.clipboard.writeText(resetLink);
      setSuccess('Reset link copied. Open it to change the password.');
    } catch {
      setError('Could not copy the link. Please select and copy it manually.');
    }
  };

  const handleForgotPassword = (email: string) => {
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    const users = getUsersFromStorage();
    const existingUser = users[email];

    if (!existingUser) {
      setError('Email not found. Please sign up first.');
      return;
    }

    const token = createResetToken();
    const requests = getPasswordResetsFromStorage();
    requests[token] = {
      email,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    savePasswordResetsToStorage(requests);

    const link = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`;
    setResetLink(link);
    setSuccess('Password reset link created for this email. Open the link to set a new password.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const email = formData.email.trim();
    const password = formData.password.trim();

    if (isForgotPassword) {
      handleForgotPassword(email);
      return;
    }

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    const users = getUsersFromStorage();
    const existingUser = users[email];

    if (isLogin) {
      if (!existingUser) {
        setError('Email not found. Please sign up first.');
        return;
      }

      if (existingUser.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }

      updateUser(existingUser);
      navigate('/');
      return;
    }

    if (existingUser) {
      setError('Email already registered. Please sign in instead.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      email,
      password,
      voiceGender: formData.voiceGender,
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
  };

  const title = isForgotPassword
    ? 'Reset your password'
    : isLogin
      ? 'Welcome back!'
      : 'Start your Tamil journey';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Tamil Learn AI
              </h1>
              <p className="text-gray-600 mt-2">{title}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Please check this</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Request ready</p>
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              )}

              {resetLink && (
                <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-medium text-orange-900">Reset link</p>
                  <a
                    href={resetLink}
                    className="block break-all text-sm text-orange-700 hover:text-orange-800"
                  >
                    {resetLink}
                  </a>
                  <button
                    type="button"
                    onClick={copyResetLink}
                    className="inline-flex items-center space-x-2 text-sm font-medium text-orange-700 hover:text-orange-800"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy link</span>
                  </button>
                </div>
              )}

              {!isLogin && !isForgotPassword && (
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
                      required={!isLogin && !isForgotPassword}
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

              {!isForgotPassword && (
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
                      required={!isForgotPassword}
                    />
                  </div>
                </div>
              )}

              {isLogin && !isForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={showForgotPassword}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice
                  </label>
                  <select
                    value={formData.voiceGender}
                    onChange={(e) => setFormData({ ...formData, voiceGender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="female">Female voice</option>
                    <option value="male">Male voice</option>
                  </select>
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
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
                {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={isLogin && !isForgotPassword ? showSignup : showLogin}
                className="text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center space-x-2 mx-auto"
              >
                <UserPlus className="h-4 w-4" />
                <span>
                  {isLogin && !isForgotPassword ? "Don't have an account? Sign up" : 'Back to sign in'}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600">
            Demo mode - Password reset links are generated locally
          </div>
        </div>
      </div>
    </div>
  );
}
