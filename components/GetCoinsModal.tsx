
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface GetCoinsModalProps {
    onClose: () => void;
}

const GetCoinsModal: React.FC<GetCoinsModalProps> = ({ onClose }) => {
    const { adSettings, processAdReward } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();
    
    // Ad State
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adTimer, setAdTimer] = useState(5);
    const [adSuccess, setAdSuccess] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isWatchingAd && adTimer > 0) {
            interval = setInterval(() => {
                setAdTimer(prev => prev - 1);
            }, 1000);
        } else if (isWatchingAd && adTimer === 0) {
            handleFinishAd();
        }
        return () => clearInterval(interval);
    }, [isWatchingAd, adTimer]);

    const handleWatchAd = () => {
        setIsWatchingAd(true);
        setAdTimer(5); // Simulate 5 second ad
        setAdSuccess(false);
    };

    const handleFinishAd = async () => {
        if (!user) return;
        await processAdReward(user.id);
        setIsWatchingAd(false);
        setAdSuccess(true);
        setTimeout(() => setAdSuccess(false), 3000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <i className="fas fa-coins text-yellow-400 mr-2"></i> {t('getCoins')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
                    {/* Option: Watch Ads */}
                    <div className="bg-gray-700 rounded-lg p-10 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center text-center relative overflow-hidden w-full max-w-md">
                        <div className="absolute top-0 left-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-br-lg uppercase tracking-wider">{t('freeRewards')}</div>
                        <i className="fas fa-play-circle text-7xl text-gray-500 mb-6"></i>
                        <h3 className="text-2xl font-bold text-white mb-2">{t('watchEarn')}</h3>
                        <p className="text-gray-300 mb-8 text-sm">{t('watchAdDesc')}</p>
                        
                        {adSettings.isEnabled ? (
                            isWatchingAd ? (
                                <div className="text-white font-bold text-2xl animate-pulse bg-gray-800 px-6 py-4 rounded-full border border-gray-600">
                                    {t('adPlaying')} {adTimer}s
                                </div>
                            ) : (
                                <button 
                                    onClick={handleWatchAd} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all transform hover:scale-105 active:scale-95 uppercase italic tracking-widest text-sm"
                                >
                                    {t('watchAd')} (+{adSettings.rewardAmount} Coins)
                                </button>
                            )
                        ) : (
                            <div className="text-red-400 font-bold border border-red-500/50 bg-red-900/10 p-4 rounded text-sm uppercase italic">
                                <i className="fas fa-exclamation-triangle mr-2"></i> {t('adRewardsDisabled')}
                            </div>
                        )}
                        
                        {adSuccess && (
                            <div className="mt-6 text-green-400 font-bold animate-bounce flex items-center gap-2">
                                <i className="fas fa-check-circle"></i> +{adSettings.rewardAmount} {t('coinsAdded')}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                            Official F1™ Poolers Rewards System
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GetCoinsModal;
