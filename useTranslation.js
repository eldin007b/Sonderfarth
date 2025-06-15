
import { useContext } from 'react';
import { TranslationContext } from './context/TranslationContext';

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within a TranslationProvider');

  // ISPRAVKA:
  const t = context.t;

  return {
    t,
    language: context.language,
    setLanguage: context.setLanguage,
  };
};
