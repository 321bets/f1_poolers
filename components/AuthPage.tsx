import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import HowToPlayModal from './HowToPlayModal';

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const { login, signup } = useAuth();
    const { t, setLanguage, language } = useLanguage();
    const { systemSettings } = useData();
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    
    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Signup State
    const [age, setAge] = useState('');
    const [country, setCountry] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [location, setLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [locationStatus, setLocationStatus] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('Geolocation is not supported');
        } else {
            setLocationStatus('Locating...');
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLocationStatus('Success!');
            }, () => {
                setLocationStatus('Denied');
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLoginView) {
                console.log('Attempting login...', username);
                await login(username, password);
                console.log('Login successful!');
            } else {
                if (password !== confirmPassword) throw new Error("Passwords don't match");
                if (!age || Number(age) < 18) throw new Error("Min age 18");
                if (!termsAccepted) throw new Error("Please accept terms and conditions");
                await signup(username, password, Number(age), country, location);
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Language Selector */}
            <div className="mb-6 flex gap-4 bg-gray-800/50 p-2 rounded-full border border-gray-700">
                {(['en', 'pt', 'es'] as Language[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center font-bold text-xs ${language === lang ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-900/40' : 'border-gray-600 bg-gray-700 text-gray-400 hover:border-gray-500'}`}
                    >
                        {lang.toUpperCase()}
                    </button>
                ))}
            </div>

            <button 
                onClick={() => setIsHowToPlayOpen(true)}
                className="mb-6 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full border border-red-600 shadow-xl transition-all flex items-center gap-2"
            >
                <i className="fas fa-question-circle text-red-500"></i>
                {t('howToPlay')}
            </button>

            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border-t-4 border-red-600">
                <div className="text-center mb-8">
                    <i className="fas fa-flag-checkered text-red-600 text-5xl mb-3"></i>
                    <h1 className="text-3xl font-bold tracking-wider text-white italic">F1™ POOLERS</h1>
                    <p className="text-gray-400 font-medium uppercase tracking-widest text-[10px]">{t('welcome')}</p>
                </div>

                <div className="flex border-b border-gray-700 mb-6">
                    <button onClick={() => setIsLoginView(true)} className={`w-1/2 py-3 text-sm font-bold uppercase tracking-wider ${isLoginView ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400'}`}>{t('login')}</button>
                    <button onClick={() => setIsLoginView(false)} className={`w-1/2 py-3 text-sm font-bold uppercase tracking-wider ${!isLoginView ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400'}`}>{t('signup')}</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <p className="bg-red-900 bg-opacity-50 text-red-200 border border-red-800 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    
                    <div className="mb-4">
                        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('username')}</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('password')}</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                    </div>

                    {!isLoginView && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('confirmPassword')}</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('age')}</label>
                                    <input type="number" min="18" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('country')}</label>
                                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                                </div>
                            </div>
                            <div className="mb-6 flex items-center">
                                <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="w-4 h-4 text-red-600 bg-gray-700 border-gray-500 rounded focus:ring-red-600" required />
                                <label htmlFor="terms" className="ml-2 text-xs font-medium text-gray-300">
                                    {t('termsAgree')} <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-red-500 hover:underline">{t('termsAndConditions')}</button>
                                </label>
                            </div>
                        </>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 px-4 rounded transition-all disabled:bg-gray-700 shadow-lg shadow-red-900/20 uppercase italic tracking-widest"
                    >
                        {loading ? '...' : (isLoginView ? t('login') : t('signup'))}
                    </button>
                </form>
            </div>
            
            {isHowToPlayOpen && (
                <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />
            )}

            {isTermsModalOpen && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-gray-700">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                            <h2 className="text-lg font-bold text-white uppercase italic">{t('termsAndConditions')}</h2>
                            <button onClick={() => setIsTermsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-800 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {systemSettings.termsContent[language]}
                        </div>
                        <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-end">
                            <button onClick={() => setIsTermsModalOpen(false)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded uppercase italic text-xs tracking-widest">{t('close')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPage;