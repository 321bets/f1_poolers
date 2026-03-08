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
  [EventType.SPRINT_QUALIFYING]: 'bg-cyan-600',
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
  const { allBets, rounds, results } = useData();
  const { user } = useAuth();
  const [eventStarted, setEventStarted] = useState(Date.now() >= event.date.getTime());
  const [expandedBet, setExpandedBet] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const eventResult = results.find(r => r.eventId === event.id);

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
            <button onClick={() => setShowResults(!showResults)} className="w-full bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-3 text-sm rounded transition-colors flex items-center justify-center gap-1">
              <i className={`fas fa-${showResults ? 'chevron-up' : 'trophy'}`}></i> {t('viewResults')}
            </button>
          )}
          {event.status === EventStatus.LIVE && (
            <button disabled className="w-full bg-gray-500 text-white font-bold py-2 px-3 text-sm rounded cursor-not-allowed">
              {t('bettingClosed')}
            </button>
          )}
        </div>

        {/* Event Results Section */}
        {event.status === EventStatus.FINISHED && showResults && eventResult && (
          <div className="mt-3 pt-3 border-t border-gray-500">
            {/* Finish Line - Positions */}
            {eventResult.positions.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                  <i className="fas fa-flag-checkered"></i> {t('finishLine')}
                </p>
                {eventResult.positions.map((driver, i) => (
                  <div key={driver.id} className={`flex items-center gap-2 py-1 ${i < 3 ? 'bg-gray-600/40 rounded px-1.5' : 'px-1.5'}`}>
                    <span className={`text-[10px] font-bold w-5 text-center ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `P${i + 1}`}
                    </span>
                    <img src={driver.imageUrl} alt={driver.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-xs text-white">{driver.name}</span>
                    <span className="text-[9px] text-gray-500 ml-auto">{(driver as any).teamName || ''}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Winners - Points & Prizes */}
            {eventResult.winners.length > 0 ? (
              <div className="mb-2">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                  <i className="fas fa-coins text-yellow-400"></i> {t('winnersAndPrizes')}
                </p>
                {eventResult.winners.map((winner, i) => (
                  <div key={`${winner.userId}-${i}`} className="flex items-center justify-between py-1 px-1.5 bg-gray-600/30 rounded mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-yellow-500">#{i + 1}</span>
                      <span className="text-xs text-white font-semibold">{winner.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-blue-400 font-bold flex items-center gap-0.5">
                        <i className="fas fa-star text-[8px]"></i> {winner.pointsEarned} {t('pts')}
                      </span>
                      {winner.prizeAmount > 0 && (
                        <span className="text-[10px] text-green-400 font-bold flex items-center gap-0.5">
                          <i className="fas fa-coins text-[8px]"></i> {winner.prizeAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No winners - jackpot rolled over */
              <div className="mb-2 bg-yellow-900/20 border border-yellow-800/40 rounded p-2.5">
                <p className="text-[10px] text-yellow-400 font-bold flex items-center gap-1 mb-1">
                  <i className="fas fa-exclamation-triangle"></i> {t('noWinners')}
                </p>
                <p className="text-[10px] text-yellow-200/70">{t('jackpotRolledOver')}</p>
              </div>
            )}

            {/* Total Prize Pool */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-600">
              <span className="text-[10px] text-gray-400 font-bold uppercase">{t('totalPrizePool')}</span>
              <span className="text-xs text-green-400 font-bold">{eventResult.totalPrizePool.toLocaleString()} <i className="fas fa-coins text-[9px]"></i></span>
            </div>
          </div>
        )}

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
                      {bet.lockedMultiplier > 1.0 ? (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 animate-pulse">
                          <i className="fas fa-fire mr-0.5 text-[8px]"></i>{bet.lockedMultiplier.toFixed(1)}x
                        </span>
                      ) : (
                        <span className="text-[10px] text-green-400 font-bold">{bet.lockedMultiplier.toFixed(1)}x</span>
                      )}
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
  const [showPastRounds, setShowPastRounds] = useState(false);

  // Classify rounds: a round is "past" if ALL its events are Finished
  const isRoundFinished = (round: Round) => {
    const roundEvents = events.filter(e => e.roundId === round.id);
    return roundEvents.length > 0 && roundEvents.every(e => e.status === EventStatus.FINISHED);
  };

  const activeRounds = rounds.filter(r => !isRoundFinished(r)).sort((a, b) => a.number - b.number);
  const pastRounds = rounds.filter(r => isRoundFinished(r)).sort((a, b) => b.number - a.number);

  // The single active round is the first one (lowest round number)
  const currentActiveRound = activeRounds.length > 0 ? activeRounds[0] : null;

  // Auto-select the active round if nothing selected or selected round is now past
  if (currentActiveRound && (!selectedRound || (selectedRound && isRoundFinished(selectedRound) && !showPastRounds))) {
    if (selectedRound?.id !== currentActiveRound.id) {
      onSelectRound(currentActiveRound);
    }
  } else if (!selectedRound && pastRounds.length > 0) {
    onSelectRound(pastRounds[0]);
  }

  const eventsForSelectedRound = events.filter(e => e.roundId === selectedRound?.id).sort((a,b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  const isSelectedRoundPast = selectedRound ? isRoundFinished(selectedRound) : false;

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      {/* Active Round Section */}
      <h2 className="text-2xl font-bold mb-4 text-red-500">
        <i className="fas fa-flag-checkered mr-2"></i>{t('activeRound')}
      </h2>

      {currentActiveRound ? (
        <div
          onClick={() => { onSelectRound(currentActiveRound); setShowPastRounds(false); }}
          className={`mb-4 p-4 rounded-lg cursor-pointer transition-all border-2 ${
            selectedRound?.id === currentActiveRound.id && !showPastRounds
              ? 'bg-red-900/30 border-red-600 shadow-lg shadow-red-900/20'
              : 'bg-gray-700 border-gray-600 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
                {t('activeRound')} — #{currentActiveRound.number}
              </span>
              <h3 className="text-lg font-bold text-white">{currentActiveRound.name}</h3>
              <p className="text-xs text-gray-400">{currentActiveRound.circuit}, {currentActiveRound.location}</p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/40 text-green-400 text-[10px] font-bold uppercase rounded-full border border-green-800">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                {t('live')}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 rounded-lg bg-gray-700 border border-gray-600 text-center">
          <i className="fas fa-hourglass-half text-gray-500 text-2xl mb-2"></i>
          <p className="text-gray-400 text-sm">{t('noActiveRound')}</p>
        </div>
      )}

      {/* Past Rounds Accordion */}
      {pastRounds.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowPastRounds(!showPastRounds)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-650 rounded-lg transition-colors text-left border border-gray-600"
          >
            <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <i className="fas fa-history text-gray-500"></i>
              {t('pastRounds')} ({pastRounds.length})
            </span>
            <i className={`fas fa-chevron-${showPastRounds ? 'up' : 'down'} text-gray-500 text-xs`}></i>
          </button>

          {showPastRounds && (
            <div className="mt-2 flex flex-wrap gap-2">
              {pastRounds.map(round => (
                <button
                  key={round.id}
                  onClick={() => onSelectRound(round)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedRound?.id === round.id
                      ? 'bg-gray-500 text-white ring-1 ring-gray-400'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                  }`}
                >
                  #{round.number} {round.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Round Events */}
      {selectedRound && (
        <div className={isSelectedRoundPast ? 'opacity-80' : ''}>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedRound.name}</h3>
              <p className="text-gray-400 text-sm">{selectedRound.circuit}, {selectedRound.location}</p>
            </div>
            {isSelectedRoundPast && (
              <span className="text-[10px] bg-gray-600 text-gray-300 px-2 py-1 rounded font-bold uppercase">
                {t('allEventsFinished')}
              </span>
            )}
          </div>
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
