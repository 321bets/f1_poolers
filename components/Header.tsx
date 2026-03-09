
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import UserSettingsModal from './UserSettingsModal';

interface HeaderProps {
    currentView: 'dashboard' | 'admin' | 'statistics';
    onToggleView: () => void;
    onNavigate: (view: 'dashboard' | 'statistics') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onToggleView, onNavigate }) => {
  const { user, logout, isAdmin } = useAuth();
  const { markNotificationRead } = useData();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!user) {
    return null; 
  }

  const unreadCount = user.notifications?.filter(n => !n.read).length || 0;
  const sortedNotifications = user.notifications ? [...user.notifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];

  const handleNotifClick = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleMarkRead = (id: string) => {
      markNotificationRead(id);
  };

  return (
    <>
    <header className="bg-gray-800 shadow-lg relative">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-flag-checkered text-red-500 text-xl"></i>
          <h1 className="text-sm sm:text-lg font-bold tracking-wider text-white">F1™ POOLERS</h1>
        </div>
        <div className="flex items-center space-x-4">
             {/* Notification Bell */}
             <div className="relative">
                <button onClick={handleNotifClick} className="text-gray-300 hover:text-white relative mr-2">
                    <i className="fas fa-bell text-xl"></i>
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </button>
                
                {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
                        <div className="p-3 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                            <h3 className="font-bold text-white">{t('notificationsTitle')}</h3>
                            <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        {sortedNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">{t('noNotifications')}</div>
                        ) : (
                            <div className="divide-y divide-gray-700">
                                {sortedNotifications.map(n => (
                                    <div key={n.id} className={`p-3 hover:bg-gray-700 transition-colors ${n.read ? 'opacity-60' : 'bg-gray-750 border-l-4 border-red-500'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-indigo-400">{n.sender}</span>
                                            <span className="text-xs text-gray-500">{new Date(n.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-200 mb-2">{n.message}</p>
                                        {!n.read && (
                                            <button 
                                                onClick={() => handleMarkRead(n.id)}
                                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                                            >
                                                {t('markAsRead')}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
             </div>
             {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="text-gray-300 hover:text-white transition-colors"
                title={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
            >
                <i className={`fas ${theme === 'dark' ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-400'} text-lg`}></i>
            </button>
            {/* Statistics Tab - hidden on mobile, shown in Dashboard instead */}
            <button
                onClick={() => onNavigate(currentView === 'statistics' ? 'dashboard' : 'statistics')}
                className={`hidden sm:inline-flex font-semibold py-2 px-4 rounded-full text-sm transition-colors ${currentView === 'statistics' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
                <i className="fas fa-chart-line mr-2"></i>
                Stats
            </button>

            {isAdmin && (
              <button
                  onClick={onToggleView}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full text-sm transition-colors"
                  aria-label={currentView === 'dashboard' ? 'Switch to Admin Panel' : 'Switch to User Dashboard'}
              >
                  <i className={`fas ${currentView === 'dashboard' ? 'fa-user-shield' : 'fa-tachometer-alt'} mr-2`}></i>
                  {currentView === 'dashboard' ? t('adminPanel') : t('dashboard')}
              </button>
            )}
            
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center space-x-4 bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full border-2 border-red-500" />
                <div className="text-right hidden sm:block">
                    <p className="text-white font-semibold text-sm">{user.username}</p>
                    <p className="text-yellow-400 font-bold text-xs">
                    <i className="fas fa-coins mr-1"></i>
                    {user.balance.toLocaleString()}
                    </p>
                </div>
            </button>

            <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors" title="Logout">
                <i className="fas fa-sign-out-alt"></i>
            </button>
        </div>
      </div>
    </header>

    {isSettingsOpen && <UserSettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};

export default Header;