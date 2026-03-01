import React from 'react';
import { Round, Event, EventType, EventStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface RoundSelectorProps {
  selectedRound: Round | null;
  onSelectRound: (round: Round) => void;
  onPlaceBet: (event: Event) => void;
}

const eventTypeColors: { [key in EventType]: string } = {
  [EventType.QUALIFYING]: 'bg-purple-600',
  [EventType.SPRINT_RACE]: 'bg-blue-600',
  [EventType.MAIN_RACE]: 'bg-red-600',
  [EventType.PRACTICE_1]: 'bg-gray-500',
  [EventType.PRACTICE_2]: 'bg-gray-500',
  [EventType.PRACTICE_3]: 'bg-gray-500',
};

const getStatusClasses = (status: EventStatus) => {
    switch (status) {
        case EventStatus.FINISHED:
            return 'border-l-4 border-gray-500';
        case EventStatus.LIVE:
            return 'border-l-4 border-green-500 animate-pulse';
        default:
            return 'border-l-4 border-transparent';
    }
}

const RoundSelector: React.FC<RoundSelectorProps> = ({ selectedRound, onSelectRound, onPlaceBet }) => {
  const { rounds, events } = useData();
  const { t } = useLanguage();
  const { user } = useAuth();
  const userTz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';

  if (!selectedRound && rounds.length > 0) {
    onSelectRound(rounds[0]);
  }

  const eventsForSelectedRound = events.filter(e => e.roundId === selectedRound?.id).sort((a,b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-red-500">{t('upcomingRounds')}</h2>
      <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-4 overflow-x-auto">
        {rounds.map(round => (
          <button
            key={round.id}
            onClick={() => onSelectRound(round)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              selectedRound?.id === round.id ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            #{round.number} {round.name}
          </button>
        ))}
      </div>
      
      {selectedRound && (
        <div>
          <h3 className="text-xl font-bold">{selectedRound.name}</h3>
          <p className="text-gray-400 mb-4">{selectedRound.circuit}, {selectedRound.location}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsForSelectedRound.map(event => (
              <div key={event.id} className={`bg-gray-700 p-4 rounded-lg ${getStatusClasses(event.status)}`}>
                <div className="flex justify-between items-start">
                    <div className={`text-white text-sm font-bold px-3 py-1 rounded-full inline-block mb-2 ${eventTypeColors[event.type]}`}>
                        {event.type}
                    </div>
                    {event.status === EventStatus.LIVE && <span className="text-green-400 text-sm font-bold">{t('live')}</span>}
                    {event.status === EventStatus.FINISHED && <span className="text-gray-400 text-sm font-bold">{t('finished')}</span>}
                </div>
                <p className="text-xs text-gray-300 mb-2">{event.date.toLocaleString(undefined, { timeZone: userTz })}</p>
                <div className="bg-gray-600 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-300">{t('entryFee')}</p>
                            <p className="font-bold text-yellow-400">{event.betValue} <i className="fas fa-coins text-xs"></i></p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-300">{t('prizePool')}</p>
                            <p className="font-bold text-green-400">{event.poolPrize.toLocaleString()} <i className="fas fa-coins text-xs"></i></p>
                        </div>
                    </div>
                     <div className="mt-3">
                        {event.status === EventStatus.UPCOMING && (
                            <button onClick={() => onPlaceBet(event)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 text-sm rounded transition-colors">
                                Place Bet
                            </button>
                        )}
                         {event.status === EventStatus.FINISHED && (
                            <button onClick={() => alert('Results view not implemented yet.')} className="w-full bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-3 text-sm rounded transition-colors">
                                {t('viewResults')}
                            </button>
                        )}
                         {event.status === EventStatus.LIVE && (
                            <button disabled className="w-full bg-gray-500 text-white font-bold py-2 px-3 text-sm rounded cursor-not-allowed">
                                {t('bettingClosed')}
                            </button>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundSelector;
