import type { Language } from "../../i18n/language";

const UNITS: Record<Language, { mb: string; gb: string }> = {
  en: { mb: "MB", gb: "GB" },
  fr: { mb: "Mo", gb: "Go" },
};

const decimal = (value: string, language: Language) =>
  language === "fr" ? value.replace(".", ",") : value;

/** Decimal units, as the publishers print them; below 0.1 GB, megabytes, so a small image never reads "0.0". */
export const sizeLabel = (bytes: number, language: Language): string =>
  bytes < 1e8
    ? `${Math.round(bytes / 1e6)} ${UNITS[language].mb}`
    : `${decimal((bytes / 1e9).toFixed(1), language)} ${UNITS[language].gb}`;

export const exactBytes = (bytes: number, language: Language): string =>
  new Intl.NumberFormat(language).format(bytes);

export const ramLabel = (megabytes: number, language: Language): string =>
  megabytes < 1024
    ? `${megabytes} ${UNITS[language].mb}`
    : `${decimal(String(Number((megabytes / 1024).toFixed(1))), language)} ${UNITS[language].gb}`;

const DRIVE_SIZES_GB = [1, 2, 4, 8, 16, 32, 64, 128];

/** Smallest drive sold that holds the image. */
export const driveFor = (bytes: number): number | undefined =>
  DRIVE_SIZES_GB.find((size) => size * 1e9 >= bytes);

export const dateLabel = (iso: string, language: Language): string =>
  new Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));
