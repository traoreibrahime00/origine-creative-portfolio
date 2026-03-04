import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CookieBanner() {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);

    // Cookie states
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
    const [marketingEnabled, setMarketingEnabled] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('origine-cookie-consent');
        if (!consent) {
            // Slight delay before showing banner for better UX
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('origine-cookie-consent', JSON.stringify({
            necessary: true,
            analytics: true,
            marketing: true,
            date: new Date().toISOString()
        }));
        setIsVisible(false);
    };

    const declineAll = () => {
        localStorage.setItem('origine-cookie-consent', JSON.stringify({
            necessary: true, // Always required
            analytics: false,
            marketing: false,
            date: new Date().toISOString()
        }));
        setIsVisible(false);
    };

    const savePreferences = () => {
        localStorage.setItem('origine-cookie-consent', JSON.stringify({
            necessary: true,
            analytics: analyticsEnabled,
            marketing: marketingEnabled,
            date: new Date().toISOString()
        }));
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 lg:left-auto lg:right-8 lg:w-[480px] z-[100] bg-black/80 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-black/50"
                >
                    {!isCustomizing ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent-red))]/10 flex items-center justify-center shrink-0">
                                    <Cookie className="text-[hsl(var(--accent-red))]" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight mb-2">{t('cookie.title')}</h3>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        {t('cookie.desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={acceptAll}
                                    className="flex-1 bg-white text-black font-semibold py-3 px-6 rounded-full hover:bg-zinc-200 transition-colors text-sm"
                                >
                                    {t('cookie.acceptAll')}
                                </button>
                                <button
                                    onClick={declineAll}
                                    className="sm:w-auto w-full bg-white/5 text-white font-medium py-3 px-6 rounded-full hover:bg-white/10 hover:text-white transition-colors border border-white/10 text-sm"
                                >
                                    {t('cookie.declineAll')}
                                </button>
                            </div>
                            <button
                                onClick={() => setIsCustomizing(true)}
                                className="text-white/40 text-xs hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-all text-center"
                            >
                                {t('cookie.customize')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold tracking-tight">Vos préférences</h3>
                                <button onClick={() => setIsCustomizing(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">{t('cookie.necessaryTitle')}</h4>
                                        <p className="text-white/40 text-xs leading-relaxed">{t('cookie.necessaryDesc')}</p>
                                    </div>
                                    <div className="w-10 h-6 shrink-0 rounded-full bg-[hsl(var(--accent-red))] relative opacity-50 cursor-not-allowed">
                                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
                                    </div>
                                </div>

                                <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">{t('cookie.analyticsTitle')}</h4>
                                        <p className="text-white/40 text-xs leading-relaxed">{t('cookie.analyticsDesc')}</p>
                                    </div>
                                    <div className={`w-10 h-6 shrink-0 rounded-full relative transition-colors duration-300 ${analyticsEnabled ? 'bg-[hsl(var(--accent-red))]' : 'bg-white/20'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${analyticsEnabled ? 'translate-x-5' : 'translate-x-1'}`}></div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={analyticsEnabled} onChange={(e) => setAnalyticsEnabled(e.target.checked)} />
                                </label>

                                <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">{t('cookie.marketingTitle')}</h4>
                                        <p className="text-white/40 text-xs leading-relaxed">{t('cookie.marketingDesc')}</p>
                                    </div>
                                    <div className={`w-10 h-6 shrink-0 rounded-full relative transition-colors duration-300 ${marketingEnabled ? 'bg-[hsl(var(--accent-red))]' : 'bg-white/20'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${marketingEnabled ? 'translate-x-5' : 'translate-x-1'}`}></div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={marketingEnabled} onChange={(e) => setMarketingEnabled(e.target.checked)} />
                                </label>
                            </div>

                            <button
                                onClick={savePreferences}
                                className="w-full bg-white text-black font-semibold py-3 px-6 rounded-full hover:bg-zinc-200 transition-colors mt-2 text-sm"
                            >
                                {t('cookie.save')}
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
