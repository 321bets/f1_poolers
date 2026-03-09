
import React, { useState, useMemo } from 'react';
import RoundSelector from './RaceSelector';
import Leaderboard from './Leaderboard';
import LeagueLeaderboard from './LeagueLeaderboard';
import BettingModal from './BettingModal';
import BetConfirmationModal from './BetConfirmationModal';
import HowToPlayModal from './HowToPlayModal';
import UserSettingsModal from './UserSettingsModal';
import { Event, Round, Bet } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Dashboard: React.FC = () => {
  const { rounds, users, drivers, teams } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [fanTab, setFanTab] = useState<'drivers' | 'teams'>('drivers');

  const topDriverFans = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => { if (u.supportedDriverId) map[u.supportedDriverId] = (map[u.supportedDriverId] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ driver: drivers.find(d => d.id === id), count }));
  }, [users, drivers]);

  const topTeamFans = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => { if (u.supportedTeamId) map[u.supportedTeamId] = (map[u.supportedTeamId] || 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ team: teams.find(t => t.id === id), count }));
  }, [users, teams]);
  const [selectedRound, setSelectedRound] = useState<Round | null>(rounds.length > 0 ? rounds[0] : null);
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [bettingEvent, setBettingEvent] = useState<Event | null>(null);
  const [confirmedBet, setConfirmedBet] = useState<Bet | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [recoveryDismissed, setRecoveryDismissed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const hasRecoveryContact = !!(user?.email || user?.phone);

  const handlePlaceBetClick = (event: Event) => {
    setBettingEvent(event);
    setIsBettingModalOpen(true);
  };

  const handleBetPlaced = (bet: Omit<Bet, 'id' | 'timestamp'>) => {
    setIsBettingModalOpen(false);
    setConfirmedBet({ ...bet, id: `bet-${Date.now()}`, timestamp: new Date() });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
          <button 
            onClick={() => setIsHowToPlayOpen(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white font-black py-2 px-6 rounded-full border border-red-600 shadow-lg text-xs transition-all flex items-center gap-2 uppercase italic"
          >
            <i className="fas fa-question-circle text-red-500"></i>
            {t('howToPlay')}
          </button>
      </div>

      {/* Recovery Contact Reminder */}
      {!hasRecoveryContact && !recoveryDismissed && (
        <div className="bg-gray-800 border border-yellow-600/40 rounded-lg p-4 flex items-start gap-3">
          <i className="fas fa-shield-alt text-yellow-500 text-xl mt-0.5 flex-shrink-0"></i>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm mb-1">{t('recoveryTitle')}</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">{t('recoveryMessage')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded transition-all uppercase tracking-wider flex items-center gap-1"
              >
                <i className="fas fa-user-cog"></i>{t('recoveryGoToProfile')}
              </button>
              <button
                onClick={() => setRecoveryDismissed(true)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold py-2 px-4 rounded transition-all tracking-wider"
              >
                {t('recoveryDismissBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rounds & Betting */}
        <div className="lg:col-span-8">
          <RoundSelector 
            selectedRound={selectedRound}
            onSelectRound={setSelectedRound}
            onPlaceBet={handlePlaceBetClick}
          />
        </div>
        
        {/* Right Column: Leaderboards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Leaderboard />

          {/* Fan Favorites Top 5 */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-4">
            <h2 className="text-xl font-bold mb-3 text-red-500 flex items-center">
              <i className="fas fa-heart mr-2 text-red-400"></i>
              {t('fanFavorites')}
            </h2>
            <div className="flex mb-3 bg-gray-700 rounded-lg p-0.5">
              <button onClick={() => setFanTab('drivers')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${fanTab === 'drivers' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                <i className="fas fa-user mr-1"></i>{t('topDrivers')}
              </button>
              <button onClick={() => setFanTab('teams')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${fanTab === 'teams' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                <i className="fas fa-flag mr-1"></i>{t('topTeams')}
              </button>
            </div>
            <div className="space-y-2">
              {fanTab === 'drivers' ? (
                topDriverFans.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-3">{t('noFansYet')}</p>
                ) : topDriverFans.map(({ driver, count }, i) => driver && (
                  <div key={driver.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                    <div className="flex items-center">
                      <div className={`w-8 text-center font-bold text-sm ${i < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{i + 1}</div>
                      <img src={driver.imageUrl} alt={driver.name} className="w-8 h-8 rounded-full mr-2 border-2 border-gray-600 object-cover" />
                      <div>
                        <p className="font-semibold text-white text-sm">{driver.name}</p>
                        <p className="text-[10px] text-gray-400">#{driver.number} — {driver.teamName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-red-400 font-bold text-sm">
                      <i className="fas fa-heart text-[10px]"></i>{count}
                    </div>
                  </div>
                ))
              ) : (
                topTeamFans.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-3">{t('noFansYet')}</p>
                ) : topTeamFans.map(({ team, count }, i) => team && (
                  <div key={team.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                    <div className="flex items-center">
                      <div className={`w-8 text-center font-bold text-sm ${i < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{i + 1}</div>
                      <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-full mr-2 border-2 border-gray-600 object-contain bg-white p-0.5" />
                      <p className="font-semibold text-white text-sm">{team.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-red-400 font-bold text-sm">
                      <i className="fas fa-heart text-[10px]"></i>{count}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <LeagueLeaderboard />
        </div>

        {isBettingModalOpen && bettingEvent && (
          <BettingModal
            event={bettingEvent}
            onClose={() => setIsBettingModalOpen(false)}
            onBetPlaced={handleBetPlaced}
          />
        )}

        {confirmedBet && bettingEvent && (
          <BetConfirmationModal 
              bet={confirmedBet}
              event={bettingEvent}
              onClose={() => setConfirmedBet(null)}
          />
        )}

        {isHowToPlayOpen && (
          <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />
        )}

        {isSettingsOpen && (
          <UserSettingsModal onClose={() => setIsSettingsOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
