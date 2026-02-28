import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { TermsContent } from '../../types';

const LayoutManagement: React.FC = () => {
    const { systemSettings, updateSystemSettings } = useData();
    const [termsText, setTermsText] = useState<TermsContent>(systemSettings.termsContent);
    const [activeTermsLang, setActiveTermsLang] = useState<'en' | 'pt' | 'es'>('en');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTermsText(systemSettings.termsContent);
    }, [systemSettings.termsContent]);

    const handleThemeChange = async (theme: 'original' | 'f1') => {
        await updateSystemSettings({ ...systemSettings, theme });
    };

    const handleTermsTextChange = (lang: 'en' | 'pt' | 'es', value: string) => {
        setTermsText(prev => ({ ...prev, [lang]: value }));
    };

    const handleSaveTerms = async () => {
        setIsSaving(true);
        try {
            await updateSystemSettings({ ...systemSettings, termsContent: termsText });
            alert('Terms and Conditions updated successfully.');
        } catch (e) {
            alert('Error updating terms.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold text-red-500 mb-6"><i className="fas fa-swatchbook mr-2"></i> Layout & Theme</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Theme Card */}
                    <div 
                        onClick={() => handleThemeChange('original')}
                        className={`cursor-pointer rounded-lg border-4 overflow-hidden transition-all transform hover:scale-105 ${systemSettings.theme === 'original' ? 'border-red-500 shadow-lg shadow-red-900/50' : 'border-gray-600 opacity-60 hover:opacity-100'}`}
                    >
                        <div className="bg-gray-900 h-32 flex items-center justify-center border-b border-gray-700">
                            <span className="text-gray-200 font-bold text-xl">Original Dark</span>
                        </div>
                        <div className="p-4 bg-gray-800">
                            <h3 className="font-bold text-white mb-2">Original Theme</h3>
                            <p className="text-sm text-gray-400">The standard dark mode interface with rounded corners and standard fonts.</p>
                            {systemSettings.theme === 'original' && <div className="mt-3 text-red-500 text-xs font-bold uppercase"><i className="fas fa-check-circle mr-1"></i> Active</div>}
                        </div>
                    </div>

                    {/* F1 Theme Card */}
                    <div 
                        onClick={() => handleThemeChange('f1')}
                        className={`cursor-pointer rounded-lg border-4 overflow-hidden transition-all transform hover:scale-105 ${systemSettings.theme === 'f1' ? 'border-red-600 shadow-lg shadow-red-900/50' : 'border-gray-600 opacity-60 hover:opacity-100'}`}
                    >
                        <div className="bg-[#15151e] h-32 flex items-center justify-center border-b border-[#38383f] relative overflow-hidden">
                            {/* Abstract Stripe */}
                            <div className="absolute top-0 right-0 w-20 h-full bg-[#e10600] transform skew-x-12 translate-x-10"></div>
                            <span className="text-white font-bold text-xl font-[Titillium_Web] uppercase tracking-wider relative z-10">F1™ Racing Theme</span>
                        </div>
                        <div className="p-4 bg-[#1f1f27]">
                            <h3 className="font-bold text-white mb-2 font-[Titillium_Web]">F1™ Inspired</h3>
                            <p className="text-sm text-gray-400 font-[Titillium_Web]">Immersive layout with official F1™ colors, 'Titillium Web' fonts, and sharp racing aesthetics.</p>
                            {systemSettings.theme === 'f1' && <div className="mt-3 text-[#e10600] text-xs font-bold uppercase"><i className="fas fa-check-circle mr-1"></i> Active</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal & Terms Section */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border-l-4 border-red-600">
                <h2 className="text-2xl font-bold text-white mb-4"><i className="fas fa-gavel mr-2 text-red-600"></i> Platform Legal (Terms & Conditions)</h2>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400 italic mb-2">
                        Edit the general terms and conditions shown to users on signup. 
                        Ensure all trademark and copyright disclaimers are accurate.
                    </p>
                    
                    {/* Language Tabs */}
                    <div className="flex space-x-2 mb-4">
                        {(['en', 'pt', 'es'] as const).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveTermsLang(lang)}
                                className={`px-4 py-2 rounded-t font-bold uppercase text-sm ${activeTermsLang === lang ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                            >
                                {lang === 'en' ? 'English' : lang === 'pt' ? 'Português' : 'Español'}
                            </button>
                        ))}
                    </div>
                    
                    <textarea 
                        value={termsText[activeTermsLang]}
                        onChange={(e) => handleTermsTextChange(activeTermsLang, e.target.value)}
                        className="w-full h-80 bg-gray-900 text-gray-200 p-4 rounded border border-gray-700 font-mono text-sm focus:border-red-600 focus:outline-none custom-scrollbar"
                    />
                    <div className="flex justify-end">
                        <button 
                            onClick={handleSaveTerms}
                            disabled={isSaving}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 rounded shadow-lg transition-colors disabled:bg-gray-700"
                        >
                            {isSaving ? 'Updating...' : 'Update Terms and Conditions'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayoutManagement;