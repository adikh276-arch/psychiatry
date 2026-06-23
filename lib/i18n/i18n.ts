'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enDict from './en.json';

// Use a global namespace so multiple features don't overwrite each other if they initialize separately,
// though in Next.js it's usually better to just have one.
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false 
      },
      resources: {
        en: {
          translation: enDict
        }
      }
    });
}

// Dynamically load the requested language
export const loadGlobalResource = async (lang: string) => {
    if (lang === 'en') {
        await i18n.changeLanguage('en');
        return; // Already loaded
    }
    try {
        const res = await import(`./${lang}.json`);
        i18n.addResourceBundle(lang, 'translation', res.default || res, true, false);
        await i18n.changeLanguage(lang);
    } catch (e) {
        console.error(`Could not load translations for ${lang}`, e);
        await i18n.changeLanguage('en');
    }
};

export default i18n;
