import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, LearningSession } from '../types';
import { speechService } from '../services/speechService';

interface UserContextType {
  user: User | null;
  sessions: LearningSession[];
  updateUser: (user: User) => void;
  addSession: (session: LearningSession) => void;
  incrementStreak: () => void;
  addPoints: (points: number) => void;
  addAchievement: (achievement: string) => void;
  logout: () => void;
  loadUserByEmail: (email: string) => User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// LocalStorage utility functions
const USERS_STORAGE_KEY = 'tamil_ai_users';
const SESSIONS_STORAGE_KEY = 'tamil_ai_sessions';
const CURRENT_USER_KEY = 'tamil_ai_current_user';

const getUsersFromStorage = (): Record<string, User> => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const getSessionsFromStorage = (): LearningSession[] => {
  try {
    const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveUsersToStorage = (users: Record<string, User>) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage:', e);
  }
};

const saveSessionsToStorage = (sessions: LearningSession[]) => {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions to localStorage:', e);
  }
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<LearningSession[]>([]);

  // Load stored data on mount
  useEffect(() => {
    const storedSessions = getSessionsFromStorage();
    setSessions(storedSessions);
    // Restore current user from storage if present
    try {
      const currentEmail = localStorage.getItem(CURRENT_USER_KEY);
      if (currentEmail) {
        const users = getUsersFromStorage();
        const storedUser = users[currentEmail];
        if (storedUser) setUser(storedUser);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const updateUser = (newUser: User) => {
    if (newUser.voiceGender) {
      speechService.setPreferredVoiceGender(newUser.voiceGender);
    } else {
      speechService.setPreferredVoiceFromEmail(newUser.email);
    }
    setUser(newUser);
    // Save to localStorage
    const users = getUsersFromStorage();
    users[newUser.email] = newUser;
    saveUsersToStorage(users);
    try {
      localStorage.setItem(CURRENT_USER_KEY, newUser.email);
    } catch (e) {}
  };

  const addSession = (session: LearningSession) => {
    setSessions(prev => {
      const updated = [...prev, session];
      saveSessionsToStorage(updated);
      return updated;
    });
  };

  const incrementStreak = () => {
    if (user) {
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, streak: prev.streak + 1 };
        const users = getUsersFromStorage();
        users[updated.email] = updated;
        saveUsersToStorage(users);
        return updated;
      });
    }
  };

  const addPoints = (points: number) => {
    if (user) {
      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, totalPoints: prev.totalPoints + points };
        const users = getUsersFromStorage();
        users[updated.email] = updated;
        saveUsersToStorage(users);
        return updated;
      });
    }
  };

  const addAchievement = (achievement: string) => {
    if (user && !user.achievements.includes(achievement)) {
      setUser(prev => {
        if (!prev) return null;
        const updated = { 
          ...prev, 
          achievements: [...prev.achievements, achievement] 
        };
        const users = getUsersFromStorage();
        users[updated.email] = updated;
        saveUsersToStorage(users);
        return updated;
      });
    }
  };

  const logout = () => {
    setUser(null);
    setSessions([]);
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {}
  };

  const loadUserByEmail = (email: string): User | null => {
    const users = getUsersFromStorage();
    const foundUser = users[email] || null;
    if (foundUser) {
      if (foundUser.voiceGender) {
        speechService.setPreferredVoiceGender(foundUser.voiceGender);
      } else {
        speechService.setPreferredVoiceFromEmail(foundUser.email);
      }
      setUser(foundUser);
      try {
        localStorage.setItem(CURRENT_USER_KEY, email);
      } catch (e) {}
    }
    return foundUser;
  };

  return (
    <UserContext.Provider value={{
      user,
      sessions,
      updateUser,
      addSession,
      incrementStreak,
      addPoints,
      addAchievement,
      logout,
      loadUserByEmail
    }}>
      {children}
    </UserContext.Provider>
  );
};
