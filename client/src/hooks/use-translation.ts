import { useLanguage } from "@/i18n/LanguageContext";
import { t as translate } from "@/i18n";

/**
 * Hook to access translations using the current language
 */
export function useTranslation() {
  const { language } = useLanguage();

  /**
   * Translate a key using the current language
   * @param key The translation key in dot notation format (e.g., 'app.loading')
   * @param params Optional parameters to replace placeholders in the translation
   * @returns The translated string
   */
  const t = (key: string, params?: Record<string, string | number>) => {
    const translation = translate(key, language);
    
    if (!translation) {
      console.warn(`Translation key not found: ${key} (${language})`);
      return key;
    }
    
    if (!params) {
      return translation;
    }
    
    // Replace placeholders like {{paramName}} with the actual values
    return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
      return result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    }, translation);
  };

  return { t, language };
}