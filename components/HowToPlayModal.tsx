
import React, { useState, useRef } from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface HowToPlayModalProps {
    onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'scoring' | 'guide' | 'leagues'>('guide');
    const { t, language, setLanguage } = useLanguage();

    const shareMessage = "Check out F1 Poolers! 🏎️ The most competitive F1 strategy game with friends. Start each round with free Fun-Coins! 🏁";
    const shareUrl = window.location.origin;

    const handleShareEmail = () => {
        window.location.href = `mailto:?subject=Join F1 Poolers&body=${encodeURIComponent(shareMessage + "\n\nPlay here: " + shareUrl)}`;
    };

    const handleShareSMS = () => {
        window.location.href = `sms:?body=${encodeURIComponent(shareMessage + " " + shareUrl)}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[100] p-2 sm:p-4 backdrop-blur-md">
            <style>{`
                @keyframes race-glow { 0% { box-shadow: 0 0 5px #e10600; } 50% { box-shadow: 0 0 20px #e10600; } 100% { box-shadow: 0 0 5px #e10600; } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .app-card-sim { background: #1f1f27; border: 2px solid #e10600; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .skew-btn { transform: skew-x(-12deg); }
                .skew-content { transform: skew-x(12deg); }
            `}</style>

            <div className="bg-[#15151e] border-t-4 border-[#e10600] rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden font-['Titillium_Web'] relative">
                {/* Header - Fixed height */}
                <div className="flex-none p-4 border-b border-gray-800 flex justify-between items-center bg-[#1f1f27] relative z-30">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#e10600] p-2 transform -skew-x-12">
                            <i className="fas fa-book-open text-white"></i>
                        </div>
                        <h2 className="text-sm sm:text-xl font-black text-white uppercase tracking-tighter italic truncate max-w-[150px] sm:max-w-none">
                            {t('manualTitle')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex gap-1">
                            {(['en', 'pt', 'es'] as Language[]).map(l => (
                                <button key={l} onClick={() => setLanguage(l)} className={`px-1.5 py-0.5 text-lg border rounded ${language === l ? 'bg-red-600/20 border-red-600' : 'border-gray-700'}`}>
                                    {l === 'en' ? '🇬🇧' : l === 'pt' ? '🇧🇷' : '🇪🇸'}
                                </button>
                            ))}
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl sm:text-3xl font-light leading-none">&times;</button>
                    </div>
                </div>

                {/* Sub-Tabs Navigation Bar - Fixed height */}
                <div className="flex-none flex bg-[#1f1f27] border-b border-gray-800 overflow-x-auto no-scrollbar relative z-20">
                    <button 
                        onClick={() => setActiveTab('guide')}
                        className={`flex-1 min-w-[100px] sm:min-w-[120px] py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-b-4 relative z-30 ${activeTab === 'guide' ? 'text-[#e10600] border-[#e10600] bg-[#15151e]' : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#15151e]/50'}`}
                    >
                        <i className="fas fa-flag mr-1 sm:mr-2"></i> {t('howToBet')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('scoring')}
                        className={`flex-1 min-w-[100px] sm:min-w-[120px] py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-b-4 relative z-30 ${activeTab === 'scoring' ? 'text-[#e10600] border-[#e10600] bg-[#15151e]' : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#15151e]/50'}`}
                    >
                        <i className="fas fa-calculator mr-1 sm:mr-2"></i> {t('detailedScoring')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('leagues')}
                        className={`flex-1 min-w-[100px] sm:min-w-[120px] py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-b-4 relative z-30 ${activeTab === 'leagues' ? 'text-[#e10600] border-[#e10600] bg-[#15151e]' : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#15151e]/50'}`}
                    >
                        <i className="fas fa-users mr-1 sm:mr-2"></i> {t('socialLeagues')}
                    </button>
                </div>

                {/* Scrollable Content Area - Fills remaining space */}
                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#15151e] p-4 sm:p-6 relative z-10">
                    {activeTab === 'guide' && (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                            {/* Multiplier Details Section */}
                            <div className="bg-[#1f1f27] p-4 sm:p-6 rounded-lg border border-gray-800">
                                <h3 className="text-blue-400 font-black uppercase italic mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                                    <i className="fas fa-clock"></i>
                                    {t('article2')} ({t('multiplierMechanics')})
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed">{t('multiplierIntro')}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <div className="bg-black/40 p-2 sm:p-3 rounded border border-blue-900 flex flex-col items-center">
                                            <span className="text-blue-500 font-black text-base sm:text-lg">5.0x</span>
                                            <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tighter">&gt; 5 Days</span>
                                        </div>
                                        <div className="bg-black/40 p-2 sm:p-3 rounded border border-blue-900 flex flex-col items-center">
                                            <span className="text-blue-500 font-black text-base sm:text-lg">3.0x</span>
                                            <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tighter">&gt; 3 Days</span>
                                        </div>
                                        <div className="bg-black/40 p-2 sm:p-3 rounded border border-blue-900 flex flex-col items-center">
                                            <span className="text-blue-500 font-black text-base sm:text-lg">1.5x</span>
                                            <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tighter">&gt; 1 Day</span>
                                        </div>
                                        <div className="bg-black/40 p-2 sm:p-3 rounded border border-gray-700 flex flex-col items-center">
                                            <span className="text-white font-black text-base sm:text-lg">1.0x</span>
                                            <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-tighter">&lt; 24h</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-yellow-500 italic bg-yellow-900/10 p-2 border border-yellow-900/30 rounded">
                                        <i className="fas fa-exclamation-triangle mr-1"></i> {t('multiplierLock')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-black uppercase italic mb-4 flex items-center gap-2 text-sm sm:text-base">
                                    <span className="bg-[#e10600] w-1 h-5"></span>
                                    {t('howToBet')}
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#1f1f27] p-4 sm:p-6 rounded-lg border border-gray-800">
                                    <div className="relative h-40 sm:h-48 bg-[#15151e] rounded border border-gray-700 overflow-hidden flex flex-col items-center justify-center gap-4">
                                        <div className="flex items-center gap-6 sm:gap-8">
                                            <div className="flex flex-col items-center gap-1 sm:gap-2">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-700 border-2 border-gray-500 flex items-center justify-center text-white shadow-lg overflow-hidden">
                                                    <img src="https://media.formula1.com/content/dam/fom-website/drivers/2024Drivers/verstappen.jpg.img.1024.medium.jpg" className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase">1. {t('tapGrid')}</div>
                                            </div>
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-700/20 border-2 border-dashed border-[#e10600] flex items-center justify-center text-[#e10600] relative">
                                                <i className="fas fa-plus"></i>
                                                <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase">2. {t('selectSlot')}</div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic text-center">{t('tapAnyDriver')}</p>
                                    </div>
                                    
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex gap-2 sm:gap-3">
                                            <span className="text-[#e10600] font-black italic text-xl sm:text-2xl">01</span>
                                            <p className="text-gray-300 text-xs sm:text-sm"><strong className="text-white uppercase">{t('chooseStrategy')}:</strong> {t('betStep1')}</p>
                                        </div>
                                        <div className="flex gap-2 sm:gap-3">
                                            <span className="text-[#e10600] font-black italic text-xl sm:text-2xl">02</span>
                                            <p className="text-gray-300 text-xs sm:text-sm"><strong className="text-white uppercase">{t('theGrid')}:</strong> {t('betStep2')}</p>
                                        </div>
                                        <div className="flex gap-2 sm:gap-3">
                                            <span className="text-[#e10600] font-black italic text-xl sm:text-2xl">03</span>
                                            <p className="text-gray-300 text-xs sm:text-sm"><strong className="text-white uppercase">{t('finalize')}:</strong> {t('betStep3')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'scoring' && (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                             <div className="bg-[#1f1f27] p-4 sm:p-6 rounded-lg border border-gray-800">
                                <h3 className="text-[#e10600] font-black uppercase italic text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                                    <i className="fas fa-user-astronaut"></i> {t('article1')} ({t('driverPredictions')})
                                </h3>
                                <p className="text-gray-400 text-xs mb-4 leading-relaxed italic border-b border-gray-800 pb-4">
                                    {t('driverPredictionsDesc')}
                                </p>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <div className="bg-[#e10600] text-white text-[9px] sm:text-[10px] font-black uppercase py-1 px-3 skew-btn inline-block mb-2">
                                            <span className="skew-content">{t('mainRace')}</span>
                                        </div>
                                        <table className="w-full text-[10px] sm:text-xs">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-gray-800">
                                                    <th className="text-left pb-1">{t('pos')}</th>
                                                    <th className="text-right pb-1">{t('exact')}</th>
                                                    <th className="text-right pb-1">{t('anyT5')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-300">
                                                <tr className="border-b border-gray-800/50"><td className="py-1 font-bold text-white">P1</td><td className="text-right text-white font-black">25</td><td className="text-right text-blue-400">5</td></tr>
                                                <tr className="border-b border-gray-800/50"><td className="py-1">P2</td><td className="text-right text-white font-bold">18</td><td className="text-right text-blue-400">5</td></tr>
                                                <tr className="border-b border-gray-800/50"><td className="py-1">P3</td><td className="text-right text-white font-bold">15</td><td className="text-right text-blue-400">5</td></tr>
                                                <tr className="border-b border-gray-800/50"><td className="py-1">P4</td><td className="text-right text-white font-bold">12</td><td className="text-right text-blue-400">5</td></tr>
                                                <tr className="border-b border-gray-800/50"><td className="py-1">P5</td><td className="text-right text-white font-bold">10</td><td className="text-right text-blue-400">5</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-purple-600 text-white text-[9px] sm:text-[10px] font-black uppercase py-1 px-3 skew-btn inline-block mb-2">
                                            <span className="skew-content">{t('qualifying')}</span>
                                        </div>
                                        <table className="w-full text-[10px] sm:text-xs text-gray-300">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-gray-800">
                                                    <th className="text-left pb-1">{t('pos')}</th>
                                                    <th className="text-right pb-1">{t('exact')}</th>
                                                    <th className="text-right pb-1">{t('anyT5')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/50">
                                                <tr><td className="py-1 font-bold text-white">P1</td><td className="text-right text-white font-black">18</td><td className="text-right text-blue-400">3</td></tr>
                                                <tr><td className="py-1">P2</td><td className="text-right text-white font-bold">15</td><td className="text-right text-blue-400">3</td></tr>
                                                <tr><td className="py-1">P3</td><td className="text-right text-white font-bold">12</td><td className="text-right text-blue-400">3</td></tr>
                                                <tr><td className="py-1">P4</td><td className="text-right text-white font-bold">9</td><td className="text-right text-blue-400">3</td></tr>
                                                <tr><td className="py-1">P5</td><td className="text-right text-white font-bold">6</td><td className="text-right text-blue-400">3</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-black uppercase py-1 px-3 skew-btn inline-block mb-2">
                                            <span className="skew-content">{t('sprintRace')}</span>
                                        </div>
                                        <table className="w-full text-[10px] sm:text-xs text-gray-300">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-gray-800">
                                                    <th className="text-left pb-1">{t('pos')}</th>
                                                    <th className="text-right pb-1">{t('exact')}</th>
                                                    <th className="text-right pb-1">{t('anyT5')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/50">
                                                <tr><td className="py-1 font-bold text-white">P1</td><td className="text-right text-white font-black">8</td><td className="text-right text-blue-400">2</td></tr>
                                                <tr><td className="py-1">P2</td><td className="text-right text-white font-bold">7</td><td className="text-right text-blue-400">2</td></tr>
                                                <tr><td className="py-1">P3</td><td className="text-right text-white font-bold">6</td><td className="text-right text-blue-400">2</td></tr>
                                                <tr><td className="py-1">P4</td><td className="text-right text-white font-bold">5</td><td className="text-right text-blue-400">2</td></tr>
                                                <tr><td className="py-1">P5</td><td className="text-right text-white font-bold">4</td><td className="text-right text-blue-400">2</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Constructor Scoring Detail */}
                            <div className="bg-[#1f1f27] p-4 sm:p-6 rounded-lg border border-gray-800">
                                <h3 className="text-blue-500 font-black uppercase italic text-lg sm:text-xl mb-4 flex items-center gap-3">
                                    <i className="fas fa-users-cog"></i> {t('article1_1')} ({t('teamPredictions')})
                                </h3>
                                <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                                    {t('teamPredictionsDesc')}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-blue-900/10 p-4 rounded border border-blue-900/30">
                                        <p className="text-white font-black uppercase text-[9px] sm:text-[10px] mb-2">{t('teamMainRacePoints')}</p>
                                        <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 grid grid-cols-5 gap-1">
                                            <div className="flex flex-col items-center"><span>P1</span><span className="text-white text-xs sm:text-sm">12.5</span></div>
                                            <div className="flex flex-col items-center"><span>P2</span><span className="text-white text-xs sm:text-sm">9</span></div>
                                            <div className="flex flex-col items-center"><span>P3</span><span className="text-white text-xs sm:text-sm">7.5</span></div>
                                            <div className="flex flex-col items-center"><span>P4</span><span className="text-white text-xs sm:text-sm">6</span></div>
                                            <div className="flex flex-col items-center"><span>P5</span><span className="text-white text-xs sm:text-sm">5</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-900/10 p-4 rounded border border-blue-900/30">
                                        <p className="text-white font-black uppercase text-[9px] sm:text-[10px] mb-2">{t('teamStrategyAdvantages')}</p>
                                        <ul className="text-gray-400 text-[10px] space-y-2">
                                            <li className="flex justify-between"><span>{t('doubleCarCoverage')}</span> <span className="text-green-400 font-bold">YES</span></li>
                                            <li className="flex justify-between"><span>{t('safetyPartialPoints')}</span> <span className="text-blue-400 font-bold">2.5 pts</span></li>
                                            <li className="flex justify-between"><span>{t('jackpotEligibility')}</span> <span className="text-red-500 font-bold">NO</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Jackpot Protocol Detail */}
                            <div className="bg-[#1f1f27] p-6 rounded-lg border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                <h3 className="text-yellow-500 font-black uppercase italic text-xl mb-4 flex items-center gap-3">
                                    <i className="fas fa-gem"></i> {t('article1_2')} ({t('perfectScore')})
                                </h3>
                                <p className="text-gray-300 text-xs mb-4 leading-relaxed">{t('jackpotProtocolDesc')}</p>
                                <div className="bg-black/40 p-3 rounded text-[10px] text-yellow-400 font-bold flex items-center justify-center gap-2">
                                    <i className="fas fa-info-circle"></i> {t('jackpotTrigger')}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'leagues' && (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                             <div className="bg-[#1f1f27] p-6 sm:p-8 rounded-lg border border-gray-800 text-center">
                                <h4 className="text-white font-black uppercase italic text-lg sm:text-2xl mb-3 sm:mb-4 italic tracking-tighter">{t('leagueTelemetry')}</h4>
                                <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">{t('leagueIntro')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="bg-[#1f1f27] p-4 rounded border border-gray-800">
                                        <div className="h-32 mb-4 bg-gray-900 rounded overflow-hidden relative border border-gray-700">
                                            <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" alt="Friends laughing" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <i className="fas fa-users text-4xl text-blue-500 drop-shadow-xl"></i>
                                            </div>
                                        </div>
                                        <h5 className="text-blue-500 font-black uppercase italic text-[10px] sm:text-xs mb-2">{t('createYourPaddock')}</h5>
                                        <p className="text-gray-400 text-[10px] sm:text-[11px] leading-relaxed">
                                            {t('createPaddockDesc')}
                                        </p>
                                    </div>
                                    <div className="bg-[#1f1f27] p-4 rounded border border-gray-800">
                                        <div className="h-32 mb-4 bg-gray-900 rounded overflow-hidden relative border border-gray-700">
                                            <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" alt="Digital art" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <i className="fas fa-trophy text-4xl text-yellow-500 drop-shadow-xl"></i>
                                            </div>
                                        </div>
                                        <h5 className="text-yellow-500 font-black uppercase italic text-[10px] sm:text-xs mb-2">{t('customTrophiesRewards')}</h5>
                                        <p className="text-gray-400 text-[10px] sm:text-[11px] leading-relaxed">
                                            {t('customTrophiesDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[#1f1f27] p-4 sm:p-6 rounded-lg border border-gray-800 flex flex-col">
                                    <div className="flex-1">
                                        <h5 className="text-red-600 font-black uppercase italic text-xs sm:text-sm mb-4 flex items-center gap-2">
                                            <i className="fas fa-comment-dots"></i> {t('socialCommunication')}
                                        </h5>
                                        <div className="bg-black/30 p-4 rounded border border-gray-700 mb-4 space-y-3">
                                            <div className="flex gap-2 items-start">
                                                <div className="w-6 h-6 rounded-full bg-red-600 flex-shrink-0"></div>
                                                <div className="bg-gray-800 p-2 rounded text-[10px] text-gray-300">"{t('chatExample1')}"</div>
                                            </div>
                                            <div className="flex gap-2 items-start flex-row-reverse">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0"></div>
                                                <div className="bg-blue-900/40 p-2 rounded text-[10px] text-gray-100">"{t('chatExample2')}"</div>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 sm:space-y-4 text-[10px] sm:text-[11px] text-gray-400">
                                            <li className="flex items-start gap-3">
                                                <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                                                <span><strong className="text-white uppercase">{t('realTimeChat')}</strong> {t('realTimeChatDesc')}</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                                                <span><strong className="text-white uppercase">{t('reactions')}</strong> {t('reactionsFeatureDesc')}</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                                                <span><strong className="text-white uppercase">{t('highRollerBadges')}</strong> {t('highRollerBadgesDesc')}</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <i className="fas fa-shield-alt text-blue-400 mt-0.5"></i>
                                                <span><strong className="text-white uppercase">{t('moderation')}</strong> {t('moderationDesc')}</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="mt-6 p-4 bg-red-900/10 border border-red-900/30 rounded italic text-[10px] text-gray-500">
                                        {t('messageClearNote')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Fixed height */}
                <div className="flex-none p-4 bg-[#1f1f27] border-t border-gray-800 relative z-20">
                    <button onClick={onClose} className="w-full bg-[#e10600] hover:bg-red-700 text-white font-black py-3 sm:py-4 rounded-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-xs transition-all transform active:scale-95 italic">
                        {t('acceptTerms')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HowToPlayModal;
