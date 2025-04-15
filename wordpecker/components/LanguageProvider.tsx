import React, { createContext, useContext, ReactNode } from "react";
import { useLanguageStore } from "@/store/languageStore";
import { Language } from "@/types";

interface LanguageContextType {
  currentLanguage: Language;
  availableLanguages: Language[];
  setLanguage: (languageCode: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { currentLanguage, availableLanguages, setLanguage, translate } = useLanguageStore();

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        availableLanguages, 
        setLanguage, 
        t: translate 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};