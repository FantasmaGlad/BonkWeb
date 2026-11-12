import type { Category, SystemSummary, UseId } from "../types/system";

/** The catalog's closed list, in the order of the rail. */
export const USES: readonly UseId[] = [
  "desktop",
  "beginner",
  "gaming",
  "light",
  "creative",
  "advanced",
  "server",
  "homelab",
  "privacy",
  "rescue",
  "media",
  "boards",
  "windows",
  "other",
];

export const CATEGORIES: readonly Category[] = [
  { id: "all", match: () => true },
  ...USES.map((id) => ({
    id,
    match: ({ family }: SystemSummary) => family.uses?.includes(id) ?? false,
  })),
];

export const RAM_CHOICES_MB: readonly number[] = [512, 1024, 2048, 4096, 8192, 16384];
export const MEDIA_CHOICES = ["usb", "sd", "optical"] as const;
export const DRIVE_CHOICES_GB: readonly number[] = [2, 4, 8, 16, 32];
