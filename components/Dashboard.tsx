
import React, { useState } from 'react';
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
  const { rounds } = useData();
  const { user } = useAuth();
  const { t } = useLanguage();
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
            <p className="text-gray-400 text-xs leading-relaxed mb-2">{t('recoveryMessage')}</p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-red-500 hover:text-red-400 text-xs font-bold underline"
            >
              <i className="fas fa-user-cog mr-1"></i>{t('recoveryGoToProfile')}
            </button>
          </div>
          <button
            onClick={() => setRecoveryDismissed(true)}
            className="text-gray-500 hover:text-white text-lg flex-shrink-0"
            title={t('close')}
          >
            &times;
          </button>
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
