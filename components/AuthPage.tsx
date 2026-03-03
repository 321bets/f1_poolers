import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import HowToPlayModal from './HowToPlayModal';

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const { login, signup, biometricAvailable, biometricRegistered, loginWithBiometric } = useAuth();
    const { t, setLanguage, language } = useLanguage();
    const { systemSettings } = useData();
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    
    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Signup State
    const [country, setCountry] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [location, setLocation] = useState<{lat: number, lng: number} | undefined>(undefined);
    const [timezone, setTimezone] = useState(() => {
        try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'America/New_York'; }
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [locationStatus, setLocationStatus] = useState('');
    const [geoDetecting, setGeoDetecting] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-detect country via geolocation when switching to signup
    useEffect(() => {
        if (!isLoginView && !country && !geoDetecting) {
            setGeoDetecting(true);
            if (!navigator.geolocation) {
                setLocationStatus('Geolocation not supported');
                setGeoDetecting(false);
                return;
            }
            setLocationStatus('Detecting location...');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
                        const data = await res.json();
                        const detectedCountry = data?.address?.country || '';
                        if (detectedCountry) {
                            setCountry(detectedCountry);
                            setLocationStatus(detectedCountry);
                        } else {
                            setLocationStatus('Could not detect country');
                        }
                    } catch {
                        setLocationStatus('Could not detect country');
                    }
                    setGeoDetecting(false);
                },
                () => {
                    setLocationStatus('Location access denied');
                    setGeoDetecting(false);
                }
            );
        }
    }, [isLoginView]);

    const handleBiometricLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithBiometric();
        } catch (err: any) {
            setError(err.message || 'Biometric login failed');
        } finally {
            setLoading(false);
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
                if (username.length > 8 || /\s/.test(username)) throw new Error(t('usernameInvalid'));
                if (!/^\d{5}$/.test(password)) throw new Error(t('passwordMustBe5Digits'));
                if (password !== confirmPassword) throw new Error(t('passwordsDontMatch'));
                if (!termsAccepted) throw new Error(t('pleaseAcceptTerms'));
                await signup(username, password, country, location, timezone);
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
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-xl ${language === lang ? 'border-red-600 bg-red-600/20 shadow-lg shadow-red-900/40' : 'border-gray-600 bg-gray-700 hover:border-gray-500'}`}
                    >
                        {lang === 'en' ? '🇬🇧' : lang === 'pt' ? '🇧🇷' : '🇪🇸'}
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
                        {isLoginView ? (
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                        ) : (
                            <>
                                <input type="text" maxLength={8} value={username} onChange={(e) => { const v = e.target.value.replace(/\s/g, ''); if (v.length <= 8) setUsername(v); }} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                                <p className="text-gray-500 text-xs mt-1">{t('usernameHint')}</p>
                            </>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('password')}</label>
                        {isLoginView ? (
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                        ) : (
                            <>
                                <input type="password" inputMode="numeric" maxLength={5} pattern="\d{5}" value={password} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 5) setPassword(v); }} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                                <p className="text-gray-500 text-xs mt-1">{t('passwordHint')}</p>
                            </>
                        )}
                    </div>

                    {!isLoginView && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('confirmPassword')}</label>
                                <input type="password" inputMode="numeric" maxLength={5} pattern="\d{5}" value={confirmPassword} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 5) setConfirmPassword(v); }} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                            </div>
                            <div className="mb-4 bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                    <i className="fas fa-map-marker-alt text-red-500"></i>
                                    <span>{t('locationNotice')}</span>
                                </div>
                                {locationStatus && (
                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                        {geoDetecting ? (
                                            <><i className="fas fa-spinner fa-spin text-yellow-400"></i><span className="text-yellow-400">{locationStatus}</span></>
                                        ) : country ? (
                                            <><i className="fas fa-check-circle text-green-400"></i><span className="text-green-400">{locationStatus}</span></>
                                        ) : (
                                            <><i className="fas fa-exclamation-triangle text-red-400"></i><span className="text-red-400">{locationStatus}</span></>
                                        )}
                                    </div>
                                )}
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

                    {isLoginView && biometricAvailable && biometricRegistered && (
                        <button
                            type="button"
                            onClick={handleBiometricLogin}
                            disabled={loading}
                            className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-all disabled:bg-gray-800 border border-gray-600 flex items-center justify-center gap-2 uppercase italic tracking-widest text-sm"
                        >
                            <i className="fas fa-fingerprint text-red-500 text-lg"></i>
                            {t('biometricLogin')}
                        </button>
                    )}
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