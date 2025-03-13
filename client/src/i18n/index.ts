import { en } from './en';
import { tr } from './tr';

export const translations = {
  en,
  tr
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;

// Type-safe translation function
export function t(key: string, language: Language = 'en'): string {
  // Split the key by dots to access nested objects
  const keys = key.split('.');
  
  // Get the translation object for the specified language
  let translationObj: any = translations[language];
  
  // Fallback to English if the language is not found
  if (!translationObj) {
    translationObj = translations.en;
  }
  
  // Navigate through the nested objects using the keys
  try {
    for (const k of keys) {
      if (!translationObj || typeof translationObj !== 'object') {
        // If we can't find the translation, use the key
        return key;
      }
      translationObj = translationObj[k];
    }
    
    // Return the translation or the key if not found
    return typeof translationObj === 'string' ? translationObj : key;
  } catch (error) {
    console.warn(`Translation error for key: ${key}`, error);
    return key;
  }
}

// Function to get all available languages
export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' }
  ];
}

// Detect browser language
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0];
  return (browserLang === 'tr' ? 'tr' : 'en') as Language;
}