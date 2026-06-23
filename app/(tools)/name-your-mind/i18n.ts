import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18n = i18next.createInstance();

export async function loadLocale(lang: string) {
  try {
    const messages = await import(`./i18n/${lang}.json`).catch(() => import('./i18n/en.json'));
    if (!i18n.isInitialized) {
      await i18n.use(initReactI18next).init({
        lng: lang,
        fallbackLng: 'en',
        resources: { [lang]: { translation: messages.default } },
        interpolation: { escapeValue: false },
      });
    } else {
      i18n.addResourceBundle(lang, 'translation', messages.default, true, true);
      await i18n.changeLanguage(lang);
    }
  } catch {
    // fallback silently
  }
}

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {},
  interpolation: { escapeValue: false },
});

export default i18n;
