import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import HowToPlayModal from './HowToPlayModal';

const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
    'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
    'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
    'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
    'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
];

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
                if (!age || Number(age) < 18) throw new Error(t('minAge18'));
                if (!termsAccepted) throw new Error(t('pleaseAcceptTerms'));
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
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('age')}</label>
                                    <input type="number" min="18" value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">{t('country')}</label>
                                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-gray-700 text-white rounded py-2 px-3 focus:outline-none focus:ring-1 focus:ring-red-600" required>
                                        <option value="">{t('selectCountry')}</option>
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
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