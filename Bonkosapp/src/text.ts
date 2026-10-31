export type Language = "en" | "fr";

export const RELEASES = "https://github.com/FantasmaGlad/Bonk/releases/latest";
export const SOURCE = "https://github.com/FantasmaGlad/Bonk";
export const SECURITY_MAIL = "security@bonk-os.app";

export const TEXT = {
  en: {
    tagline: "Write bootable images to USB drives.",
    points: [
      "Linux, or a Windows 10 and 11 install drive, from a URL or a file.",
      "Every write is checked and read back. A system disk is never offered.",
      "Open source, one binary, no telemetry.",
    ],
    downloads: "Download",
    version: "Version",
    source: "Source code",
    allReleases: "All files and checksums",
    preview: "Preview: cannot write to disks yet.",
    security: "Security reports",
    switchLabel: "Français",
  },
  fr: {
    tagline: "Écrit des images amorçables sur clé USB.",
    points: [
      "Linux, ou une clé d'installation Windows 10 et 11, depuis une adresse ou un fichier.",
      "Chaque écriture est contrôlée et relue. Un disque système n'est jamais proposé.",
      "Open source, un seul binaire, aucune télémétrie.",
    ],
    downloads: "Télécharger",
    version: "Version",
    source: "Code source",
    allReleases: "Tous les fichiers et empreintes",
    preview: "Aperçu : n'écrit pas encore sur les disques.",
    security: "Signaler une faille",
    switchLabel: "English",
  },
} as const satisfies Record<Language, unknown>;
