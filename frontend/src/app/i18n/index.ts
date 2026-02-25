import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import resources (dictionaries) from features
import authEN from '../../features/auth/locales/en.json';
import authES from '../../features/auth/locales/es.json';

import dashboardEN from '../../features/dashboard/locales/en.json';
import dashboardES from '../../features/dashboard/locales/es.json';

import layoutEN from '../../components/layout/AuthLayout/locales/en.json';
import layoutES from '../../components/layout/AuthLayout/locales/es.json';

// Language grouped dictionary resource map injecting namespaces
const resources = {
    en: {
        auth: authEN,
        dashboard: dashboardEN,
        layout: layoutEN
    },
    es: {
        auth: authES,
        dashboard: dashboardES,
        layout: layoutES
    }
};

i18n
    // Automatically detects the browser/localStorage language 
    .use(LanguageDetector)
    // Passes the i18n instance to react-i18next
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es', // Default fallback language
        ns: ['auth', 'dashboard', 'layout'], // Declare namespaces
        defaultNS: 'auth', // Default namespace if none specified

        interpolation: {
            escapeValue: false // React already escapes XSS by default
        },

        detection: {
            order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie']
        }
    });

export default i18n;
