import type { Language } from "../i18n/language";
import type { Catalog, Taxonomy, Term } from "../types/catalog";

const terms = (list: readonly [string, string, string][]): Term[] =>
  list.map(([id, en, fr]) => ({ id, en, fr }));

/** Used when the catalog carries no taxonomy: one published before it. */
export const FALLBACK_TAXONOMY: Required<Taxonomy> = {
  uses: terms([
    ["office", "Office and everyday", "Bureautique"],
    ["beginner", "Beginners", "Débutant"],
    ["gaming", "Gaming", "Jeux"],
    ["creative", "Sound, image, video", "Création"],
    ["light", "Older PCs", "Vieux PC"],
    ["education", "Education", "Éducation"],
    ["security", "Cybersecurity", "Cybersécurité"],
    ["privacy", "Privacy", "Vie privée"],
    ["immutable", "Immutable systems", "Systèmes immuables"],
    ["expert", "Experts", "Experts"],
    ["server", "Servers", "Serveurs"],
    ["homelab", "NAS and virtualisation", "NAS et virtualisation"],
    ["network", "Network and firewall", "Réseau et pare-feu"],
    ["rescue", "Repair and backup", "Dépannage et sauvegarde"],
    ["media", "Media centre", "Médiacentre"],
    ["boards", "Raspberry Pi and ARM boards", "Raspberry Pi et cartes ARM"],
    ["exotic", "Exotic", "Exotique"],
    ["windows", "Windows", "Windows"],
  ]),
  bases: terms([
    ["debian", "Debian", "Debian"],
    ["ubuntu", "Ubuntu", "Ubuntu"],
    ["arch", "Arch Linux", "Arch Linux"],
    ["fedora", "Fedora and Red Hat", "Fedora et Red Hat"],
    ["opensuse", "openSUSE", "openSUSE"],
    ["independent", "Independent", "Indépendant"],
    ["bsd", "BSD and Unix", "BSD et Unix"],
    ["windows", "Windows", "Windows"],
  ]),
};

export const taxonomyOf = (catalog: Catalog | null): Required<Taxonomy> => ({
  uses: catalog?.taxonomy?.uses?.length ? catalog.taxonomy.uses : FALLBACK_TAXONOMY.uses,
  bases: catalog?.taxonomy?.bases?.length ? catalog.taxonomy.bases : FALLBACK_TAXONOMY.bases,
});

/** A name the list lacks is shown as it is. */
export const termLabel = (list: readonly Term[], id: string, language: Language): string =>
  list.find((term) => term.id === id)?.[language] ?? id;

export const RAM_CHOICES_MB: readonly number[] = [512, 1024, 2048, 4096, 8192, 16384];
export const MEDIA_CHOICES = ["usb", "sd", "optical"] as const;
export const DRIVE_CHOICES_GB: readonly number[] = [2, 4, 8, 16, 32];
