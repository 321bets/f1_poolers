
import React, { useState, useRef, useEffect } from 'react';
import { League, LeagueChatMessage, MemberStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LeagueChatProps {
    league: League;
}

const LeagueChat: React.FC<LeagueChatProps> = ({ league }) => {
    const { user } = useAuth();
    const { sendLeagueMessage, reactToLeagueMessage, moderateLeagueMember } = useData();
    const { t } = useLanguage();
    const [newMessage, setNewMessage] = useState('');
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, userId: string, msgId: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isLeagueAdmin = user?.id === league.adminId;
    const myStatus = user ? league.memberStatus[user.id] : 'active';
    const isSuspended = myStatus === 'suspended';
    const isBanned = myStatus === 'banned';

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [league.messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || isSuspended || isBanned) return;

        try {
            await sendLeagueMessage(league.id, newMessage);
            setNewMessage('');
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, msg: LeagueChatMessage) => {
        if (!isLeagueAdmin || msg.userId === user?.id) return;
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            userId: msg.userId,
            msgId: msg.id
        });
    };

    const handleModerate = async (action: MemberStatus | 'unsuspend') => {
        if (contextMenu) {
            await moderateLeagueMember(league.id, contextMenu.userId, action);
            setContextMenu(null);
        }
    };

    const handleReaction = (msgId: string, type: 'like' | 'dislike') => {
        reactToLeagueMessage(league.id, msgId, type);
    };

    // Close context menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    if (isBanned) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg text-red-500 font-bold p-4">
                {t('bannedFromLeague')}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[500px] bg-gray-900 rounded-lg border border-gray-700 relative">
            {/* Header */}
            <div className="p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
                <h3 className="text-white font-bold"><i className="fas fa-comments mr-2"></i> {t('leagueChatTitle')}</h3>
                <p className="text-xs text-gray-500">{t('messagesRemovedNote')}</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {league.messages.map(msg => {
                    const isMe = msg.userId === user?.id;
                    const isAdmin = msg.userId === league.adminId;
                    const isHighRoller = msg.globalRank <= 3;
                    
                    return (
                        <div 
                            key={msg.id} 
                            className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                            onContextMenu={(e) => handleContextMenu(e, msg)}
                        >
                            <img 
                                src={msg.avatarUrl} 
                                alt={msg.username} 
                                className={`w-8 h-8 rounded-full border-2 ${isHighRoller ? 'border-yellow-400' : 'border-gray-600'}`}
                                title={isHighRoller ? `Rank #${msg.globalRank} High Roller` : undefined}
                            />
                            <div className="max-w-[75%]">
                                <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <span className={`text-xs font-bold ${isAdmin ? 'text-red-500' : isHighRoller ? 'text-yellow-400' : 'text-gray-300'}`}>
                                        {msg.username} 
                                        {isAdmin && <i className="fas fa-crown ml-1 text-[10px]" title="League Admin"></i>}
                                        {isHighRoller && !isAdmin && <i className="fas fa-star ml-1 text-[10px]" title="High Roller"></i>}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className={`p-2 rounded-lg text-sm relative group ${
                                    isMe ? 'bg-blue-600 text-white rounded-tr-none' : 
                                    isAdmin ? 'bg-red-900 text-white rounded-tl-none border border-red-700' : 
                                    isHighRoller ? 'bg-yellow-900 bg-opacity-40 text-gray-100 rounded-tl-none border border-yellow-700' :
                                    'bg-gray-700 text-gray-200 rounded-tl-none'
                                }`}>
                                    {msg.message}
                                    
                                    {/* Reactions */}
                                    <div className="absolute -bottom-5 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 rounded px-1 shadow">
                                        <button 
                                            onClick={() => handleReaction(msg.id, 'like')}
                                            className={`text-[10px] px-1 hover:text-green-400 ${msg.likes.includes(user?.id || '') ? 'text-green-400' : 'text-gray-400'}`}
                                        >
                                            <i className="fas fa-thumbs-up"></i> {msg.likes.length || ''}
                                        </button>
                                        <button 
                                            onClick={() => handleReaction(msg.id, 'dislike')}
                                            className={`text-[10px] px-1 hover:text-red-400 ${msg.dislikes.includes(user?.id || '') ? 'text-red-400' : 'text-gray-400'}`}
                                        >
                                            <i className="fas fa-thumbs-down"></i> {msg.dislikes.length || ''}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-gray-800 rounded-b-lg flex gap-2 border-t border-gray-700">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={isSuspended ? t('suspendedFromChat') : t('typeMessage')}
                    disabled={isSuspended}
                    className="flex-1 bg-gray-700 text-white text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim() || isSuspended}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <i className="fas fa-paper-plane text-xs"></i>
                </button>
            </form>

            {/* Moderator Context Menu */}
            {contextMenu && (
                <div 
                    className="fixed bg-gray-800 border border-gray-600 rounded shadow-2xl z-50 py-1 w-32"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button 
                        onClick={() => handleModerate('suspended')}
                        className="block w-full text-left px-4 py-2 text-xs text-yellow-400 hover:bg-gray-700"
                    >
                        <i className="fas fa-comment-slash mr-2"></i> {t('suspend')}
                    </button>
                    <button 
                        onClick={() => handleModerate('unsuspend')}
                        className="block w-full text-left px-4 py-2 text-xs text-green-400 hover:bg-gray-700"
                    >
                        <i className="fas fa-comment mr-2"></i> {t('unsuspend')}
                    </button>
                    <div className="border-t border-gray-700 my-1"></div>
                    <button 
                        onClick={() => handleModerate('banned')}
                        className="block w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-gray-700"
                    >
                        <i className="fas fa-ban mr-2"></i> {t('banUser')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeagueChat;
