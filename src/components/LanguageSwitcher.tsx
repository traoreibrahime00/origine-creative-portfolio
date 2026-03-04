import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const toggleLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-white/80 hover:text-white"
            >
                <Globe size={14} className="text-white/60" />
                <span className="uppercase">{currentLang.code}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-32 bg-zinc-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 py-2"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => toggleLanguage(lang.code)}
                                className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${currentLang.code === lang.code
                                        ? 'text-[hsl(var(--accent-red))] bg-[hsl(var(--accent-red))]/10 font-medium'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {lang.label}
                                {currentLang.code === lang.code && <Check size={14} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
