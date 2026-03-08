
import React, { useState } from 'react';
import { Bet, Event } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { shareBetSlip, downloadBetSlipImage } from '../services/shareService';

interface BetConfirmationModalProps {
  bet: Bet;
  event: Event;
  onClose: () => void;
}

const BetConfirmationModal: React.FC<BetConfirmationModalProps> = ({ bet, event, onClose }) => {
  const { t } = useLanguage();
  const { rounds } = useData();
  const { user } = useAuth();
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'shared' | 'copied' | 'downloaded' | 'error'>('idle');

  const round = rounds.find(r => r.id === event.roundId);

  const handleShare = async () => {
    if (!round || !user) return;
    setShareStatus('sharing');
    try {
      const result = await shareBetSlip(bet, event, round, user.username);
      setShareStatus(result);
      setTimeout(() => setShareStatus('idle'), 3000);
    } catch {
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  const handleDownload = async () => {
    if (!round || !user) return;
    try {
      await downloadBetSlipImage(bet, event, round, user.username);
    } catch {
      // silently fail
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 text-center sticky top-0 bg-gray-800 z-10">
          <i className="fas fa-check-circle text-green-500 text-4xl mb-3"></i>
          <h2 className="text-xl font-bold text-white">{t('betConfirmed')}</h2>
          <p className="text-gray-400 text-sm">{t('yourSlipFor')} {event.type}</p>
        </div>
        
        <div className="p-4">
            {bet.predictions && bet.predictions.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <h3 className="font-semibold text-gray-300 mb-2 text-sm border-b border-gray-600 pb-1">{t('driverPredictions')}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                    {bet.predictions.map((driver) => (
                        <li key={driver.id} className="flex items-center">
                            <img src={driver.imageUrl} alt={driver.name} className="w-6 h-6 rounded-full mr-2" />
                            <span className="font-semibold text-white">{driver.name}</span>
                        </li>
                    ))}
                    </ol>
                </div>
            )}
            
            {bet.teamPredictions && bet.teamPredictions.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <h3 className="font-semibold text-gray-300 mb-2 text-sm border-b border-gray-600 pb-1">{t('teamPredictions')}</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                    {bet.teamPredictions.map((team) => (
                        <li key={team.id} className="flex items-center">
                            <div className="w-6 h-6 rounded-full mr-2 bg-white flex items-center justify-center p-0.5">
                                <img src={team.logoUrl} alt={team.name} className="max-w-full max-h-full" />
                            </div>
                            <span className="font-semibold text-white">{team.name}</span>
                        </li>
                    ))}
                    </ol>
                </div>
            )}

            <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                <span className="text-gray-400 font-semibold">{t('entryFeePaid')}</span>
                <span className="text-yellow-400 font-bold text-lg">
                    {event.betValue} <i className="fas fa-coins text-xs"></i>
                </span>
            </div>
        </div>

        <div className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800 space-y-2">
            {/* Share & Download row */}
            <div className="flex gap-2">
              <button 
                onClick={handleShare}
                disabled={shareStatus === 'sharing'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {shareStatus === 'sharing' ? (
                  <><i className="fas fa-spinner fa-spin"></i> {t('sharing')}</>
                ) : shareStatus === 'shared' ? (
                  <><i className="fas fa-check"></i> {t('shared')}</>
                ) : shareStatus === 'copied' ? (
                  <><i className="fas fa-check"></i> {t('copiedToClipboard')}</>
                ) : (
                  <><i className="fas fa-share-alt"></i> {t('sharePrediction')}</>
                )}
              </button>
              <button 
                onClick={handleDownload}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
                title={t('downloadImage')}
              >
                <i className="fas fa-download"></i>
              </button>
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-red-700"
            >
              {t('goodLuck')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default BetConfirmationModal;
