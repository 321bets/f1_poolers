import React from 'react';
import { User } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

const getRankColor = (rank: number) => {
  if (rank === 1) return 'border-yellow-400';
  if (rank === 2) return 'border-gray-300';
  if (rank === 3) return 'border-yellow-600';
  return 'border-gray-600';
};

const Leaderboard: React.FC = () => {
  const { users } = useData();
  const { t } = useLanguage();
  const sortedUsers = [...users].filter(u => !u.isAdmin).sort((a, b) => b.points - a.points);
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-4">
      <h2 className="text-xl font-bold mb-4 text-red-500 flex items-center">
        <i className="fas fa-trophy mr-2 text-yellow-400"></i>
        {t('globalRankings')}
      </h2>
      <div className="space-y-3">
        {sortedUsers.slice(0, 5).map((user: User, index) => (
          <div key={user.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
            <div className="flex items-center">
              <div className={`w-10 text-center font-bold text-lg ${index + 1 <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                {index + 1}
              </div>
              <img 
                src={user.avatarUrl} 
                alt={user.username} 
                className={`w-10 h-10 rounded-full mr-3 border-2 ${getRankColor(index + 1)}`}
              />
              <div>
                <p className="font-semibold text-white">{user.username}</p>
                <p className="text-xs text-gray-400">{user.points.toLocaleString()} pts</p>
              </div>
            </div>
            {index + 1 === 1 && <i className="fas fa-crown text-yellow-400 text-xl mr-2"></i>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;