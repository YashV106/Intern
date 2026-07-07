import React, { createContext, useContext, useEffect, useState } from "react";
import { languageNames, translations, type Language } from "@/lib/translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  languageNames: typeof languageNames;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("selectedLanguage") as Language | null;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("selectedLanguage", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    const currentValue = (translations[language] as Record<string, string>)[key];
    const fallbackValue = (translations.en as Record<string, string>)[key];
    return currentValue ?? fallbackValue ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}