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
  Award,
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
  <nav className="bg-white border-t border-gray-200">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 font-semibold ${
                isActive 
                  ? 'bg-gray-200 text-black scale-110' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
              style={{ minWidth: 70 }}
            >
              <Icon size={22} />
              <span className="text-xs mt-1 tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;