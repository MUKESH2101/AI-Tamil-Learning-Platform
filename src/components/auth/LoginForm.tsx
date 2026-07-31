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
    <div className="min-h-screen bg-gradient-to-br from-vermillion-50 via-marigold-50 to-teal-50 dark:from-ink-800 dark:via-ink-800 dark:to-ink-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-ink-600 rounded-2xl shadow-card overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-vermillion-500 to-marigold-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-vermillion-600 to-marigold-600 bg-clip-text text-transparent">
                Tamil Learn AI
              </h1>
              <p className="text-ink-400 dark:text-cream-300/70 mt-2">{title}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-vermillion-50 border border-vermillion-200 text-vermillion-700 px-4 py-3 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Please check this</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-teal-50 border border-teal-100 text-teal-700 px-4 py-3 rounded-xl flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Request ready</p>
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              )}

              {resetLink && (
                <div className="space-y-3 rounded-xl border border-marigold-200 bg-marigold-50 p-4">
                  <p className="text-sm font-medium text-marigold-700">Reset link</p>
                  <a
                    href={resetLink}
                    className="block break-all text-sm text-marigold-700 hover:text-marigold-700"
                  >
                    {resetLink}
                  </a>
                  <button
                    type="button"
                    onClick={copyResetLink}
                    className="inline-flex items-center space-x-2 text-sm font-medium text-marigold-700 hover:text-marigold-700"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy link</span>
                  </button>
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-200 dark:text-cream-300/40" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-ink-100 dark:border-ink-400 rounded-xl focus:ring-2 focus:ring-marigold-500 focus:border-transparent"
                      placeholder="Enter your name"
                      required={!isLogin && !isForgotPassword}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-200 dark:text-cream-300/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-ink-100 dark:border-ink-400 rounded-xl focus:ring-2 focus:ring-marigold-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-200 dark:text-cream-300/40" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-ink-100 dark:border-ink-400 rounded-xl focus:ring-2 focus:ring-marigold-500 focus:border-transparent"
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
                    className="text-sm font-medium text-marigold-600 hover:text-marigold-700"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                    Voice
                  </label>
                  <select
                    value={formData.voiceGender}
                    onChange={(e) => setFormData({ ...formData, voiceGender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-3 border border-ink-100 dark:border-ink-400 rounded-xl focus:ring-2 focus:ring-marigold-500 focus:border-transparent"
                  >
                    <option value="female">Female voice</option>
                    <option value="male">Male voice</option>
                  </select>
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                    Learning Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                    className="w-full px-4 py-3 border border-ink-100 dark:border-ink-400 rounded-xl focus:ring-2 focus:ring-marigold-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-vermillion-500 to-marigold-500 text-white py-3 rounded-xl font-medium hover:from-teal-600 hover:to-vermillion-600 transition-all duration-200 transform hover:scale-105"
              >
                {isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={isLogin && !isForgotPassword ? showSignup : showLogin}
                className="text-marigold-600 hover:text-marigold-700 font-medium flex items-center justify-center space-x-2 mx-auto"
              >
                <UserPlus className="h-4 w-4" />
                <span>
                  {isLogin && !isForgotPassword ? "Don't have an account? Sign up" : 'Back to sign in'}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-cream-200 dark:bg-ink-700 px-8 py-4 text-center text-sm text-ink-400 dark:text-cream-300/70">
            Demo mode - Password reset links are generated locally
          </div>
        </div>
      </div>
    </div>
  );
}
