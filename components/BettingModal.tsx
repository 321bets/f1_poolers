
import React, { useState, useEffect, useRef } from 'react';
import { Event, Driver, Team, Bet, EventType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getMultiplierStats } from './RoundSelector';

const getLastName = (fullName: string) => {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : fullName;
};

// Driver Component
const DriverCircle: React.FC<{ 
    driver: Driver; 
    isDraggable: boolean; 
    isSelected: boolean;
    onSelect: (driver: Driver) => void;
}> = ({ driver, isDraggable, isSelected, onSelect }) => {
    return (
        <div
            draggable={isDraggable}
            onClick={() => !isSelected && onSelect(driver)}
            onDragStart={(e) => {
                if (isDraggable && !isSelected) {
                    e.dataTransfer.setData('type', 'driver');
                    e.dataTransfer.setData('id', driver.id);
                }
            }}
            className={`flex flex-col items-center p-1 rounded-lg text-center transition-all active:scale-90 select-none ${
                isSelected ? 'opacity-40 grayscale cursor-default' : 
                isDraggable ? 'cursor-pointer hover:bg-gray-700 active:bg-gray-600' : 'cursor-not-allowed opacity-30'
            }`}
        >
            <div className="relative">
                <img src={driver.imageUrl} alt={driver.name} className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full mb-1 border-2 object-cover pointer-events-none ${isSelected ? 'border-gray-500' : 'border-red-600 shadow-lg shadow-red-900/20'}`} />
                {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                        <i className="fas fa-check text-white text-[8px]"></i>
                    </div>
                )}
            </div>
            <div className="w-full pointer-events-none">
                <p className={`font-bold text-[9px] sm:text-xs truncate w-full ${isSelected ? 'text-gray-500' : 'text-white'}`}>{getLastName(driver.name)}</p>
                <p className="text-[7px] sm:text-[9px] text-gray-500 truncate w-full">{driver.teamName}</p>
            </div>
        </div>
    );
};

// Team Component
const TeamCircle: React.FC<{ 
    team: Team; 
    isDraggable: boolean; 
    isSelected: boolean;
    onSelect: (team: Team) => void;
}> = ({ team, isDraggable, isSelected, onSelect }) => {
    return (
        <div
            draggable={isDraggable}
            onClick={() => !isSelected && onSelect(team)}
            onDragStart={(e) => {
                if (isDraggable && !isSelected) {
                    e.dataTransfer.setData('type', 'team');
                    e.dataTransfer.setData('id', team.id);
                }
            }}
            className={`flex flex-col items-center p-1 rounded-lg text-center transition-all active:scale-90 select-none ${
                isSelected ? 'opacity-40 grayscale cursor-default' : 
                isDraggable ? 'cursor-pointer hover:bg-gray-700 active:bg-gray-600' : 'cursor-not-allowed opacity-30'
            }`}
        >
            <div className="relative">
                <div className={`w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-full mb-1 border-2 flex items-center justify-center p-1 pointer-events-none ${isSelected ? 'border-gray-500' : 'border-blue-600 shadow-lg shadow-blue-900/20'}`}>
                    <img src={team.logoUrl} alt={team.name} className="max-w-full max-h-full object-contain" />
                </div>
                {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                        <i className="fas fa-check text-white text-[8px]"></i>
                    </div>
                )}
            </div>
            <div className="w-full pointer-events-none">
                <p className={`font-bold text-[9px] sm:text-xs truncate w-full ${isSelected ? 'text-gray-500' : 'text-white'}`}>{team.name}</p>
            </div>
        </div>
    );
};

interface BettingModalProps {
  event: Event;
  onClose: () => void;
  onBetPlaced: (bet: Omit<Bet, 'id' | 'timestamp'>) => void;
}

const BettingModal: React.FC<BettingModalProps> = ({ event, onClose, onBetPlaced }) => {
  const { user } = useAuth();
  const { drivers, teams, placeBet, events, allBets } = useData();
  const { t } = useLanguage();
  
  const liveEvent = events.find(e => e.id === event.id) || event;
  const [activeTab, setActiveTab] = useState<'drivers' | 'teams'>('drivers');
  const [driverPredictions, setDriverPredictions] = useState<(Driver | null)[]>(Array(5).fill(null));
  const [teamPredictions, setTeamPredictions] = useState<(Team | null)[]>(Array(5).fill(null));
  const [focusedSlot, setFocusedSlot] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('--:--:--:---');
  const [multiplier, setMultiplier] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const availableDrivers = drivers.sort((a,b) => a.name.localeCompare(b.name));
  const availableTeams = teams.sort((a,b) => a.name.localeCompare(b.name));

  const isDriversReady = driverPredictions.every(p => p !== null);
  const isTeamsReady = teamPredictions.every(p => p !== null);
  const isCurrentTabReady = activeTab === 'drivers' ? isDriversReady : isTeamsReady;
  const isBothReady = isDriversReady && isTeamsReady;

  // --- BET LIMIT LOGIC ---
  const MAX_BETS = 4;
  const userEventBets = allBets.filter(b => b.userId === user?.id && b.eventId === liveEvent.id && b.status === 'Active');
  const betsRemaining = MAX_BETS - userEventBets.length;
  const hasReachedLimit = betsRemaining <= 0;

  // Suggest other events in the same round
  const otherEvents = events.filter(e => e.roundId === liveEvent.roundId && e.id !== liveEvent.id && e.status === 'Upcoming');

  useEffect(() => {
    const updateTimer = () => {
      const { multiplier: currentMult, nextTierDiff } = getMultiplierStats(liveEvent.date);
      setMultiplier(currentMult);
      if (nextTierDiff < 0) {
        setTimeLeft('00:00:00:000');
        return;
      }
      const h = Math.floor(nextTierDiff / (1000 * 60 * 60));
      const m = Math.floor((nextTierDiff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((nextTierDiff % (1000 * 60)) / 1000);
      const ms = Math.floor(nextTierDiff % 1000);
      setTimeLeft(`${h < 10 ? '0'+h : h}:${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}:${ms < 100 ? (ms < 10 ? '00'+ms : '0'+ms) : ms}`);
    };
    const interval = setInterval(updateTimer, 31);
    updateTimer();
    return () => clearInterval(interval);
  }, [liveEvent.date]);

  const handleEntitySelect = (entity: Driver | Team) => {
    if (hasReachedLimit) return;
    const isDriver = 'teamName' in entity;
    
    if (isDriver) {
        if (driverPredictions.some(p => p?.id === entity.id)) return;
        const targetSlot = focusedSlot !== null ? focusedSlot : driverPredictions.findIndex(p => p === null);
        if (targetSlot !== -1) {
            const newPreds = [...driverPredictions];
            newPreds[targetSlot] = entity as Driver;
            setDriverPredictions(newPreds);
            setFocusedSlot(null);
        }
    } else {
        const count = teamPredictions.filter(p => p?.id === entity.id).length;
        if (count >= 2) return;
        const targetSlot = focusedSlot !== null ? focusedSlot : teamPredictions.findIndex(p => p === null);
        if (targetSlot !== -1) {
            const newPreds = [...teamPredictions];
            newPreds[targetSlot] = entity as Team;
            setTeamPredictions(newPreds);
            setFocusedSlot(null);
        }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (hasReachedLimit) return;
    const type = e.dataTransfer.getData('type');
    const id = e.dataTransfer.getData('id');
    if (activeTab === 'drivers' && type === 'driver') {
        const driver = drivers.find(d => d.id === id);
        if (driver) {
            const newPreds = [...driverPredictions];
            newPreds[index] = driver;
            setDriverPredictions(newPreds);
        }
    } else if (activeTab === 'teams' && type === 'team') {
        const team = teams.find(t => t.id === id);
        if (team) {
            const newPreds = [...teamPredictions];
            newPreds[index] = team;
            setTeamPredictions(newPreds);
        }
    }
  };

  const removePrediction = (index: number) => {
    if (activeTab === 'drivers') {
        const newPreds = [...driverPredictions];
        newPreds[index] = null;
        setDriverPredictions(newPreds);
    } else {
        const newPreds = [...teamPredictions];
        newPreds[index] = null;
        setTeamPredictions(newPreds);
    }
  };

  const handleSubmit = async (submitBoth: boolean = false) => {
    if (!user) return;
    setError('');

    // Time-based cutoff: prevent submission if event has already started
    if (Date.now() >= liveEvent.date.getTime()) {
        setError('Betting is closed — this event has already started.');
        return;
    }
    
    if (submitBoth) {
        // Submit both drivers and teams together
        if (!isDriversReady || !isTeamsReady) {
            setError(t('fillAllSlotsBoth'));
            return;
        }
    } else {
        // Submit only current tab
        const currentPreds = activeTab === 'drivers' ? driverPredictions : teamPredictions;
        if (currentPreds.some(p => p === null)) {
            setError(t('fillAllSlots'));
            return;
        }
    }

    if (hasReachedLimit) {
        setError(t('betLimitReached'));
        return;
    }

    setIsLoading(true);
    try {
        if (submitBoth) {
            // Submit drivers and teams in a single bet
            await placeBet({
                userId: user.id,
                eventId: liveEvent.id,
                predictions: driverPredictions as Driver[],
                teamPredictions: teamPredictions as Team[]
            });
            onBetPlaced({ 
                userId: user.id, 
                eventId: liveEvent.id, 
                predictions: driverPredictions as Driver[],
                teamPredictions: teamPredictions as Team[],
                status: 'Active',
                lockedMultiplier: multiplier
            });
        } else {
            const isDrivers = activeTab === 'drivers';
            await placeBet({
                userId: user.id,
                eventId: liveEvent.id,
                predictions: isDrivers ? (driverPredictions as Driver[]) : [],
                teamPredictions: !isDrivers ? (teamPredictions as Team[]) : []
            });
            onBetPlaced({ 
                userId: user.id, 
                eventId: liveEvent.id, 
                predictions: isDrivers ? (driverPredictions as Driver[]) : [],
                teamPredictions: !isDrivers ? (teamPredictions as Team[]) : [],
                status: 'Active',
                lockedMultiplier: multiplier
            });
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-1 sm:p-4 backdrop-blur-xl">
      <div className="bg-[#1f1f27] rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[98vh] flex flex-col border border-gray-800 overflow-hidden font-['Titillium_Web']">
        
        {/* Header */}
        <div className="p-3 sm:p-4 bg-[#15151e] border-b border-gray-800 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase italic tracking-tighter">
                <span className="text-red-600 mr-1 sm:mr-2">P5</span> Slip
            </h2>
            <div className="flex flex-col">
                <div className="flex items-center gap-2 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                    <span className="text-[10px] sm:text-xs text-white font-bold">{liveEvent.type}</span>
                </div>
                {/* Bet Slot Tracker */}
                <div className={`text-[8px] font-black uppercase mt-0.5 tracking-widest ${betsRemaining === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {userEventBets.length} {t('of')} {MAX_BETS} {t('slotsUsed')}
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[8px] sm:text-[9px] text-gray-500 uppercase font-black">{t('mult')}</span>
                {multiplier > 1.0 ? (
                  <span className="font-black text-xs sm:text-sm leading-none px-2 py-0.5 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 animate-pulse">
                    <i className="fas fa-fire mr-0.5 text-[9px]"></i>{multiplier.toFixed(1)}x
                  </span>
                ) : (
                  <span className="text-green-500 font-black text-xs sm:text-sm leading-none">{multiplier.toFixed(1)}x</span>
                )}
             </div>
             <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl sm:text-3xl font-light ml-2 sm:ml-4 transition-colors">&times;</button>
          </div>
        </div>

        {/* Dynamic Allowance Status */}
        <div className={`p-2 sm:p-3 text-center border-b flex-shrink-0 text-[10px] sm:text-xs font-bold uppercase italic tracking-widest ${
            hasReachedLimit ? 'bg-red-900/20 border-red-800/40 text-red-400' : 'bg-blue-900/10 border-blue-800/40 text-blue-300'
        }`}>
            {hasReachedLimit ? (
                <span><i className="fas fa-lock mr-2"></i> {t('limitReachedMsg')}</span>
            ) : (
                <span><i className="fas fa-info-circle mr-2"></i> {t('betsRemainingMsg')}</span>
            )}
        </div>

        {/* Round Suggestions - Pro-Tip */}
        {otherEvents.length > 0 && (
            <div className="bg-gray-800/30 px-3 py-1.5 border-b border-gray-800/50 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar">
                <span className="text-[9px] text-gray-500 font-black uppercase shrink-0">{t('diversifyRound')}:</span>
                {otherEvents.map(e => (
                    <button key={e.id} onClick={onClose} className="text-[9px] bg-gray-700 hover:bg-gray-600 text-white px-2 py-0.5 rounded transition-colors whitespace-nowrap">
                        {t('predict')} {e.type}
                    </button>
                ))}
            </div>
        )}

        {/* Interaction Hint */}
        {!hasReachedLimit && (
            <div className="bg-[#15151e] border-b border-gray-800 px-3 py-1.5 text-[9px] text-gray-500 text-center flex-shrink-0">
                <i className="fas fa-hand-pointer mr-1"></i> {t('tapHint')}
            </div>
        )}

        {/* Selector Tabs with Progress */}
        <div className="flex bg-[#15151e] border-b border-gray-800 flex-shrink-0">
            <button onClick={() => { setActiveTab('drivers'); setFocusedSlot(null); }} className={`flex-1 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'drivers' ? 'text-red-600 bg-[#1f1f27] border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-300'}`}>
                {t('drivers')}
                <span className={`text-[8px] px-1.5 py-0.5 rounded ${isDriversReady ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {driverPredictions.filter(p => p !== null).length}/5
                </span>
            </button>
            <button onClick={() => { setActiveTab('teams'); setFocusedSlot(null); }} className={`flex-1 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'teams' ? 'text-blue-500 bg-[#1f1f27] border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
                {t('teams')}
                <span className={`text-[8px] px-1.5 py-0.5 rounded ${isTeamsReady ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {teamPredictions.filter(p => p !== null).length}/5
                </span>
            </button>
        </div>

        {/* Main Interaction Area */}
        <div className={`flex-1 flex flex-col md:flex-row overflow-hidden ${hasReachedLimit ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          
          {/* GRID SECTION (Left/Top) */}
          <div className="w-full md:w-3/5 p-3 sm:p-4 bg-[#15151e] flex flex-col h-1/2 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-gray-800">
              <div className="flex justify-between items-center mb-2 sm:mb-4 flex-shrink-0">
                <h3 className="text-[9px] sm:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="bg-red-600 w-1 h-3"></span>
                    {t('availableLabel')}
                </h3>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 overflow-y-auto pr-1 custom-scrollbar">
                  {activeTab === 'drivers' 
                    ? availableDrivers.map(d => (
                        <DriverCircle 
                            key={d.id} 
                            driver={d} 
                            isDraggable={!hasReachedLimit} 
                            isSelected={driverPredictions.some(p => p?.id === d.id)}
                            onSelect={handleEntitySelect}
                        />
                      ))
                    : availableTeams.map(t => (
                        <TeamCircle 
                            key={t.id} 
                            team={t} 
                            isDraggable={!hasReachedLimit} 
                            isSelected={teamPredictions.filter(p => p?.id === t.id).length >= 2}
                            onSelect={handleEntitySelect}
                        />
                      ))
                  }
              </div>
          </div>

          {/* SLOTS SECTION (Right/Bottom) */}
          <div className="w-full md:w-2/5 p-3 sm:p-4 bg-[#1f1f27] flex flex-col h-1/2 md:h-full overflow-hidden">
            <h3 className="text-[9px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-4 flex items-center gap-2 flex-shrink-0">
                <span className="bg-green-600 w-1 h-3"></span>
                {t('predictionLabel')}
            </h3>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                {(activeTab === 'drivers' ? driverPredictions : teamPredictions).map((item, index) => (
                    <div 
                        key={index} 
                        onClick={() => !hasReachedLimit && setFocusedSlot(index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragOver={(e) => e.preventDefault()}
                        className={`group relative flex items-center gap-3 p-1.5 sm:p-3 rounded border transition-all cursor-pointer flex-shrink-0 ${
                            focusedSlot === index ? 'border-red-600 bg-red-600/5 shadow-[0_0_10px_rgba(225,6,0,0.1)]' : 
                            item ? 'border-gray-700 bg-black/20 hover:border-gray-600' : 'border-dashed border-gray-800 hover:border-gray-700'
                        }`}
                    >
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-full font-black italic text-sm sm:text-xl flex-shrink-0 border transition-colors ${
                            item ? 'bg-black border-red-600 text-white' : 'bg-[#15151e] border-gray-800 text-gray-700'
                        }`}>
                            {item ? (
                                <img 
                                    src={(item as Driver).imageUrl || (item as Team).logoUrl} 
                                    alt={item.name} 
                                    className={`w-full h-full rounded-full ${activeTab === 'teams' ? 'object-contain p-1 bg-white' : 'object-cover'}`} 
                                />
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                            {item ? (
                                <div className="animate-in fade-in slide-in-from-left-2">
                                    <p className="font-black text-xs sm:text-base text-white uppercase italic truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                                        {activeTab === 'drivers' ? (item as Driver).teamName : t('constructorSlot')}
                                    </p>
                                </div>
                            ) : (
                                <p className={`text-[8px] sm:text-[10px] uppercase font-black tracking-widest ${focusedSlot === index ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
                                    {focusedSlot === index ? t('awaiting') : `${t('selectP')}${index + 1}`}
                                </p>
                            )}
                        </div>

                        {item && !hasReachedLimit && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); removePrediction(index); }} 
                                className="text-gray-600 hover:text-red-500 transition-colors p-1"
                            >
                                <i className="fas fa-times text-xs"></i>
                            </button>
                        )}
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#15151e] border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="flex flex-col w-full sm:w-auto">
                <div className="flex items-center gap-4 justify-between sm:justify-start">
                    <span className="text-[9px] text-gray-500 uppercase font-black">{t('entryFee')}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-500 font-black text-xs sm:text-sm tracking-tight">{liveEvent.betValue} <span className="text-[8px] text-gray-500">({t('singleLabel')})</span></span>
                        <span className="text-gray-600">|</span>
                        <span className="text-green-500 font-black text-xs sm:text-sm tracking-tight">{liveEvent.betValue * 2} <span className="text-[8px] text-gray-500">({t('comboLabel')})</span></span>
                    </div>
                </div>
                {error && <p className="text-red-500 text-[8px] sm:text-[10px] font-bold uppercase mt-1">{error}</p>}
                {hasReachedLimit && (
                    <p className="text-gray-400 text-[8px] sm:text-[10px] font-bold uppercase mt-1 italic">
                        {t('tryDifferentSession')}
                    </p>
                )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
                <button 
                    onClick={onClose}
                    className="flex-1 sm:flex-none border border-gray-700 text-gray-400 font-bold py-2 px-4 rounded-sm uppercase text-[10px] sm:text-xs tracking-widest hover:bg-gray-800 transition-colors"
                >
                    {hasReachedLimit ? t('back') : t('cancel')}
                </button>
                {hasReachedLimit ? (
                    <button 
                      onClick={onClose}
                      className="flex-[2] sm:flex-none bg-blue-600 text-white font-black py-2 px-6 sm:px-10 rounded-sm uppercase tracking-widest italic transition-all hover:bg-blue-700 transform -skew-x-12 shadow-lg shadow-blue-900/20"
                    >
                      <span className="inline-block transform skew-x-12 text-[10px] sm:text-sm">{t('chooseOtherEvent')}</span>
                    </button>
                ) : (
                    <div className="flex gap-2 flex-[2]">
                        <button 
                          onClick={() => handleSubmit(false)}
                          disabled={!isCurrentTabReady || isLoading}
                          className="flex-1 bg-red-600 text-white font-black py-2 px-3 sm:px-6 rounded-sm uppercase tracking-widest italic transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 transform -skew-x-12 shadow-lg shadow-red-900/20"
                        >
                          <span className="inline-block transform skew-x-12 text-[8px] sm:text-xs">
                            {isLoading ? t('wait') : (activeTab === 'drivers' ? t('driversOnly') : t('teamsOnly'))}
                          </span>
                        </button>
                        <button 
                          onClick={() => handleSubmit(true)}
                          disabled={!isBothReady || isLoading}
                          className="flex-1 bg-green-600 text-white font-black py-2 px-3 sm:px-6 rounded-sm uppercase tracking-widest italic transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-green-700 transform -skew-x-12 shadow-lg shadow-green-900/20"
                        >
                          <span className="inline-block transform skew-x-12 text-[8px] sm:text-xs">
                            {isLoading ? t('wait') : t('bothCombo')}
                          </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BettingModal;
