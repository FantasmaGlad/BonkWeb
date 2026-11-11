import type { Category } from "../types/system";

const LIGHT_RAM_MB = 1024;

/** Usage categories of the marketplace rail, from editorial tags and catalog facts. */
export const CATEGORIES: readonly Category[] = [
  { id: "all", match: () => true },
  { id: "daily", match: ({ profile }) => profile.tags.includes("daily") },
  { id: "windows", match: ({ family }) => family.category === "Windows" },
  {
    id: "server",
    match: ({ family, profile }) =>
      family.category === "Servers" || profile.tags.includes("server"),
  },
  {
    id: "light",
    match: ({ profile }) =>
      profile.tags.includes("light") ||
      (profile.ramMb !== undefined && profile.ramMb <= LIGHT_RAM_MB),
  },
  { id: "security", match: ({ profile }) => profile.tags.includes("security") },
  { id: "arm", match: ({ architectures }) => architectures.includes("aarch64") },
  {
    id: "alt",
    match: ({ family }) => family.category === "BSD" || family.category === "Other systems",
  },
];

export const RAM_CHOICES_MB: readonly number[] = [512, 1024, 2048, 4096, 8192, 16384];
export const DRIVE_CHOICES_GB: readonly number[] = [2, 4, 8, 16, 32];
