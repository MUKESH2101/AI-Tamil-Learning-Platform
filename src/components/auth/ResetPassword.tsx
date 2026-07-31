import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Lock, User } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

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
const CURRENT_USER_KEY = 'tamil_ai_current_user';

const getUsersFromStorage = (): Record<string, StoredUser> => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveUsersToStorage = (users: Record<string, StoredUser>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetRequest = useMemo(() => {
    if (!token) {
      return null;
    }
    const requests = getPasswordResetsFromStorage();
    return requests[token] || null;
  }, [token]);

  const validateRequest = () => {
    if (!token || !resetRequest) {
      return 'This password reset link is invalid or already used.';
    }

    if (new Date(resetRequest.expiresAt).getTime() < Date.now()) {
      return 'This password reset link has expired. Please request a new link.';
    }

    const users = getUsersFromStorage();
    if (!users[resetRequest.email]) {
      return 'No account was found for this reset link.';
    }

    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const requestError = validateRequest();
    if (requestError) {
      setError(requestError);
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password must match.');
      return;
    }

    if (!resetRequest) {
      setError('This password reset link is invalid or already used.');
      return;
    }

    const users = getUsersFromStorage();
    const user = users[resetRequest.email];
    users[resetRequest.email] = {
      ...user,
      password: newPassword,
    };
    saveUsersToStorage(users);

    const requests = getPasswordResetsFromStorage();
    delete requests[token];
    savePasswordResetsToStorage(requests);
    localStorage.removeItem(CURRENT_USER_KEY);

    setSuccess('Password changed successfully. Please sign in with your new password.');
    setNewPassword('');
    setConfirmPassword('');
  };

  const goToLogin = () => {
    navigate('/');
  };

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
              <p className="text-ink-400 dark:text-cream-300/70 mt-2">Create a new password</p>
            </div>

            {resetRequest && (
              <div className="mb-6 rounded-xl border border-marigold-200 bg-marigold-50 px-4 py-3 text-sm text-marigold-700">
                Resetting password for {resetRequest.email}
              </div>
            )}

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
                    <p className="font-medium">Password updated</p>
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-200 dark:text-cream-300/40" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-ink-100 dark:border-ink-400 rounded-xl focus:ring-2 focus:ring-marigold-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-cream-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ink-200 dark:text-cream-300/40" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-ink-100 dark:border-ink-400 rounded-xl focus:ring-2 focus:ring-marigold-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-vermillion-500 to-marigold-500 text-white py-3 rounded-xl font-medium hover:from-teal-600 hover:to-vermillion-600 transition-all duration-200 transform hover:scale-105"
              >
                Change Password
              </button>
            </form>

            <div className="mt-6 text-center">
              {success ? (
                <button
                  onClick={goToLogin}
                  className="text-marigold-600 hover:text-marigold-700 font-medium"
                >
                  Back to sign in
                </button>
              ) : (
                <Link to="/" className="text-marigold-600 hover:text-marigold-700 font-medium">
                  Back to sign in
                </Link>
              )}
            </div>
          </div>

          <div className="bg-cream-200 dark:bg-ink-700 px-8 py-4 text-center text-sm text-ink-400 dark:text-cream-300/70">
            Your old password stops working after this change
          </div>
        </div>
      </div>
    </div>
  );
}
