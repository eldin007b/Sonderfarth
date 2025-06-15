import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

const themes = {
  light: {
    background: '#ffffff',
    color: '#000000',
  },
  dark: {
    background: '#121212',
    color: '#ffffff',
  },
  gls: {
    background: '#002b7f',
    color: '#ffd700',
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((value) => {
      if (value) setThemeName(value);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('theme', themeName);
  }, [themeName]);

  const toggleTheme = () => {
    const nextTheme =
      themeName === 'light' ? 'dark' : themeName === 'dark' ? 'gls' : 'light';
    setThemeName(nextTheme);
  };

  const themeStyles = themes[themeName];
  const setTheme = setThemeName;

  return (
    <ThemeContext.Provider
      value={{
        theme: themeName,     // za kompatibilnost sa starim SettingsScreen
        themeName,
        setTheme,
        setThemeName,
        themeStyles,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
