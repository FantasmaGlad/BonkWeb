import type { Language } from "../i18n/language";

export type CommandRow = { flag: string; text: Record<Language, string> };

export type CommandEntry = {
  command: string;
  text: Record<Language, string>;
  args: CommandRow[];
  options: CommandRow[];
};

export type CommandSet = { global: CommandRow[]; commands: CommandEntry[] };
