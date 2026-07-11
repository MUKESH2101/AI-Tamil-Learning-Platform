import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Award, ChevronDown, Edit3, Flame, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useUser();
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
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">TamilLearn AI</h1>
            <p className="text-blue-100 text-sm">Master Tamil with AI-powered learning</p>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                <Flame className="text-orange-300" size={16} />
                <span className="font-semibold">{user.streak}</span>
              </div>

              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                <Award className="text-yellow-300" size={16} />
                <span className="font-semibold">{user.totalPoints}</span>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center space-x-3 rounded-full bg-white/20 px-2 py-2 pr-3 transition hover:bg-white/30"
                  aria-label="Open profile menu"
                  aria-expanded={menuOpen}
                >
                  <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center overflow-hidden">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold leading-4">{user.name}</p>
                    <p className="text-xs text-blue-100 capitalize">{user.level}</p>
                  </div>
                  <ChevronDown size={16} className="text-white/80" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-14 z-20 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                    <button
                      type="button"
                      onClick={handleEditProfile}
                      className="flex w-full items-center space-x-2 px-4 py-3 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                      <Edit3 size={16} />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
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