
import React, { useState, useEffect } from 'react';
import { Round, Event, EventType, EventStatus } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import RaceResultsModal from './RaceResultsModal';

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
            return 'border-l-4 border-gray-500 opacity-90';
        case EventStatus.LIVE:
            return 'border-l-4 border-green-500 ring-1 ring-green-500';
        default:
            return 'border-l-4 border-transparent';
    }
}

// Exported for use in BettingModal and other components to ensure consistent logic
export const getMultiplierStats = (eventDate: Date) => {
    const now = new Date().getTime();
    const eventTime = eventDate.getTime();
    const diff = eventTime - now; // milliseconds
    const seconds = diff / 1000;

    let multiplier = 1.0;
    let nextTierDiff = diff; // Default: Time until event start (0)

    if (seconds > 432000) { // > 5 days (432,000 seconds)
        multiplier = 5.0;
        nextTierDiff = diff - (432000 * 1000); // Time remaining until the 5-day mark passed
    } else if (seconds > 259200) { // > 3 days (259,200 seconds)
        multiplier = 3.0;
        nextTierDiff = diff - (259200 * 1000); // Time remaining until the 3-day mark passed
    } else if (seconds > 86400) { // > 1 day (86,400 seconds)
        multiplier = 1.5;
        nextTierDiff = diff - (86400 * 1000); // Time remaining until the 1-day mark passed
    } else {
        multiplier = 1.0;
        nextTierDiff = diff; // Time remaining until betting closes (event start)
    }
    
    return { multiplier, nextTierDiff };
}

