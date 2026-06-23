'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';

const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: enTranslations,
    },
  },
});

export const loadLocale = async (lang: string) => {
  if (lang === 'en') {
    await i18n.changeLanguage('en');
    return;
  }
  try {
    const res = await import(`./${lang}.json`);
    i18n.addResourceBundle(lang, 'translation', res.default || res, true, false);
    await i18n.changeLanguage(lang);
  } catch (err) {
    console.error(`Failed to load locale: ${lang}`, err);
    // fallback to en
    await i18n.changeLanguage('en');
  }
};

export default i18n;
