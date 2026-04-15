import React, { createContext, useContext, useState, useEffect } from 'react';
import arTranslations from '../i18n/ar';
import enTranslations from '../i18n/en';

const LanguageContext = createContext(null);

const translations = {
  ar: arTranslations,
  en: enTranslations,
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('language', language);
  }, [language, dir]);

  const setLanguage = (lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  /**
   * Translate a key using dot notation, e.g. t('nav.home')
   * @param {string} key - Dot-notated translation key
   * @param {object} [params] - Optional interpolation params
   * @returns {string}
   */
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key;
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }

    if (typeof value !== 'string') return key;

    // Simple interpolation: replace {{param}} with params[param]
    return value.replace(/\{\{(\w+)\}\}/g, (_, p) => {
      return params[p] !== undefined ? String(params[p]) : `{{${p}}}`;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
