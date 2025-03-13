import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Language, detectBrowserLanguage } from "./index";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

// Hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Get the initial language from localStorage or detect from browser
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "tr")) {
      return savedLanguage;
    }
    return detectBrowserLanguage(); // Fallback to browser detection
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
    document.documentElement.lang = lang;
    
    // Set RTL attribute for appropriate languages (not needed for English/Turkish)
    // if (["ar", "he", "fa"].includes(lang)) {
    //   document.documentElement.dir = "rtl";
    // } else {
    //   document.documentElement.dir = "ltr";
    // }
  };
  
  // Initialize language on first render
  useEffect(() => {
    document.documentElement.lang = language;
    // Set page direction if needed
    // document.documentElement.dir = ["ar", "he", "fa"].includes(language) ? "rtl" : "ltr";
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};