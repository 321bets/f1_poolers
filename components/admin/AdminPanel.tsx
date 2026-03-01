
import React, { useState } from 'react';
import EventManagement from './RaceManagement';
import UserManagement from './UserManagement';
import RoundManagement from './RoundManagement';
import DriverManagement from './DriverManagement';
import TeamManagement from './TeamManagement';
import BetManagement from './BetManagement';
import MessagingSystem from './MessagingSystem';
import AdManagement from './AdManagement';
import LayoutManagement from './LayoutManagement';
import OverviewDashboard from './OverviewDashboard';

type AdminTab = 'overview' | 'rounds' | 'events' | 'drivers' | 'teams' | 'users' | 'bets' | 'messaging' | 'ads' | 'layout';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'rounds':
        return <RoundManagement />;
      case 'events':
        return <EventManagement />;
      case 'drivers':
        return <DriverManagement />;
      case 'teams':
        return <TeamManagement />;
      case 'users':
        return <UserManagement />;
      case 'bets':
        return <BetManagement />;
      case 'messaging':
        return <MessagingSystem />;
      case 'ads':
        return <AdManagement />;
      case 'layout':
        return <LayoutManagement />;
      default:
        return (
            <div className="p-6 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-white">Select a Section</h2>
                <p className="text-gray-400">Choose a management section from the sidebar to begin.</p>
            </div>
        );
    }
  };

  const TabButton: React.FC<{ tab: AdminTab; label: string; icon: string }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
        activeTab === tab ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-300'
      }`}
      aria-current={activeTab === tab}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
      <aside className="lg:col-span-3 bg-gray-800 rounded-lg p-4 h-fit">
        <nav className="space-y-2" aria-label="Admin Navigation">
          <TabButton tab="overview" label="Overview" icon="fa-chart-line" />
          <TabButton tab="rounds" label="Round Management" icon="fa-calendar-alt" />
          <TabButton tab="events" label="Event Management" icon="fa-flag-checkered" />
          <TabButton tab="drivers" label="Driver Management" icon="fa-user-astronaut" />
          <TabButton tab="teams" label="Team Management" icon="fa-users-cog" />
          <TabButton tab="users" label="User Management" icon="fa-users" />
          <TabButton tab="bets" label="Bet Slip Management" icon="fa-receipt" />
          <TabButton tab="messaging" label="Messaging System" icon="fa-envelope" />
          <TabButton tab="ads" label="Monetization / Ads" icon="fa-ad" />
          <TabButton tab="layout" label="Layout" icon="fa-palette" />
        </nav>
      </aside>
      <main className="lg:col-span-9">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;
