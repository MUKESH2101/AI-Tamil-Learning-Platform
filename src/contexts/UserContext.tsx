import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, LearningSession } from '../types';

interface UserContextType {
  user: User | null;
  sessions: LearningSession[];
  updateUser: (user: User) => void;
  addSession: (session: LearningSession) => void;
  incrementStreak: () => void;
  addPoints: (points: number) => void;
  addAchievement: (achievement: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  const addSession = (session: LearningSession) => {
    setSessions(prev => [...prev, session]);
  };

  const incrementStreak = () => {
    if (user) {
      setUser(prev => prev ? { ...prev, streak: prev.streak + 1 } : null);
    }
  };

  const addPoints = (points: number) => {
    if (user) {
      setUser(prev => prev ? { ...prev, totalPoints: prev.totalPoints + points } : null);
    }
  };

  const addAchievement = (achievement: string) => {
    if (user && !user.achievements.includes(achievement)) {
      setUser(prev => prev ? { 
        ...prev, 
        achievements: [...prev.achievements, achievement] 
      } : null);
    }
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{
      user,
      sessions,
      updateUser,
      addSession,
      incrementStreak,
      addPoints,
      addAchievement,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};