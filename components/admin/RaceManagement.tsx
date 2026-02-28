
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Round, Event, EventType, EventStatus } from '../../types';
import ResultsForm from './ResultsForm';
import RaceResultsModal from '../RaceResultsModal';

const EventManagement: React.FC = () => {
  const { rounds, events, results, allBets, createEvent, updateEvent, deleteEvent } = useData();
  const [activeTab, setActiveTab] = useState<'manage' | 'results'>('manage');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedEventForResults, setSelectedEventForResults] = useState<Event | null>(null);
  const [viewResultEvent, setViewResultEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const [newEvent, setNewEvent] = useState({ 
    roundId: '', 
    type: EventType.MAIN_RACE, 
    date: '', 
    time: '', 
    betValue: '10' 
  });

  const handleOpenEventModal = () => {
    setEditingEvent(null);
    if (rounds.length === 0) {
      alert("Please create a Round before adding an event.");
      return;
    }
    // Sort rounds by the numeric part of their ID to find the most recently created one
    const latestRound = [...rounds].sort((a, b) => parseInt(b.id.replace('round', '')) - parseInt(a.id.replace('round', '')))[0];
    setNewEvent({
      roundId: latestRound.id,
      type: EventType.MAIN_RACE,
      date: '',
      time: '',
      betValue: '10'
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setEditingEvent(event);
    const d = event.date;
    const date = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    const time = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);

    setNewEvent({
        roundId: event.roundId,
        type: event.type,
        date: date,
        time: time,
        betValue: String(event.betValue),
    });
    setIsEventModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.roundId) {
        alert("Please select a round for the event.");
        return;
    }
    const [year, month, day] = newEvent.date.split('-').map(Number);
    const [hour, minute] = newEvent.time.split(':').map(Number);
    const eventDate = new Date(year, month - 1, day, hour, minute);

    if (editingEvent) {
        await updateEvent({
            ...editingEvent,
            roundId: newEvent.roundId,
            type: newEvent.type,
            date: eventDate,
            betValue: Number(newEvent.betValue),
        });
    } else {
        await createEvent({
            roundId: newEvent.roundId,
            type: newEvent.type,
            date: eventDate,
            betValue: Number(newEvent.betValue),
        });
    }
    handleCloseModal();
  };

  const openResultsModal = (event: Event) => {
    setSelectedEventForResults(event);
    setIsResultsModalOpen(true);
  };

  // Filter for Results Tab
  const finishedOrReadyEvents = events.filter(e => e.date < new Date() || e.status === EventStatus.FINISHED);

  return (
    <>
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-red-500">Event Management</h2>
        
        {/* Toggle Tabs */}
        <div className="flex space-x-2 bg-gray-700 rounded-lg p-1">
             <button 
                onClick={() => setActiveTab('manage')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}`}
             >
                Manage Events
             </button>
             <button 
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'results' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}`}
             >
                Event Results
             </button>
        </div>
      </div>

      {activeTab === 'manage' && (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button 
                    onClick={handleOpenEventModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                <i className="fas fa-plus mr-2"></i>
                Add New Event
                </button>
            </div>
            {rounds.map(round => (
                <div key={round.id}>
                    <h3 className="text-lg font-bold text-gray-200 mb-2 border-b border-gray-700 pb-1">#{round.number} {round.name}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-700 rounded-lg">
                        <thead>
                            <tr className="bg-gray-900">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Type</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Date</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Bet Value</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Pool</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {events.filter(e => e.roundId === round.id).sort((a, b) => a.date.getTime() - b.date.getTime()).map((event) => (
                            <tr key={event.id} className="hover:bg-gray-600">
                                <td className="py-3 px-4 text-sm text-white">{event.type}</td>
                                <td className="py-3 px-4 text-sm text-white">{event.date.toLocaleString()}</td>
                                <td className="py-3 px-4 text-sm text-white">{event.status}</td>
                                <td className="py-3 px-4 text-sm text-yellow-400">{event.betValue}</td>
                                <td className="py-3 px-4 text-sm text-green-400">{event.poolPrize}</td>
                                <td className="py-3 px-4 text-sm space-x-4">
                                <button onClick={() => handleOpenEditModal(event)} className="text-blue-400 hover:text-blue-300" title="Edit Event">
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    onClick={async () => {
                                      if (allBets.some(b => b.eventId === event.id)) {
                                        alert('Cannot delete event with existing bets.');
                                        return;
                                      }
                                      if (results.some(r => r.eventId === event.id)) {
                                        alert('Cannot delete event with existing results.');
                                        return;
                                      }
                                      if (window.confirm(`Are you sure you want to delete this ${event.type} event?`)) {
                                        try {
                                          await deleteEvent(event.id);
                                        } catch (err: any) {
                                          alert(err.message || 'Error deleting event');
                                        }
                                      }
                                    }} 
                                    className="text-red-400 hover:text-red-300" 
                                    title="Delete Event"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
            <p className="text-gray-400 mb-4">Input results for finished events to distribute prizes.</p>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 rounded-lg">
                <thead>
                    <tr className="bg-gray-900">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Event</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Date</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Total Purse</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Results Status</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Winners</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {finishedOrReadyEvents.sort((a,b) => b.date.getTime() - a.date.getTime()).map(event => {
                        const result = results.find(r => r.eventId === event.id);
                        return (
                            <tr key={event.id} className="hover:bg-gray-600">
                                <td className="py-3 px-4 text-sm text-white">
                                    <span className="font-bold block">{event.type}</span>
                                    <span className="text-xs text-gray-400">{rounds.find(r => r.id === event.roundId)?.name}</span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-300">{event.date.toLocaleDateString()}</td>
                                <td className="py-3 px-4 text-sm text-green-400 font-bold">{result ? result.totalPrizePool : event.poolPrize}</td>
                                <td className="py-3 px-4 text-sm">
                                    {result ? <span className="text-green-500 font-bold">Graded</span> : <span className="text-yellow-500">Pending</span>}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-300">
                                    {result ? (
                                        result.winners.length > 0 ? (
                                            <div className="flex flex-col">
                                                <span>{result.winners.length} Winner(s)</span>
                                                <span className="text-xs text-gray-500">Split: {Math.floor(result.totalPrizePool / result.winners.length)} ea.</span>
                                            </div>
                                        ) : 'No Winners'
                                    ) : '-'}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    {!result ? (
                                        <button 
                                            onClick={() => openResultsModal(event)} 
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Input Results
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setViewResultEvent(event)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            View Details
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                    {finishedOrReadyEvents.length === 0 && (
                        <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">No events ready for grading.</td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        </div>
      )}
    </div>

    {isEventModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
                <form onSubmit={handleEventSubmit}>
                    <div className="p-4 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Round</label>
                            <select value={newEvent.roundId} onChange={e => setNewEvent({...newEvent, roundId: e.target.value})} className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required>
                                {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Event Type</label>
                            <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})} className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required>
                                {Object.values(EventType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Date</label>
                                <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required/>
                            </div>
                             <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Time</label>
                                <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Bet Value (Fun-Coins)</label>
                            <input type="number" min="0" value={newEvent.betValue} onChange={e => setNewEvent({...newEvent, betValue: e.target.value})} className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required/>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-900 flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">{editingEvent ? 'Update Event' : 'Create Event'}</button>
                    </div>
                </form>
            </div>
        </div>
    )}

    {isResultsModalOpen && selectedEventForResults && (
        <ResultsForm event={selectedEventForResults} onClose={() => setIsResultsModalOpen(false)} />
    )}

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

export default EventManagement;
