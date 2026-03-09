
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import AdminPanel from './components/admin/AdminPanel';
import AuthPage from './components/AuthPage';
import { useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';

const MainContent: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'admin' | 'statistics'>('dashboard');
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { systemSettings } = useData();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Back-button navigation guard
  useEffect(() => {
    // Push a dummy state so pressing back triggers popstate instead of leaving
    window.history.pushState({ f1guard: true }, '');

    const handlePopState = () => {
      // User pressed back — show the confirmation modal and re-push guard
      setShowLeaveModal(true);
      window.history.pushState({ f1guard: true }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLeaveSite = useCallback(() => {
    setShowLeaveModal(false);
    // Go back twice: once to undo our re-push, once to actually leave
    window.history.go(-2);
  }, []);

  const handleStay = useCallback(() => {
    setShowLeaveModal(false);
  }, []);

  // Apply F1 Theme globally when enabled
  const isF1Theme = systemSettings.theme === 'f1';
  const isLight = theme === 'light';

  // Show loading while checking for stored session
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isF1Theme ? (isLight ? 'bg-[#f5f5f7]' : 'bg-[#15151e]') : (isLight ? 'bg-gray-100' : 'bg-gray-900')}`}>
        <div className="text-xl" style={{ color: isLight ? '#111827' : '#ffffff' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isF1Theme ? (isLight ? 'theme-f1 theme-f1-light bg-[#f5f5f7]' : 'theme-f1 bg-[#15151e]') : (isLight ? 'bg-gray-100' : 'bg-gray-900')}`}>
      {/* Dynamic F1 CSS Injection */}
      {isF1Theme && (
        <style>{`
          .theme-f1 {
            font-family: 'Titillium Web', sans-serif !important;
          }
          .theme-f1 h1, .theme-f1 h2, .theme-f1 h3 {
            font-family: 'Orbitron', sans-serif !important;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .theme-f1 button {
            border-radius: 0px 12px 0px 12px !important; 
            font-family: 'Titillium Web', sans-serif !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
          .theme-f1 button.rounded-full {
             border-radius: 9999px !important; 
          }

          /* --- F1 Theme: DARK variant --- */
          .theme-f1:not(.theme-f1-light) .bg-gray-800 {
            background-color: #1f1f27 !important;
            border-right: 4px solid #e10600 !important; 
            border-radius: 4px !important;
          }
          .theme-f1:not(.theme-f1-light) .bg-gray-700 {
            background-color: #38383f !important;
            border-radius: 4px !important;
          }
          .theme-f1:not(.theme-f1-light) .bg-gray-900 {
            background-color: #15151e !important;
          }
          .theme-f1:not(.theme-f1-light) .text-red-500,
          .theme-f1:not(.theme-f1-light) .text-red-600 {
            color: #e10600 !important;
          }
          .theme-f1:not(.theme-f1-light) .bg-red-600 {
            background-color: #e10600 !important;
          }
          .theme-f1:not(.theme-f1-light) .bg-red-600:hover {
            background-color: #b90500 !important;
          }
          .theme-f1:not(.theme-f1-light) ::-webkit-scrollbar {
            width: 8px;
          }
          .theme-f1:not(.theme-f1-light) ::-webkit-scrollbar-track {
            background: #15151e; 
          }
          .theme-f1:not(.theme-f1-light) ::-webkit-scrollbar-thumb {
            background: #e10600; 
            border-radius: 0;
          }

          /* --- F1 Theme: LIGHT variant --- */
          .theme-f1-light {
            background-color: #f5f5f7 !important;
            color: #111827 !important;
          }
          .theme-f1-light .bg-gray-900 {
            background-color: #f0f0f2 !important;
          }
          .theme-f1-light .bg-gray-800 {
            background-color: #ffffff !important;
            border-right: 4px solid #e10600 !important;
            border-radius: 4px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          .theme-f1-light .bg-gray-700 {
            background-color: #e8e8ed !important;
            border-radius: 4px !important;
          }
          .theme-f1-light .text-white {
            color: #111827 !important;
          }
          .theme-f1-light .text-gray-100 { color: #1f2937 !important; }
          .theme-f1-light .text-gray-200 { color: #374151 !important; }
          .theme-f1-light .text-gray-300 { color: #4b5563 !important; }
          .theme-f1-light .text-gray-400 { color: #6b7280 !important; }
          .theme-f1-light .text-gray-500 { color: #9ca3af !important; }
          .theme-f1-light .text-red-500,
          .theme-f1-light .text-red-600 {
            color: #e10600 !important;
          }
          .theme-f1-light .bg-red-600 {
            background-color: #e10600 !important;
          }
          .theme-f1-light .bg-red-600:hover {
            background-color: #b90500 !important;
          }
          .theme-f1-light .text-yellow-400 { color: #b45309 !important; }
          .theme-f1-light .text-green-400 { color: #15803d !important; }
          .theme-f1-light .text-blue-400 { color: #2563eb !important; }
          .theme-f1-light .text-indigo-400 { color: #4f46e5 !important; }
          .theme-f1-light .border-gray-700 { border-color: #d1d5db !important; }
          .theme-f1-light .border-gray-600 { border-color: #e5e7eb !important; }
          .theme-f1-light .border-gray-800 { border-color: #e5e7eb !important; }
          .theme-f1-light .divide-gray-700 > :not([hidden]) ~ :not([hidden]) { border-color: #d1d5db !important; }
          .theme-f1-light .hover\\:bg-gray-600:hover { background-color: #d1d5db !important; }
          .theme-f1-light .hover\\:bg-gray-700:hover { background-color: #e5e7eb !important; }
          .theme-f1-light .hover\\:text-white:hover { color: #111827 !important; }
          .theme-f1-light .shadow-lg { box-shadow: 0 4px 12px -2px rgba(0,0,0,0.06) !important; }
          .theme-f1-light .shadow-2xl { box-shadow: 0 10px 30px -5px rgba(0,0,0,0.08) !important; }
          .theme-f1-light input, .theme-f1-light select, .theme-f1-light textarea {
            color: #111827 !important;
            background-color: #f0f0f2 !important;
            border: 1px solid #d1d5db !important;
          }
          .theme-f1-light input:focus, .theme-f1-light select:focus, .theme-f1-light textarea:focus {
            border-color: #e10600 !important;
            background-color: #ffffff !important;
          }
          .theme-f1-light ::-webkit-scrollbar { width: 8px; }
          .theme-f1-light ::-webkit-scrollbar-track { background: #f0f0f2; }
          .theme-f1-light ::-webkit-scrollbar-thumb { background: #e10600; border-radius: 0; }
          .theme-f1-light .bg-\\[\\#1a1a24\\] { background-color: #ffffff !important; }
          .theme-f1-light .bg-\\[\\#15151e\\] { background-color: #f5f5f7 !important; }
          .theme-f1-light .bg-\\[\\#1f1f27\\] { background-color: #ffffff !important; }
        `}</style>
      )}

      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <>
          <Header 
            currentView={view} 
            onToggleView={() => setView(v => v === 'dashboard' ? 'admin' : 'dashboard')} 
            onNavigate={(v: 'dashboard' | 'statistics') => setView(v)}
          />
          <main className="container mx-auto p-4">
            {view === 'admin' && isAdmin ? <AdminPanel /> : view === 'statistics' ? <Statistics onBack={() => setView('dashboard')} /> : <Dashboard onNavigateStats={() => setView('statistics')} />}
          </main>
        </>
      )}

      {/* Leave Site Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-yellow-500 text-lg"></i>
              <h2 className="text-white font-bold uppercase italic text-sm">{t('leaveSiteTitle')}</h2>
            </div>
            <div className="p-5">
              <p className="text-gray-300 text-sm mb-5">{t('leaveSiteMessage')}</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleStay}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded transition-all uppercase italic text-xs tracking-widest"
                >
                  {t('leaveSiteStay')}
                </button>
                <button
                  onClick={handleLeaveSite}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2.5 px-4 rounded transition-all text-xs tracking-wider"
                >
                  {t('leaveSiteLeave')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const App: React.FC = () => {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
};

export default App;
