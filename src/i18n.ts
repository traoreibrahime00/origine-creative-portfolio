import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from './locales/fr/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
    fr: {
        translation: translationFR
    },
    en: {
        translation: translationEN
    }
};

i18n
    // detect user language automatically using browser settings or localStorage
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next
    .use(initReactI18next)
    // init i18next
    .init({
        resources,
        fallbackLng: 'fr', // French is our default base language

        // French unless the visitor picked English with the FR/EN switch
        // (stored in localStorage). The browser's own language is not used:
        // Google's crawler presents itself in English and would otherwise
        // index every page in English for a French-speaking market.
        detection: {
            order: ['localStorage'],
            caches: ['localStorage'],
            lookupLocalStorage: 'origine-creative-lang',
        },

        interpolation: {
            escapeValue: false // React already escapes by default to prevent XSS
        }
    });

export default i18n;
