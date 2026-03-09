
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Bet } from '../../types';

const BetManagement: React.FC = () => {
    const { allBets, users, events, rounds, cancelBet } = useData();
    const [viewBet, setViewBet] = useState<Bet | null>(null);

    const handleCancel = async (betId: string) => {
        if (window.confirm('Are you sure you want to cancel this bet? The user will be refunded.')) {
            try {
                await cancelBet(betId);
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    const getViewDetails = (bet: Bet) => {
        const user = users.find(u => u.id === bet.userId);
        const event = events.find(e => e.id === bet.eventId);
        const round = event ? rounds.find(r => r.id === event.roundId) : undefined;
        return { user, event, round };
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Bet Slip Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 rounded-lg">
                    <thead>
                        <tr className="bg-gray-900">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Bet ID</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">User</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Round</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Event</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Date</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Status</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {[...allBets].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((bet) => {
                            const { user, event, round } = getViewDetails(bet);
                            return (
                                <tr key={bet.id} className="hover:bg-gray-600">
                                    <td className="py-3 px-4 text-sm text-gray-400 font-mono">{bet.id}</td>
                                    <td className="py-3 px-4 text-sm text-white">{user?.username || 'Unknown'}</td>
                                    <td className="py-3 px-4 text-sm text-white">{round ? `R${round.number} — ${round.name}` : '—'}</td>
                                    <td className="py-3 px-4 text-sm text-white">{event?.type || 'Unknown'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-400">{bet.timestamp.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            bet.status === 'Active' ? 'bg-green-900 text-green-300' :
                                            bet.status === 'Cancelled' ? 'bg-red-900 text-red-300' :
                                            'bg-gray-600 text-gray-300'
                                        }`}>
                                            {bet.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm flex space-x-2">
                                        <button 
                                            onClick={() => setViewBet(bet)}
                                            className="text-blue-400 hover:text-blue-300 flex items-center"
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye mr-1"></i> View
                                        </button>
                                        {bet.status === 'Active' && (
                                            <button 
                                                onClick={() => handleCancel(bet.id)} 
                                                className="text-red-400 hover:text-red-300 flex items-center"
                                                title="Cancel Bet & Refund"
                                            >
                                                <i className="fas fa-ban mr-1"></i> Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {allBets.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-4 text-center text-gray-400">No bets placed yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {viewBet && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                             <h3 className="text-xl font-bold text-white">Bet Detail</h3>
                             <button onClick={() => setViewBet(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
                        </div>
                        <div className="p-4 space-y-4">
                             {(() => {
                                 const { user, event, round } = getViewDetails(viewBet);
                                 return (
                                     <>
                                        {round && (
                                          <div className="bg-gray-700 rounded p-3 mb-3">
                                            <p className="text-white font-bold">R{round.number} — {round.name}</p>
                                            <p className="text-gray-400 text-xs">{round.circuit}, {round.location}</p>
                                          </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400">User</p>
                                                <p className="text-white font-semibold">{user?.username}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Event</p>
                                                <p className="text-white font-semibold">{event?.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Placed On</p>
                                                <p className="text-white font-semibold">{viewBet.timestamp.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Value</p>
                                                <p className="text-yellow-400 font-bold">{event?.betValue} Coins</p>
                                            </div>
                                             <div>
                                                <p className="text-gray-400">Locked Multiplier</p>
                                                <p className="text-green-400 font-bold">{viewBet.lockedMultiplier}x</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Status</p>
                                                <p className="text-white font-semibold">{viewBet.status}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-700 rounded p-3">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-2">Driver Predictions</p>
                                            <ol className="list-decimal list-inside text-sm space-y-1">
                                                {viewBet.predictions.map((p, idx) => (
                                                    <li key={idx} className="text-white">
                                                        <span className="text-gray-300 mr-2">{p.name}</span>
                                                        <span className="text-xs text-gray-500">({p.teamName})</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        {viewBet.teamPredictions && (
                                            <div className="bg-gray-700 rounded p-3">
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-2">Team Predictions</p>
                                                <ol className="list-decimal list-inside text-sm space-y-1">
                                                    {viewBet.teamPredictions.map((t, idx) => (
                                                        <li key={idx} className="text-white">
                                                            <span className="text-gray-300 mr-2">{t.name}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )}
                                     </>
                                 )
                             })()}
                        </div>
                        <div className="p-4 border-t border-gray-700 flex justify-end sticky bottom-0 bg-gray-800">
                            <button onClick={() => setViewBet(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BetManagement;
