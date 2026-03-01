
import React, { useState } from 'react';
import { League, MemberStatus, Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import LeagueChat from './LeagueChat';
import RaceResultsModal from './RaceResultsModal';
import { useLanguage } from '../contexts/LanguageContext';

interface LeagueDetailsModalProps {
    league: League;
    onClose: () => void;
}

const LeagueDetailsModal: React.FC<LeagueDetailsModalProps> = ({ league, onClose }) => {
    const { user } = useAuth();
    // Fix: Destructure 'allBets' from useData to resolve the reference error on line 280
    const { users, events, results, rounds, allBets, joinLeague, leaveLeague, inviteUserToLeague, updateLeagueSettings, moderateLeagueMember } = useData();
    const { t } = useLanguage();
    const [inviteUsername, setInviteUsername] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [viewMode, setViewMode] = useState<'standings' | 'chat' | 'history' | 'admin'>('standings');
    const [viewResultEvent, setViewResultEvent] = useState<Event | null>(null);
    
    // Admin Settings State
    const [editChat, setEditChat] = useState(league.hasChat);
    const [editPrize, setEditPrize] = useState(!!league.prize);
    const [prizeTitle, setPrizeTitle] = useState(league.prize?.title || '');
    const [prizeUrl, setPrizeUrl] = useState(league.prize?.imageUrl || '');
    const [prizeRules, setPrizeRules] = useState(league.prize?.rules || '');

    // Sort members by points (General League Scoreboard)
    const memberUsers = users.filter(u => league.members.includes(u.id)).sort((a,b) => b.points - a.points);
    const isMember = user && league.members.includes(user.id);
    const isAdmin = user && league.adminId === user.id;

    // Get event history for finished events
    const finishedEvents = events
        .filter(e => results.some(r => r.eventId === e.id))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    const handleJoin = async () => {
        if (!user) return;
        setIsJoining(true);
        try {
            if (league.isPrivate) {
                const code = prompt(t('enterInviteCode'));
                if (!code) return;
                await joinLeague(league.id, code);
            } else {
                await joinLeague(league.id);
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!user) return;
        if (confirm(t('leaveConfirm'))) {
            await leaveLeague(league.id);
            onClose();
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/join/${league.inviteCode}`;
        navigator.clipboard.writeText(link);
        alert(`${t('inviteLinkCopied')}\nCode: ${league.inviteCode}`);
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await inviteUserToLeague(league.id, inviteUsername);
            alert(`${t('invitationSent')} ${inviteUsername}`);
            setInviteUsername('');
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        const prizeData = editPrize ? {
            title: prizeTitle,
            imageUrl: prizeUrl,
            rules: prizeRules
        } : undefined;

        await updateLeagueSettings(league.id, { hasChat: editChat, prize: prizeData });
        alert(t('leagueSettingsUpdated'));
        setViewMode('standings');
    };
    
    const handleModerateUser = async (targetId: string, action: MemberStatus | 'unsuspend') => {
        if (!confirm(`${t('confirmAction')} ${action}?`)) return;
        await moderateLeagueMember(league.id, targetId, action);
    };

    const handleViewEventResult = (event: Event) => {
        setViewResultEvent(event);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-1 sm:p-4 backdrop-blur-md">
            <div className="bg-[#1f1f27] rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-800">
                <div className="p-5 border-b border-gray-800 flex justify-between items-start bg-[#15151e] rounded-t-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{league.name}</h2>
                            {league.isPrivate && <i className="fas fa-lock text-xs text-yellow-500" title="Private League"></i>}
                        </div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{league.description}</p>
                    </div>
                    <div className="flex gap-2">
                         {isAdmin && (
                            <button onClick={() => setViewMode(viewMode === 'admin' ? 'standings' : 'admin')} className="text-gray-500 hover:text-white transition-colors p-2">
                                <i className="fas fa-cog"></i>
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl font-light transition-colors">&times;</button>
                    </div>
                </div>

                {/* Prize Banner */}
                {league.prize && viewMode !== 'admin' && (
                    <div className="bg-gradient-to-r from-[#e10600]/20 to-transparent p-3 flex items-center gap-4 border-b border-red-900/30">
                        <div className="w-14 h-14 bg-black rounded flex-shrink-0 overflow-hidden border border-yellow-500 shadow-lg shadow-yellow-900/20">
                             <img src={league.prize.imageUrl} alt="Prize" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                             <h3 className="text-yellow-500 font-black text-sm uppercase italic flex items-center">
                                <i className="fas fa-trophy mr-2"></i> {t('seasonPrizeLabel')} {league.prize.title}
                             </h3>
                             <p className="text-gray-400 text-[10px] font-bold uppercase truncate">{league.prize.rules}</p>
                        </div>
                    </div>
                )}

                {/* Actions Bar / Navigation */}
                <div className="px-3 bg-[#15151e] border-b border-gray-800 flex justify-between items-center overflow-x-auto no-scrollbar">
                    <div className="flex">
                         <button 
                            onClick={() => setViewMode('standings')} 
                            className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${viewMode === 'standings' ? 'text-red-600 border-red-600 bg-[#1f1f27]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                         >
                             {t('generalScoreboard')}
                         </button>
                         <button 
                            onClick={() => setViewMode('history')} 
                            className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${viewMode === 'history' ? 'text-red-600 border-red-600 bg-[#1f1f27]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                         >
                             {t('eventHistoryTab')}
                         </button>
                         {league.hasChat && isMember && (
                             <button 
                                onClick={() => setViewMode('chat')} 
                                className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${viewMode === 'chat' ? 'text-red-600 border-red-600 bg-[#1f1f27]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                             >
                                 {t('paddockChat')}
                             </button>
                         )}
                    </div>
                    
                    <div className="flex items-center gap-3 px-4">
                        {!isMember && (
                            <button 
                                onClick={handleJoin} 
                                disabled={isJoining}
                                className="bg-red-600 hover:bg-red-700 text-white font-black py-1 px-4 rounded-sm text-[10px] uppercase italic tracking-widest shadow-lg shadow-red-900/20"
                            >
                                {isJoining ? t('joining') : t('joinGrid')}
                            </button>
                        )}
                        {isMember && !isAdmin && (
                            <button onClick={handleLeave} className="text-gray-500 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">
                                {t('leaveLeague')}
                            </button>
                        )}
                        {isAdmin && (
                            <button onClick={handleCopyLink} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black py-1 px-4 rounded-sm uppercase italic tracking-widest shadow-lg shadow-blue-900/20">
                                <i className="fas fa-link mr-1"></i> {t('copyInviteBtn')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-[#1f1f27] p-4 custom-scrollbar">
                    {/* STANDINGS VIEW (GENERAL SCOREBOARD) */}
                    {viewMode === 'standings' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            {isAdmin && (
                                <form onSubmit={handleInviteUser} className="bg-[#15151e] p-2 rounded border border-gray-800 flex gap-2">
                                    <input 
                                        type="text" 
                                        value={inviteUsername}
                                        onChange={e => setInviteUsername(e.target.value)}
                                        placeholder={t('inviteMemberPlaceholder')}
                                        className="flex-1 bg-gray-800 text-white text-xs font-bold rounded px-3 py-1.5 focus:outline-none focus:border-red-600 border border-transparent transition-colors"
                                    />
                                    <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-black uppercase italic px-4 rounded transition-colors">
                                        {t('sendInvite')}
                                    </button>
                                </form>
                            )}

                            <div className="space-y-1">
                                {memberUsers.map((u, index) => {
                                    const status = league.memberStatus[u.id];
                                    const isSuspended = status === 'suspended';
                                    const isBanned = status === 'banned';
                                    
                                    return (
                                        <div key={u.id} className={`flex items-center justify-between p-3 rounded border transition-colors ${u.id === user?.id ? 'bg-[#15151e] border-red-600/50 shadow-lg shadow-red-900/10' : 'bg-[#15151e]/50 border-gray-800'} ${isBanned ? 'opacity-30 grayscale' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`font-black italic w-6 text-center text-sm ${index < 3 ? 'text-yellow-500' : 'text-gray-600'}`}>{index + 1}</span>
                                                <img src={u.avatarUrl} className={`w-8 h-8 rounded-full border-2 ${index < 3 ? 'border-yellow-500' : 'border-gray-700'}`} alt="" />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-black uppercase italic truncate ${u.id === user?.id ? 'text-white' : 'text-gray-400'}`}>
                                                            {u.username}
                                                        </span>
                                                        {u.id === league.adminId && <i className="fas fa-crown text-[8px] text-red-600" title="Founder"></i>}
                                                    </div>
                                                    {(isSuspended || isBanned) && (
                                                        <span className="text-[8px] bg-red-900 text-red-300 px-1 rounded uppercase font-black">{status}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <span className="block font-black italic text-blue-400 leading-none">{u.points.toLocaleString()}</span>
                                                    <span className="text-[8px] text-gray-600 font-black uppercase">{t('seasonPts')}</span>
                                                </div>
                                                {isAdmin && u.id !== user?.id && (
                                                    <div className="relative group">
                                                        <button className="text-gray-600 hover:text-white transition-colors p-1"><i className="fas fa-ellipsis-v"></i></button>
                                                        <div className="absolute right-0 mt-1 w-32 bg-[#15151e] border border-gray-700 rounded shadow-2xl hidden group-hover:block z-10 overflow-hidden">
                                                            {isSuspended ? (
                                                                <button onClick={() => handleModerateUser(u.id, 'unsuspend')} className="block w-full text-left px-3 py-2 text-[10px] font-black uppercase text-green-500 hover:bg-gray-800">{t('unsuspend')}</button>
                                                            ) : (
                                                                <button onClick={() => handleModerateUser(u.id, 'suspended')} className="block w-full text-left px-3 py-2 text-[10px] font-black uppercase text-yellow-500 hover:bg-gray-800">{t('suspend')}</button>
                                                            )}
                                                            {!isBanned && (
                                                                <button onClick={() => handleModerateUser(u.id, 'banned')} className="block w-full text-left px-3 py-2 text-[10px] font-black uppercase text-red-600 hover:bg-gray-800 border-t border-gray-800">{t('banUser')}</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* EVENT HISTORY VIEW */}
                    {viewMode === 'history' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">{t('pastSessions')}</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {finishedEvents.map(event => {
                                    const round = rounds.find(r => r.id === event.roundId);
                                    return (
                                        <div 
                                            key={event.id} 
                                            onClick={() => handleViewEventResult(event)}
                                            className="bg-[#15151e] p-4 rounded border border-gray-800 hover:border-red-600/50 transition-all group cursor-pointer"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block mb-1">{t('round')} {round?.number}</span>
                                                    <h4 className="text-sm font-black text-white uppercase italic group-hover:text-red-500 transition-colors">{round?.name} - {event.type}</h4>
                                                    <p className="text-xs text-gray-500 font-bold mt-1 uppercase">{event.date.toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">{t('leagueEntries')}</span>
                                                    <span className="text-lg font-black text-white italic">
                                                        {allBets.filter(b => b.eventId === event.id && league.members.includes(b.userId)).length}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-800 flex justify-end">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                                    {t('viewScoreboardLink')} <i className="fas fa-arrow-right ml-1"></i>
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                                {finishedEvents.length === 0 && (
                                    <div className="py-20 text-center text-gray-600 font-bold uppercase italic tracking-widest border-2 border-dashed border-gray-800 rounded-lg">
                                        {t('noEventsYet')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* CHAT VIEW */}
                    {viewMode === 'chat' && (
                        <LeagueChat league={league} />
                    )}

                    {/* ADMIN VIEW */}
                    {viewMode === 'admin' && isAdmin && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('leagueCommandCentre')}</h3>
                            <form onSubmit={handleSaveSettings} className="space-y-4">
                                <label className="flex items-center cursor-pointer bg-[#15151e] p-4 rounded border border-gray-800 hover:border-blue-600/50 transition-colors">
                                    <input type="checkbox" checked={editChat} onChange={e => setEditChat(e.target.checked)} className="mr-3 h-5 w-5 text-red-600 rounded bg-gray-800 border-gray-700" />
                                    <span className="text-white text-xs font-black uppercase italic tracking-widest">{t('enableTelemetry')}</span>
                                </label>

                                <div className="bg-[#15151e] p-4 rounded border border-gray-800 space-y-4">
                                    <label className="flex items-center cursor-pointer mb-2">
                                        <input type="checkbox" checked={editPrize} onChange={e => setEditPrize(e.target.checked)} className="mr-3 h-5 w-5 text-yellow-500 rounded bg-gray-800 border-gray-700" />
                                        <span className="text-yellow-500 font-black text-xs uppercase italic tracking-widest"><i className="fas fa-trophy mr-2"></i> {t('customSeasonalPrize')}</span>
                                    </label>
                                    
                                    {editPrize && (
                                        <div className="pl-4 border-l-2 border-yellow-500 space-y-4 mt-4 animate-in slide-in-from-left-2">
                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-black uppercase mb-1">{t('prizeDesignation')}</label>
                                                <input 
                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-xs font-bold focus:border-yellow-500 focus:outline-none" 
                                                    placeholder={t('prizeDesignationPlaceholder')}
                                                    maxLength={40}
                                                    value={prizeTitle} onChange={e => setPrizeTitle(e.target.value)} required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-black uppercase mb-1">{t('visualEvidence')}</label>
                                                <input 
                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-xs font-bold focus:border-yellow-500 focus:outline-none" 
                                                    placeholder="https://..."
                                                    value={prizeUrl} onChange={e => setPrizeUrl(e.target.value)} required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500 font-black uppercase mb-1">{t('sportingRegulations')}</label>
                                                <textarea 
                                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-xs font-bold focus:border-yellow-500 focus:outline-none" 
                                                    placeholder={t('describePrize')}
                                                    maxLength={500}
                                                    rows={4}
                                                    value={prizeRules} onChange={e => setPrizeRules(e.target.value)} required
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-sm text-xs uppercase italic tracking-widest shadow-lg shadow-green-900/20 transition-all active:scale-95">
                                    {t('finalizeChanges')}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {viewResultEvent && results.find(r => r.eventId === viewResultEvent.id) && (
                <RaceResultsModal 
                    event={viewResultEvent}
                    result={results.find(r => r.eventId === viewResultEvent.id)!}
                    onClose={() => setViewResultEvent(null)}
                />
            )}
        </div>
    );
};

export default LeagueDetailsModal;