import { useLocation } from "../router/Router";
import { type Language, languageFrom } from "./language";

const preferred = (): readonly string[] =>
  navigator.languages?.length ? navigator.languages : [navigator.language ?? ""];

export const useUrlLang = (): Language => languageFrom(useLocation().search, preferred());
