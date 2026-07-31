import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageCircle,
  BookOpen,
  Mic,
  Volume2,
  User,
  Calendar,
  Gamepad2
} from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'AI Chat' },
    { path: '/lessons', icon: BookOpen, label: 'Lessons' },
    { path: '/speech', icon: Mic, label: 'Speech' },
    { path: '/audio', icon: Volume2, label: 'Audio' },
    { path: '/games', icon: Gamepad2, label: 'Games' },
    { path: '/daily', icon: Calendar, label: 'Daily Tasks' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="bg-white/90 dark:bg-ink-700/90 backdrop-blur-sm border-b border-ink-50 dark:border-ink-500 sticky top-0 z-30 shadow-soft">
      <div className="flex justify-around md:justify-center md:gap-2 items-center py-1.5 px-1 overflow-x-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 font-semibold flex-shrink-0 ${
                isActive
                  ? 'text-vermillion-600 dark:text-marigold-300'
                  : 'text-ink-400 dark:text-cream-300/60 hover:text-ink-600 dark:hover:text-cream-100 hover:bg-ink-50 dark:hover:bg-ink-600'
              }`}
              style={{ minWidth: 66 }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              <span className="text-[11px] tracking-wide">{label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-vermillion-500 dark:bg-marigold-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
