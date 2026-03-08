
import React, { useState } from 'react';
import { Event, Result, Bet } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

interface RaceResultsModalProps {
  event: Event;
  result: Result;
  onClose: () => void;
}

const RaceResultsModal: React.FC<RaceResultsModalProps> = ({ event, result, onClose }) => {
  const { rounds, allBets, users } = useData();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'podium' | 'scoreboard'>('podium');
  const [searchQuery, setSearchQuery] = useState('');
  
  const round = rounds.find(r => r.id === event.roundId);
  
  // Get all bets for this specific event to build the full scoreboard
  const eventBets = allBets.filter(b => b.eventId === event.id && b.status === 'Settled');

  // Map bets to users and calculate their specific performance for this event scoreboard
  const scoreboardData = eventBets.map(bet => {
      const user = users.find(u => u.id === bet.userId);
      const winnerRecord = result.winners.find(w => w.userId === bet.userId);
      return {
          username: user?.username || 'Unknown',
          avatarUrl: user?.avatarUrl,
          pointsEarned: winnerRecord?.pointsEarned || 0,
          prizeAmount: winnerRecord?.prizeAmount || 0,
          predictions: bet.predictions,
          teamPredictions: bet.teamPredictions,
          multiplier: bet.lockedMultiplier
      };
  }).sort((a, b) => b.pointsEarned - a.pointsEarned || b.prizeAmount - a.prizeAmount);

  const filteredScoreboard = scoreboardData.filter(entry => 
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-[#1f1f27] rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="p-5 border-b border-gray-700 bg-[#15151e] flex justify-between items-center">
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                    <span className="text-red-600 mr-2">{t('resultsLabel')}</span> {round?.name}
                </h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                    {event.type} • {t('officialClassification')}
                </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl font-light transition-colors">&times;</button>
        </div>

        {/* Internal Tabs */}
        <div className="flex bg-[#15151e] border-b border-gray-800">
            <button 
                onClick={() => setActiveTab('podium')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'podium' ? 'text-red-600 border-red-600 bg-[#1f1f27]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
                {t('podiumPayouts')}
            </button>
            <button 
                onClick={() => setActiveTab('scoreboard')}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'scoreboard' ? 'text-red-600 border-red-600 bg-[#1f1f27]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
                {t('fullScoreboard')}
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {activeTab === 'podium' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    {/* Top 5 Podium */}
                    <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="bg-red-600 w-1 h-4"></span> {t('officialTop5')}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {result.positions.map((driver, index) => (
                                <div key={driver.id} className="flex items-center bg-[#15151e] p-3 rounded border border-gray-800">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black italic mr-4 border ${
                                        index === 0 ? 'bg-yellow-500 border-yellow-400 text-black' : 
                                        index === 1 ? 'bg-gray-300 border-gray-200 text-black' : 
                                        index === 2 ? 'bg-yellow-800 border-yellow-700 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <img src={driver.imageUrl} alt={driver.name} className="w-10 h-10 rounded-full mr-3 border border-gray-700 object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-white text-sm uppercase italic truncate">{driver.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">{driver.teamName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Betting Pool Results */}
                    <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="bg-green-600 w-1 h-4"></span> {t('prizeDistribution')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-[#15151e] p-4 rounded border border-gray-800 text-center">
                                <p className="text-gray-500 text-[10px] font-black uppercase mb-1">{t('totalPurse')}</p>
                                <p className="text-xl font-black text-green-500 italic">{result.totalPrizePool.toLocaleString()} <i className="fas fa-coins text-sm ml-1"></i></p>
                            </div>
                            <div className="bg-[#15151e] p-4 rounded border border-gray-800 text-center">
                                <p className="text-gray-500 text-[10px] font-black uppercase mb-1">{t('winnersLabel')}</p>
                                <p className="text-xl font-black text-white italic">{result.winners.filter(w => w.prizeAmount > 0).length}</p>
                            </div>
                        </div>

                        {result.winners.filter(w => w.pointsEarned > 0 || w.prizeAmount > 0).length > 0 ? (
                            <div className="bg-[#15151e] rounded border border-gray-800 overflow-hidden">
                                <div className="px-4 py-2 bg-gray-900/50 font-black text-[10px] text-gray-500 uppercase grid grid-cols-3 border-b border-gray-800">
                                    <span>{t('participantLabel')}</span>
                                    <span className="text-right">{t('pointsLabel')}</span>
                                    <span className="text-right">{t('prizeLabel')}</span>
                                </div>
                                <ul className="divide-y divide-gray-800">
                                    {result.winners.slice(0, 10).map((winner, idx) => (
                                        <li key={idx} className="px-4 py-3 grid grid-cols-3 items-center hover:bg-gray-800/30 transition-colors">
                                            <span className="text-white font-bold text-sm truncate">{winner.username}</span>
                                            <span className="text-right text-blue-400 font-black italic">+{winner.pointsEarned}</span>
                                            <span className={`text-right font-black italic ${winner.prizeAmount > 0 ? 'text-yellow-500' : 'text-gray-600'}`}>
                                                {winner.prizeAmount > 0 ? `+${winner.prizeAmount.toLocaleString()}` : '-'}
                                            </span>
                                        </li>
                                    ))}
                                    {result.winners.length > 10 && (
                                        <li className="p-2 text-center">
                                            <button onClick={() => setActiveTab('scoreboard')} className="text-[10px] text-red-500 font-black uppercase hover:underline">
                                                {t('viewAllEntries')} ({result.winners.length})
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ) : (
                            <div className="p-8 bg-[#15151e] rounded border border-gray-800 text-center text-gray-500 italic text-sm">
                                {t('noParticipantsEarned')}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'scoreboard' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="bg-blue-600 w-1 h-4"></span> {t('eventScoreboard')}
                        </h3>
                        <div className="relative w-full sm:w-64">
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                            <input 
                                type="text"
                                placeholder={t('searchUser')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#15151e] border border-gray-700 rounded px-8 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="bg-[#15151e] rounded border border-gray-800 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-gray-900/50 border-b border-gray-800">
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase">{t('rankLabel')}</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase">{t('userLabel')}</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase">{t('p15Prediction')}</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase text-center">{t('mult')}</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase text-right">{t('pointsLabel')}</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase text-right">{t('prizeLabel')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {filteredScoreboard.map((entry, idx) => (
                                    <tr key={idx} className={`hover:bg-gray-800/30 transition-colors ${entry.username === searchQuery ? 'bg-red-900/10' : ''}`}>
                                        <td className="px-4 py-3 text-xs font-black italic text-gray-500">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <img src={entry.avatarUrl} className="w-6 h-6 rounded-full border border-gray-700" alt="" />
                                                <span className="text-white font-bold text-xs">{entry.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                {entry.predictions && entry.predictions.length > 0 ? (
                                                    entry.predictions.map((p, i) => (
                                                        <div key={i} className="group relative">
                                                            <img 
                                                                src={p.imageUrl} 
                                                                className={`w-6 h-6 rounded-full border ${result.positions[i]?.id === p.id ? 'border-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'border-gray-700 opacity-60'}`}
                                                                alt={p.name} 
                                                            />
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-20">
                                                                {p.name}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : entry.teamPredictions && entry.teamPredictions.length > 0 ? (
                                                     entry.teamPredictions.map((t, i) => (
                                                        <div key={i} className="group relative">
                                                            <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 border ${result.positions[i]?.teamId === t.id ? 'border-green-500' : 'border-gray-700 opacity-60'}`}>
                                                                <img src={t.logoUrl} className="max-w-full max-h-full object-contain" alt={t.name} />
                                                            </div>
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[8px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-20">
                                                                {t.name}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : <span className="text-gray-600 italic text-[10px]">{t('noPrediction')}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {entry.multiplier > 1.0 ? (
                                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30">
                                                <i className="fas fa-fire mr-0.5 text-[8px]"></i>{entry.multiplier.toFixed(1)}x
                                              </span>
                                            ) : (
                                              <span className="text-[10px] font-black text-gray-400">{entry.multiplier.toFixed(1)}x</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-blue-400 font-black italic text-xs">+{entry.pointsEarned}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-xs font-black italic ${entry.prizeAmount > 0 ? 'text-yellow-500' : 'text-gray-600'}`}>
                                                {entry.prizeAmount > 0 ? `+${entry.prizeAmount}` : '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredScoreboard.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-600 italic text-xs">{t('noEntriesFound')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RaceResultsModal;
