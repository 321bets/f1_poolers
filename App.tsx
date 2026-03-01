
import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Statistics from './components/Statistics';
import AdminPanel from './components/admin/AdminPanel';
import AuthPage from './components/AuthPage';
import { useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';

const MainContent: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'admin' | 'statistics'>('dashboard');
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { systemSettings } = useData();

  // Apply F1 Theme globally when enabled
  const isF1Theme = systemSettings.theme === 'f1';

  // Show loading while checking for stored session
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isF1Theme ? 'bg-[#15151e]' : 'bg-gray-900'}`}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isF1Theme ? 'theme-f1 bg-[#15151e]' : 'bg-gray-900'}`}>
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
          .theme-f1 .bg-gray-800 {
            background-color: #1f1f27 !important;
            border-right: 4px solid #e10600 !important; 
            border-radius: 4px !important;
          }
          .theme-f1 .bg-gray-700 {
            background-color: #38383f !important;
            border-radius: 4px !important;
          }
          .theme-f1 .bg-gray-900 {
            background-color: #15151e !important;
          }
          .theme-f1 .text-red-500, .theme-f1 .text-red-600 {
            color: #e10600 !important;
          }
          .theme-f1 .bg-red-600 {
            background-color: #e10600 !important;
          }
          .theme-f1 .bg-red-600:hover {
            background-color: #b90500 !important;
          }
          .theme-f1 ::-webkit-scrollbar {
            width: 8px;
          }
          .theme-f1 ::-webkit-scrollbar-track {
            background: #15151e; 
          }
          .theme-f1 ::-webkit-scrollbar-thumb {
            background: #e10600; 
            border-radius: 0;
          }
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
            {view === 'admin' && isAdmin ? <AdminPanel /> : view === 'statistics' ? <Statistics /> : <Dashboard />}
          </main>
        </>
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
