import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Award, Flame } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useUser();

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
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-blue-100 capitalize">{user.level}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center overflow-hidden">
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;