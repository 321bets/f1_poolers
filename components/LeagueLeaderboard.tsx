
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { League } from '../types';
import LeagueDetailsModal from './LeagueDetailsModal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const LeagueLeaderboard: React.FC = () => {
    const { leagues, createLeague } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // Create League Form State
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    
    // Chat & Prize State
    const [hasChat, setHasChat] = useState(false);
    const [addPrize, setAddPrize] = useState(false);
    const [prizeTitle, setPrizeTitle] = useState('');
    const [prizeUrl, setPrizeUrl] = useState('');    const prizeFileRef = React.useRef<HTMLInputElement>(null);
    const [prizeRules, setPrizeRules] = useState('');

    // Sort leagues by member count (popularity)
    const sortedLeagues = [...leagues].sort((a,b) => b.members.length - a.members.length);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const prize = addPrize ? {
            title: prizeTitle,
            imageUrl: prizeUrl,
            rules: prizeRules
        } : undefined;

        await createLeague(newName, newDesc, isPrivate, hasChat, prize);
        
        // Reset form
        setIsCreating(false);
        setNewName(''); setNewDesc(''); setIsPrivate(false);
        setHasChat(false); setAddPrize(false); setPrizeTitle(''); setPrizeUrl(''); setPrizeRules('');
        if (prizeFileRef.current) prizeFileRef.current.value = '';
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-500 flex items-center">
                    <i className="fas fa-users mr-2"></i>
                    {t('leagues')}
                </h2>
                <button 
                    onClick={() => setIsCreating(true)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded"
                    title="Create League"
                >
                    <i className="fas fa-plus"></i>
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="mb-4 bg-gray-700 p-3 rounded text-sm space-y-3">
                    <input 
                        className="w-full bg-gray-600 rounded px-2 py-1 text-white placeholder-gray-400" 
                        placeholder={t('leagueNamePlaceholder')}
                        value={newName} onChange={e => setNewName(e.target.value)} required
                    />
                    <input 
                        className="w-full bg-gray-600 rounded px-2 py-1 text-white placeholder-gray-400" 
                        placeholder={t('shortDescPlaceholder')}
                        value={newDesc} onChange={e => setNewDesc(e.target.value)} required
                    />
                    
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="mr-2" />
                            <span className="text-gray-300 text-xs">{t('privateLabel')}</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={hasChat} onChange={e => setHasChat(e.target.checked)} className="mr-2" />
                            <span className="text-gray-300 text-xs">{t('enableChat')}</span>
                        </label>
                    </div>

                    <div className="border-t border-gray-600 pt-2">
                        <label className="flex items-center cursor-pointer mb-2">
                            <input type="checkbox" checked={addPrize} onChange={e => setAddPrize(e.target.checked)} className="mr-2" />
                            <span className="text-yellow-400 font-bold text-xs"><i className="fas fa-trophy mr-1"></i> {t('addPrize')}</span>
                        </label>

                        {addPrize && (
                            <div className="space-y-2 pl-2 border-l-2 border-yellow-500">
                                <div>
                                    <input 
                                        className="w-full bg-gray-600 rounded px-2 py-1 text-white placeholder-gray-400 text-xs" 
                                        placeholder={t('prizeTitlePlaceholder')}
                                        maxLength={40}
                                        value={prizeTitle} onChange={e => setPrizeTitle(e.target.value)} required
                                    />
                                    <div className="text-[9px] text-right text-gray-400">{40 - prizeTitle.length} {t('remaining')}</div>
                                </div>
                                <label className="w-full flex items-center gap-2 bg-gray-600 rounded px-2 py-1 text-xs cursor-pointer hover:bg-gray-500 transition-colors">
                                    <i className="fas fa-camera text-yellow-400"></i>
                                    <span className="text-gray-300">{prizeUrl ? t('imageUploaded') : t('uploadPrizeImage')}</span>
                                    <input 
                                        ref={prizeFileRef}
                                        type="file" accept="image/*" className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setPrizeUrl(r.result as string); r.readAsDataURL(f); } }}
                                    />
                                </label>
                                {prizeUrl && <img src={prizeUrl} alt="Preview" className="w-12 h-12 rounded object-cover border border-yellow-500/50" />}
                                <div>
                                    <textarea 
                                        className="w-full bg-gray-600 rounded px-2 py-1 text-white placeholder-gray-400 text-xs" 
                                        placeholder={t('prizeRulesPlaceholder')}
                                        maxLength={500}
                                        rows={3}
                                        value={prizeRules} onChange={e => setPrizeRules(e.target.value)} required
                                    />
                                    <div className="text-[9px] text-right text-gray-400">{500 - prizeRules.length} {t('remaining')}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-green-600 text-white py-1 rounded hover:bg-green-700">{t('createBtn')}</button>
                        <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-gray-500 text-white py-1 rounded hover:bg-gray-400">{t('cancel')}</button>
                    </div>
                </form>
            )}

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {sortedLeagues.map(league => (
                    <div 
                        key={league.id} 
                        onClick={() => setSelectedLeague(league)}
                        className="flex items-center justify-between bg-gray-700 p-2 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                        <div className="min-w-0">
                            <p className="font-semibold text-white text-sm truncate flex items-center gap-1">
                                {league.name}
                                {league.isPrivate && <i className="fas fa-lock text-[10px] text-yellow-500" title="Private"></i>}
                                {league.prize && <i className="fas fa-trophy text-[10px] text-yellow-400" title="Prize League"></i>}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">{league.members.length} {t('membersLabel')}</p>
                        </div>
                        {user?.joinedLeagues?.includes(league.id) ? (
                            <span className="text-[10px] bg-green-900 text-green-300 px-1.5 py-0.5 rounded">{t('joined')}</span>
                        ) : (
                            <i className="fas fa-chevron-right text-gray-500 text-xs"></i>
                        )}
                    </div>
                ))}
            </div>

            {selectedLeague && (
                <LeagueDetailsModal league={selectedLeague} onClose={() => setSelectedLeague(null)} />
            )}
        </div>
    );
};

export default LeagueLeaderboard;
