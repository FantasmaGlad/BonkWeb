import type { Language } from "./text";

const URL = "https://packages.bonk-os.app";
const KEY = "8DE680FFBE475B663E8B019A757866E34D67014B";

export type Manager = {
  id: string;
  name: string;
  logos: readonly string[];
  note?: Record<Language, string>;
  install: string;
  /** Commande qui remplace l'installation par la version sans fenêtre. */
  cli: string;
  update: string;
  remove: string;
};

const PREVIEW = {
  en: "Writes to disks; proven in continuous integration, not yet on a real drive.",
  fr: "Écrit sur les disques ; éprouvé en intégration continue, pas encore sur une vraie clé.",
};

export const MANAGERS: readonly Manager[] = [
  {
    id: "apt",
    name: "APT: Debian, Ubuntu, Mint",
    logos: ["debian", "ubuntu", "linuxmint"],
    install: `sudo install -d /etc/apt/keyrings
curl -fsSL ${URL}/bonk.gpg | sudo tee /etc/apt/keyrings/bonk.gpg > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/bonk.gpg] ${URL}/debian stable main" | sudo tee /etc/apt/sources.list.d/bonk.list
sudo apt update
sudo apt install bonk`,
    cli: "sudo apt install bonk-cli",
    update: "sudo apt update && sudo apt upgrade bonk",
    remove: "sudo apt remove bonk",
  },
  {
    id: "dnf",
    name: "DNF: Fedora, RHEL, Rocky, Alma",
    logos: ["fedora", "rhel"],
    install: `sudo curl -fsSL ${URL}/rpm/bonk.repo -o /etc/yum.repos.d/bonk.repo
sudo dnf install bonk`,
    cli: "sudo dnf install bonk-cli",
    update: "sudo dnf upgrade bonk",
    remove: "sudo dnf remove bonk",
  },
  {
    id: "zypper",
    name: "Zypper: openSUSE, SLES",
    logos: ["opensuse"],
    install: `sudo rpm --import ${URL}/bonk.asc
sudo zypper addrepo ${URL}/rpm/x86_64 bonk
sudo zypper refresh
sudo zypper install bonk`,
    cli: "sudo zypper install bonk-cli",
    update: "sudo zypper update bonk",
    remove: "sudo zypper remove bonk",
  },
  {
    id: "pacman",
    name: "pacman: Arch, Manjaro",
    logos: ["arch", "manjaro"],
    install: `curl -fsSL ${URL}/bonk.asc | sudo pacman-key --add -
sudo pacman-key --lsign-key ${KEY}
printf '\\n[bonk]\\nSigLevel = Required\\nServer = ${URL}/arch/$arch\\n' | sudo tee -a /etc/pacman.conf
sudo pacman -Sy bonk`,
    cli: "sudo pacman -S bonk-cli",
    update: "sudo pacman -Syu",
    remove: "sudo pacman -R bonk",
  },
  {
    id: "brew",
    name: "Homebrew: macOS, Linux",
    logos: ["apple"],
    note: PREVIEW,
    install: "brew install fantasmaglad/bonk/bonk",
    cli: "brew install fantasmaglad/bonk/bonk-cli",
    update: "brew upgrade bonk",
    remove: "brew uninstall bonk",
  },
  {
    id: "scoop",
    name: "Scoop: Windows",
    logos: ["windows"],
    note: PREVIEW,
    install: `scoop install ${URL}/scoop/bonk.json`,
    cli: `scoop install ${URL}/scoop/bonk-cli.json`,
    update: `scoop uninstall bonk; scoop install ${URL}/scoop/bonk.json`,
    remove: "scoop uninstall bonk",
  },
];

export const HEADLESS_INSTALL = `curl -fsSL ${URL}/install.sh | sh`;
export const HEADLESS_REMOVE = "rm ~/.local/bin/bonk";
export const HEADLESS_INSTALL_WINDOWS = `irm ${URL}/install.ps1 | iex`;
export const HEADLESS_REMOVE_WINDOWS = 'Remove-Item "$env:LOCALAPPDATA\\Programs\\Bonk" -Recurse';
