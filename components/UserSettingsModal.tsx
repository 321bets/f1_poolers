
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
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

    const managedLeagues = leagues.filter(l => l.adminId === user?.id);

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUser({ id: user.id, avatarUrl, email: email || undefined, phone: phone || undefined });
            alert('Profile updated!');
        } catch (e) {
            alert('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be less than 2MB');
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
                    <h2 className="text-xl font-bold text-white">User Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="flex bg-gray-900 border-b border-gray-700">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 font-bold transition-colors border-b-2 ${activeTab === 'profile' ? 'text-red-500 border-red-500 bg-gray-800' : 'text-gray-500 border-transparent hover:text-white'}`}
                    >
                        Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab('leagues')}
                        className={`flex-1 py-3 font-bold transition-colors border-b-2 ${activeTab === 'leagues' ? 'text-blue-500 border-blue-500 bg-gray-800' : 'text-gray-500 border-transparent hover:text-white'}`}
                    >
                        My Leagues ({managedLeagues.length})
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
                                    <p className="text-gray-400">Member since {new Date().getFullYear()}</p>
                                    <div className="mt-2 text-yellow-400 font-bold text-lg mb-2">
                                        {user.balance.toLocaleString()} Fun-Coins
                                    </div>
                                    {/* Get Fun Coins button hidden for now */}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click the camera icon to upload a new avatar (max 2MB)</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-700 p-3 rounded">
                                    <p className="text-xs text-gray-400">Country</p>
                                    <p className="font-bold">{user.country}</p>
                                </div>
                                <div className="bg-gray-700 p-3 rounded">
                                    <p className="text-xs text-gray-400">Age</p>
                                    <p className="font-bold">{user.age}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider"><i className="fas fa-shield-alt text-red-500 mr-2"></i>Recovery Contact</h4>
                                <p className="text-xs text-gray-500">Add an email or phone so you can recover your account if you forget your credentials. We will never send messages to these contacts.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1">Email</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-xs font-bold mb-1">Phone</label>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600 text-sm" />
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveProfile} 
                                disabled={isSaving}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'leagues' && (
                        <div>
                            <div className="mb-4">
                                <h3 className="font-bold text-white mb-2">Leagues You Manage</h3>
                                <p className="text-sm text-gray-400">Click a league to view details or invite friends.</p>
                            </div>
                            {managedLeagues.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-gray-700 rounded text-gray-500">
                                    You haven't created any leagues yet.
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
                                                <p className="text-xs text-gray-400">{l.isPrivate ? 'Private' : 'Public'} • {l.members.length} Members</p>
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
