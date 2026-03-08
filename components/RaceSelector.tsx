import React, { useState, useEffect } from 'react';
import { Round, Event, EventType, EventStatus, Bet } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { shareBetSlip, downloadBetSlipImage } from '../services/shareService';

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

const EventCard: React.FC<{ event: Event; onPlaceBet: (e: Event) => void; userTz: string; t: (key: string) => string }> = ({ event, onPlaceBet, userTz, t }) => {
  const { allBets, rounds } = useData();
  const { user } = useAuth();
  const [eventStarted, setEventStarted] = useState(Date.now() >= event.date.getTime());
  const [expandedBet, setExpandedBet] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<Record<string, string>>({});

  const userBets = allBets.filter(b => b.userId === user?.id && b.eventId === event.id && b.status === 'Active');
  const round = rounds.find(r => r.id === event.roundId);

  useEffect(() => {
    if (eventStarted) return;
    const interval = setInterval(() => {
      if (Date.now() >= event.date.getTime()) {
        setEventStarted(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [event.date, eventStarted]);

  const handleShare = async (bet: Bet) => {
    if (!round || !user) return;
    setShareStatus(s => ({ ...s, [bet.id]: 'sharing' }));
    try {
      const result = await shareBetSlip(bet, event, round, user.username);
      setShareStatus(s => ({ ...s, [bet.id]: result }));
      setTimeout(() => setShareStatus(s => ({ ...s, [bet.id]: '' })), 3000);
    } catch {
      setShareStatus(s => ({ ...s, [bet.id]: 'error' }));
      setTimeout(() => setShareStatus(s => ({ ...s, [bet.id]: '' })), 3000);
    }
  };

  const handleDownload = async (bet: Bet) => {
    if (!round || !user) return;
    try {
      await downloadBetSlipImage(bet, event, round, user.username);
    } catch { /* silent */ }
  };

  return (
    <div className={`bg-gray-700 p-4 rounded-lg ${getStatusClasses(event.status)}`}>
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
          {event.status === EventStatus.UPCOMING && !eventStarted && (
            <button onClick={() => onPlaceBet(event)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 text-sm rounded transition-colors">
              Place Bet
            </button>
          )}
          {event.status === EventStatus.UPCOMING && eventStarted && (
            <button disabled className="w-full bg-yellow-700 text-yellow-200 font-bold py-2 px-3 text-sm rounded cursor-not-allowed border border-yellow-600">
              <i className="fas fa-lock mr-1"></i> {t('bettingClosed')}
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

        {/* User's Predictions with Share */}
        {userBets.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-300 font-semibold flex items-center gap-1">
                <i className="fas fa-check-circle text-green-500 text-[10px]"></i>
                {userBets.length} {t('predictionsPlaced')}
              </span>
            </div>
            {userBets.map((bet, idx) => {
              const isExpanded = expandedBet === bet.id;
              const status = shareStatus[bet.id] || '';
              const hasDrivers = bet.predictions && bet.predictions.length > 0;
              const hasTeams = bet.teamPredictions && bet.teamPredictions.length > 0;
              const label = hasDrivers && hasTeams ? t('combo') 
                : hasDrivers ? t('drivers') : t('teams');

              return (
                <div key={bet.id} className="bg-gray-700 rounded mb-1.5 overflow-hidden">
                  {/* Bet header - clickable to expand */}
                  <button 
                    onClick={() => setExpandedBet(isExpanded ? null : bet.id)}
                    className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-gray-650 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded font-bold">#{idx + 1}</span>
                      <span className="text-xs text-white font-semibold">{label}</span>
                      <span className="text-[10px] text-green-400 font-bold">{bet.lockedMultiplier.toFixed(1)}x</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-[9px] text-gray-400`}></i>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 border-t border-gray-600">
                      {hasDrivers && (
                        <div className="mt-2">
                          <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">{t('drivers')}</p>
                          {bet.predictions.map((d, i) => (
                            <div key={d.id} className="flex items-center gap-2 py-0.5">
                              <span className="text-[9px] font-bold text-yellow-500 w-5">P{i + 1}</span>
                              <img src={d.imageUrl} alt={d.name} className="w-5 h-5 rounded-full object-cover" />
                              <span className="text-xs text-white">{d.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasTeams && (
                        <div className="mt-2">
                          <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">{t('teams')}</p>
                          {bet.teamPredictions.map((tm, i) => (
                            <div key={`${tm.id}-${i}`} className="flex items-center gap-2 py-0.5">
                              <span className="text-[9px] font-bold text-blue-400 w-5">P{i + 1}</span>
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5">
                                <img src={tm.logoUrl} alt={tm.name} className="max-w-full max-h-full" />
                              </div>
                              <span className="text-xs text-white">{tm.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Share + Download buttons */}
                      <div className="flex gap-1.5 mt-2 pt-2 border-t border-gray-600">
                        <button
                          onClick={() => handleShare(bet)}
                          disabled={status === 'sharing'}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 px-2 rounded transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {status === 'sharing' ? (
                            <><i className="fas fa-spinner fa-spin"></i></>
                          ) : status === 'shared' || status === 'copied' ? (
                            <><i className="fas fa-check"></i> {status === 'copied' ? t('copied') : t('shared')}</>
                          ) : (
                            <><i className="fas fa-share-alt"></i> {t('share')}</>
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(bet)}
                          className="bg-gray-600 hover:bg-gray-500 text-white text-[10px] font-bold py-1.5 px-2 rounded transition-colors flex items-center justify-center"
                          title={t('downloadImage')}
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

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
              <EventCard key={event.id} event={event} onPlaceBet={onPlaceBet} userTz={userTz} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundSelector;
