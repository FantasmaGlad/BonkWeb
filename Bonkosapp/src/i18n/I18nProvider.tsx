import { createContext, type ReactNode, useContext, useEffect } from "react";
import { type Dictionary, en } from "./en";
import { fr } from "./fr";
import type { Language } from "./language";
import { useUrlLang } from "./useUrlLang";

const DICTIONARIES: Record<Language, Dictionary> = { en, fr };

const LanguageContext = createContext<Language>("en");

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useUrlLang();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

export const useLanguage = (): Language => useContext(LanguageContext);
export const useText = (): Dictionary => DICTIONARIES[useContext(LanguageContext)];
