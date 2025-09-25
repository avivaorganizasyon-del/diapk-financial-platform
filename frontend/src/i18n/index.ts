import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

const resources = {
  tr: {
    translation: tr
  },
  en: {
    translation: en
  },
  de: {
    translation: de
  },
  fr: {
    translation: fr
  },
  es: {
    translation: es
  }
};

// Supported languages
const supportedLanguages = ['tr', 'en', 'de', 'fr', 'es'];

// Get browser language and check if it's supported
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0]; // Get language code without region
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

// Get initial language from localStorage or browser
// const getInitialLanguage = () => {
//   const savedLanguage = localStorage.getItem('language');
//   if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
//     return savedLanguage;
//   }
//   return getBrowserLanguage();
// };

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'tr',
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    debug: true,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Save language change to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;