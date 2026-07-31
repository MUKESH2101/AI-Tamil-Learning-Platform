import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Award, ChevronDown, Edit3, Flame, LogOut, Moon, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const handleEditProfile = () => {
    setMenuOpen(false);
    navigate('/profile');
  };

  return (
    <header className="relative bg-ink-700 text-cream-100 overflow-hidden">
      {/* Kolam dot-grid signature texture */}
      <div className="absolute inset-0 kolam-field text-marigold-400/[0.08] pointer-events-none" />
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-vermillion-500/20 blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-left group"
          >
            <h1 className="text-xl sm:text-2xl font-display font-semibold tracking-tight">
              Tamil<span className="text-marigold-400">Learn</span>
              <span className="ml-1 text-xs align-top font-sans font-bold text-vermillion-300 tracking-widest">AI</span>
            </h1>
            <p className="text-cream-300/70 text-xs sm:text-sm font-medium">
              வணக்கம் · Master Tamil with AI-powered learning
            </p>
          </button>

          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun size={17} className="text-marigold-300" />
                ) : (
                  <Moon size={17} className="text-cream-200" />
                )}
              </button>

              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-2">
                <Flame className="text-vermillion-300" size={16} />
                <span className="font-semibold text-sm">{user.streak}</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-2">
                <Award className="text-marigold-300" size={16} />
                <span className="font-semibold text-sm">{user.totalPoints}</span>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full bg-white/10 pl-1.5 pr-3 py-1.5 transition hover:bg-white/20"
                  aria-label="Open profile menu"
                  aria-expanded={menuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-marigold-400 border-2 border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-ink-800">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="font-semibold leading-4 text-sm">{user.name}</p>
                    <p className="text-[11px] text-cream-300/70 capitalize">{user.level}</p>
                  </div>
                  <ChevronDown size={15} className="text-white/70" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-14 z-20 w-52 overflow-hidden rounded-xl border border-ink-100 dark:border-ink-400 bg-white dark:bg-ink-600 shadow-card">
                    <div className="sm:hidden flex items-center justify-around px-3 py-3 border-b border-ink-50 dark:border-ink-500">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-700 dark:text-cream-200">
                        <Flame className="text-vermillion-500" size={16} /> {user.streak}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-700 dark:text-cream-200">
                        <Award className="text-marigold-500" size={16} /> {user.totalPoints}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-ink-700 dark:text-cream-100 transition hover:bg-marigold-50 dark:hover:bg-ink-500"
                    >
                      <Edit3 size={16} className="text-marigold-500" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-vermillion-600 dark:text-vermillion-300 transition hover:bg-vermillion-50 dark:hover:bg-ink-500"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
