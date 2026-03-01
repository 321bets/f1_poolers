
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { League } from '../types';
import LeagueDetailsModal from './LeagueDetailsModal';
import GetCoinsModal from './GetCoinsModal';

interface UserSettingsModalProps {
    onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ onClose }) => {
    const { user } = useAuth();
    const { updateUser, leagues } = useData();
    const [activeTab, setActiveTab] = useState<'profile' | 'leagues'>('profile');
    
    // Profile State
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isSaving, setIsSaving] = useState(false);

    // League State
    const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

    // Store State
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const { t } = useLanguage();

    const inviteUrl = `https://adster.app/?ref=${user?.username || ''}`;
    const inviteMsg = `${t('inviteMessage')} ${inviteUrl}`;
    const inviteMsgShort = `${t('inviteMessageShort')} ${inviteUrl}`;

    const handleShare = (platform: string) => {
        const encoded = encodeURIComponent(inviteMsg);
        const encodedShort = encodeURIComponent(inviteMsgShort);
        const encodedUrl = encodeURIComponent(inviteUrl);
        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encoded}`, '_blank');
                break;
            case 'messenger':
                window.open(`https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=0&redirect_uri=${encodedUrl}`, '_blank');
                break;
            case 'instagram':
                navigator.clipboard.writeText(inviteMsg);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 3000);
                return;
            case 'sms':
                window.open(`sms:?body=${encodedShort}`, '_blank');
                break;
            case 'email':
                window.open(`mailto:?subject=${encodeURIComponent(t('inviteEmailSubject'))}&body=${encoded}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(inviteMsg);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
                return;
        }
        setIsShareOpen(false);
    };

    const managedLeagues = leagues.filter(l => l.adminId === user?.id);

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUser({ id: user.id, avatarUrl, email: email || undefined, phone: phone || undefined });
            alert(t('profileUpdated'));
        } catch (e) {
            alert(t('profileUpdateFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert(t('imageTooLarge'));
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-lg">
                    <h2 className="text-xl font-bold text-white">{t('userSettings')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="flex bg-gray-900 border-b border-gray-700">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 font-bold transition-colors border-b-2 ${activeTab === 'profile' ? 'text-red-500 border-red-500 bg-gray-800' : 'text-gray-500 border-transparent hover:text-white'}`}
                    >
                        {t('profile')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('leagues')}
                        className={`flex-1 py-3 font-bold transition-colors border-b-2 ${activeTab === 'leagues' ? 'text-blue-500 border-blue-500 bg-gray-800' : 'text-gray-500 border-transparent hover:text-white'}`}
                    >
                        {t('myLeagues')} ({managedLeagues.length})
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <img src={avatarUrl} alt="Preview" className="w-24 h-24 rounded-full border-4 border-gray-600 object-cover" />
                                    <label className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-lg">
                                        <i className="fas fa-camera text-sm"></i>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white">{user.username}</h3>
                                    <p className="text-gray-400">{t('memberSince')} {new Date().getFullYear()}</p>
                                    <div className="mt-2 text-yellow-400 font-bold text-lg mb-2">
                                        {user.balance.toLocaleString()} Fun-Coins
                                    </div>
                                    {/* Get Fun Coins button hidden for now */}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{t('avatarHint')}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-700 p-3 rounded">
                                    <p className="text-xs text-gray-400">{t('country')}</p>
                                    <p className="font-bold">{user.country}</p>
                                </div>
                                <div className="bg-gray-700 p-3 rounded">
                                    <p className="text-xs text-gray-400">{t('age')}</p>
                                    <p className="font-bold">{user.age}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider"><i className="fas fa-shield-alt text-red-500 mr-2"></i>{t('recoveryContactLabel')}</h4>
                                <p className="text-xs text-gray-500">{t('recoveryContactHint')}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1">{t('email')}</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1">{t('phone')}</label>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600 text-sm" />
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveProfile} 
                                disabled={isSaving}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors"
                            >
                                {isSaving ? t('saving') : t('saveChanges')}
                            </button>

                            {/* Invite Friends */}
                            <div className="pt-2 border-t border-gray-700">
                                <button
                                    onClick={() => setIsShareOpen(true)}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3 text-base shadow-lg"
                                >
                                    <i className="fas fa-share-alt text-lg"></i>
                                    {t('inviteFriends')}
                                </button>
                            </div>

                            {/* Share Sheet Modal */}
                            {isShareOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end sm:items-center justify-center z-[60]" onClick={() => setIsShareOpen(false)}>
                                    <div className="bg-gray-800 w-full sm:w-96 sm:rounded-2xl rounded-t-2xl p-5 pb-8 sm:pb-5 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <i className="fas fa-share-alt text-red-500"></i>
                                                {t('inviteShareVia')}
                                            </h3>
                                            <button onClick={() => setIsShareOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all">
                                                <i className="fab fa-whatsapp text-green-500 text-3xl"></i>
                                                <span className="text-xs text-gray-300 font-medium">WhatsApp</span>
                                            </button>
                                            <button onClick={() => handleShare('messenger')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all">
                                                <i className="fab fa-facebook-messenger text-blue-500 text-3xl"></i>
                                                <span className="text-xs text-gray-300 font-medium">Messenger</span>
                                            </button>
                                            <button onClick={() => handleShare('instagram')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all relative">
                                                <i className="fab fa-instagram text-pink-500 text-3xl"></i>
                                                <span className="text-xs text-gray-300 font-medium">Instagram</span>
                                            </button>
                                            <button onClick={() => handleShare('sms')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all">
                                                <i className="fas fa-sms text-yellow-500 text-3xl"></i>
                                                <span className="text-xs text-gray-300 font-medium">SMS</span>
                                            </button>
                                            <button onClick={() => handleShare('email')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all">
                                                <i className="fas fa-envelope text-red-400 text-3xl"></i>
                                                <span className="text-xs text-gray-300 font-medium">Email</span>
                                            </button>
                                            <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all">
                                                <i className={`fas ${copySuccess ? 'fa-check text-green-400' : 'fa-link text-gray-400'} text-3xl`}></i>
                                                <span className="text-xs text-gray-300 font-medium">{copySuccess ? t('inviteCopied') : t('inviteCopyUrl')}</span>
                                            </button>
                                        </div>
                                        {copySuccess && (
                                            <p className="text-center text-green-400 text-xs mt-3 font-medium">{t('inviteInstagramHint')}</p>
                                        )}
                                        <div className="mt-4 bg-gray-900 rounded-lg p-3">
                                            <p className="text-[11px] text-gray-500 text-center break-all">{inviteUrl}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'leagues' && (
                        <div>
                            <div className="mb-4">
                                <h3 className="font-bold text-white mb-2">{t('leaguesYouManage')}</h3>
                                <p className="text-sm text-gray-400">{t('leaguesClickToView')}</p>
                            </div>
                            {managedLeagues.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded text-gray-500">
                                    {t('noLeaguesYet')}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {managedLeagues.map(l => (
                                        <div 
                                            key={l.id} 
                                            onClick={() => setSelectedLeague(l)}
                                            className="bg-gray-700 p-4 rounded hover:bg-gray-600 cursor-pointer flex justify-between items-center transition-colors"
                                        >
                                            <div>
                                                <h4 className="font-bold text-white">{l.name}</h4>
                                                <p className="text-xs text-gray-400">{l.isPrivate ? t('privateLabel') : t('publicLabel')} • {l.members.length} {t('membersLabel')}</p>
                                            </div>
                                            <i className="fas fa-chevron-right text-gray-500"></i>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {selectedLeague && (
                <LeagueDetailsModal 
                    league={selectedLeague} 
                    onClose={() => setSelectedLeague(null)} 
                />
            )}
            {isStoreOpen && (
                <GetCoinsModal onClose={() => setIsStoreOpen(false)} />
            )}
        </div>
    );
};

export default UserSettingsModal;
