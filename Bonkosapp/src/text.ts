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
    download: "Download",
    source: "Source code",
    preview: "Windows and macOS builds are previews: they cannot write to disks yet.",
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
    download: "Télécharger",
    source: "Code source",
    preview:
      "Les versions Windows et macOS sont des aperçus : elles n'écrivent pas encore de disque.",
    security: "Signaler une faille",
    switchLabel: "English",
  },
} as const satisfies Record<Language, unknown>;