const PointsLegend: React.FC<{ type: EventType }> = ({ type }) => {
    let exact = [0,0,0,0,0];
    let partial = 0;
    
    if (type === EventType.MAIN_RACE) { exact = [25, 18, 15, 12, 10]; partial = 5; }
    else if (type === EventType.SPRINT_RACE) { exact = [8, 7, 6, 5, 4]; partial = 2; }
    else if (type === EventType.QUALIFYING) { exact = [18, 15, 12, 9, 6]; partial = 3; }
    else return (
        <div className="mt-3 p-2 bg-gray-800 rounded text-center border border-gray-700">
             <p className="text-xs text-gray-500 italic">No points awarded for Practice sessions.</p>
        </div>
    );

    return (
        <div className="mt-3 bg-gray-900 rounded-lg p-3 border border-gray-600">
            <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Points Structure</span>
                <span className="text-[10px] text-gray-500">Exact Match</span>
            </div>
            <div className="grid grid-cols-5 gap-1 mb-2">
                {exact.map((pts, i) => (
                    <div key={i} className="bg-gray-800 rounded flex flex-col items-center py-1 border border-gray-700">
                        <span className="text-[9px] text-gray-500 font-bold uppercase">P{i+1}</span>
                        <span className="text-sm font-bold text-white">{pts}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center bg-gray-800 px-2 py-1.5 rounded border border-gray-700">
                 <span className="text-[10px] text-gray-400">Right Driver, Wrong Pos</span>
                 <span className="text-xs font-bold text-blue-300">{partial} pts</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-[10px] text-gray-400 mb-1">
                    <i className="fas fa-users-cog mr-1"></i> Team bets earn <strong className="text-white">50%</strong> of driver points.
                </p>
                <div className="text-[10px] text-center text-yellow-500 font-bold flex items-center justify-center">
                    <i className="fas fa-trophy mr-1"></i>
                    "Nail the Result" (Top 5 Exact Drivers) = Pot Share
                </div>
            </div>
        </div>
    )
}

const EventCard: React.FC<{ event: Event; onPlaceBet: (e: Event) => void; onViewResults: (e: Event) => void }> = ({ event, onPlaceBet, onViewResults }) => {
    const { user } = useAuth();
    const userTz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
    const [multiplier, setMultiplier] = useState(1.0);
    const [countdown, setCountdown] = useState('--:--:--:---');
    const [eventStarted, setEventStarted] = useState(Date.now() >= event.date.getTime());

    useEffect(() => {
        const updateTimer = () => {
            const { multiplier: currentMult, nextTierDiff } = getMultiplierStats(event.date);
            setMultiplier(currentMult);
            setEventStarted(Date.now() >= event.date.getTime());

            if (nextTierDiff < 0) {
                setCountdown('00:00:00:000');
                return;
            }

            const h = Math.floor(nextTierDiff / (1000 * 60 * 60));
            const m = Math.floor((nextTierDiff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((nextTierDiff % (1000 * 60)) / 1000);
            const ms = Math.floor(nextTierDiff % 1000);
            
            const hStr = h < 10 ? `0${h}` : `${h}`;
            const mStr = m < 10 ? `0${m}` : `${m}`;
            const sStr = s < 10 ? `0${s}` : `${s}`;
            // Ensure 3 digits for milliseconds
            const msStr = ms < 10 ? `00${ms}` : ms < 100 ? `0${ms}` : `${ms}`;

            setCountdown(`${hStr}:${mStr}:${sStr}:${msStr}`);
        };

        const interval = setInterval(updateTimer, 31);
        updateTimer();
        return () => clearInterval(interval);
    }, [event.date]);

    return (
        <div className={`bg-gray-700 p-4 rounded-lg shadow-lg flex flex-col h-full relative overflow-hidden ${getStatusClasses(event.status)}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3 relative z-10">
                <div className={`text-white text-xs font-bold px-2 py-1 rounded shadow-sm ${eventTypeColors[event.type]}`}>
                    {event.type}
                </div>
                {event.status === EventStatus.UPCOMING && (
                     <div className="text-right bg-gray-800 px-2 py-1 rounded border border-gray-600" title="Time remaining until this multiplier expires">
                        <p className="text-[10px] text-gray-400 uppercase">Multiplier Ends In</p>
                        <p className="text-xs font-mono font-bold text-white tracking-widest">{countdown}</p>
                    </div>
                )}
            </div>
            
            <p className="text-xs text-gray-300 mb-3 flex items-center">
                <i className="far fa-calendar-alt mr-1.5 opacity-70"></i>
                {event.date.toLocaleString(undefined, { timeZone: userTz })}
            </p>
            
            {/* Stats Block */}
            <div className="bg-gray-600 bg-opacity-50 p-3 rounded-lg border border-gray-500 border-opacity-30 mb-auto">
                <div className="flex justify-between items-center border-b border-gray-500 border-opacity-30 pb-2 mb-2">
                    <div>
                        <p className="text-[10px] text-gray-300 uppercase tracking-wide">Entry Fee</p>
                        <p className="font-bold text-yellow-400">{event.betValue} <i className="fas fa-coins text-[10px]"></i></p>
                    </div>
                    <div className="text-right">
                         <p className="text-[10px] text-gray-300 uppercase tracking-wide">Prize Pot</p>
                         <p className="font-bold text-green-400">{event.poolPrize.toLocaleString()} <i className="fas fa-coins text-[10px]"></i></p>
                    </div>
                </div>
                {event.status === EventStatus.UPCOMING && (
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-200">Current Points Multiplier:</span>
                        <span className="text-lg font-bold text-white bg-red-600 px-2 rounded shadow-sm border border-red-500">{multiplier.toFixed(1)}x</span>
                    </div>
                )}
            </div>

            {/* Points Structure */}
            <PointsLegend type={event.type} />

            {/* Actions */}
            <div className="mt-4">
                {event.status === EventStatus.UPCOMING && !eventStarted && (
                    <button onClick={() => onPlaceBet(event)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-3 text-sm rounded shadow transition-transform transform hover:scale-[1.02]">
                        Place Prediction
                    </button>
                )}
                {event.status === EventStatus.UPCOMING && eventStarted && (
                    <button disabled className="w-full bg-yellow-700 text-yellow-200 font-bold py-2.5 px-3 text-sm rounded cursor-not-allowed border border-yellow-600">
                        <i className="fas fa-lock mr-1"></i> Betting Closed
                    </button>
                )}
                {event.status === EventStatus.FINISHED && (
                    <button onClick={() => onViewResults(event)} className="w-full bg-gray-500 hover:bg-gray-400 text-white font-bold py-2.5 px-3 text-sm rounded transition-colors">
                        View Official Results
                    </button>
                )}
                {event.status === EventStatus.LIVE && (
                    <button disabled className="w-full bg-gray-600 text-gray-400 font-bold py-2.5 px-3 text-sm rounded cursor-not-allowed border border-gray-500">
                        Event in Progress
                    </button>
                )}
            </div>
        </div>
    );
};

const RoundSelector: React.FC<RoundSelectorProps> = ({ selectedRound, onSelectRound, onPlaceBet }) => {
  const { rounds, events, results } = useData();
  const [viewResultEvent, setViewResultEvent] = useState<Event | null>(null);

  if (!selectedRound && rounds.length > 0) {
    onSelectRound(rounds[0]);
  }

  const eventsForSelectedRound = events.filter(e => e.roundId === selectedRound?.id).sort((a,b) => a.date.getTime() - b.date.getTime());

  const handleViewResults = (event: Event) => {
      const result = results.find(r => r.eventId === event.id);
      if (result) {
          setViewResultEvent(event);
      } else {
          alert("Results have not been posted by the admins yet.");
      }
  };

  return (
    <>
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-red-500 flex items-center">
          <i className="fas fa-calendar-week mr-2"></i>
          Event Schedule
      </h2>
      <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
        {rounds.map(round => (
          <button
            key={round.id}
            onClick={() => onSelectRound(round)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 whitespace-nowrap border ${
              selectedRound?.id === round.id 
              ? 'bg-red-600 text-white border-red-500 shadow-md' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
            }`}
          >
            <span className="opacity-70 mr-1">#{round.number}</span> {round.name}
          </button>
        ))}
      </div>
      
      {selectedRound && (
        <div className="animate-fade-in">
          <div className="mb-6">
             <h3 className="text-2xl font-bold text-white">{selectedRound.name}</h3>
             <p className="text-gray-400 flex items-center mt-1">
                 <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
                 {selectedRound.circuit}, {selectedRound.location}
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsForSelectedRound.map(event => (
                <EventCard 
                    key={event.id} 
                    event={event} 
                    onPlaceBet={onPlaceBet} 
                    onViewResults={handleViewResults} 
                />
            ))}
            {eventsForSelectedRound.length === 0 && (
                <div className="col-span-full text-center py-10 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 text-gray-400">
                    No events scheduled for this round yet.
                </div>
            )}
          </div>
        </div>
      )}
    </div>

    {viewResultEvent && results.find(r => r.eventId === viewResultEvent.id) && (
        <RaceResultsModal 
            event={viewResultEvent}
            result={results.find(r => r.eventId === viewResultEvent.id)!}
            onClose={() => setViewResultEvent(null)}
        />
    )}
    </>
  );
};

export default RoundSelector;
