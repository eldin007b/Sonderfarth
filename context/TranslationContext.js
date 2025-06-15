// context/TranslationContext.js
import React, { createContext, useState, useEffect } from 'react';
import translations from '../translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  // Prilikom pokretanja aplikacije učitaj jezik iz AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('appLanguage').then((lng) => {
      if (lng) setLanguageState(lng);
    });
  }, []);

  // Kad promijeniš jezik, snimi u AsyncStorage
  const setLanguage = (lng) => {
    setLanguageState(lng);
    AsyncStorage.setItem('appLanguage', lng);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};
