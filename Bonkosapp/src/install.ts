import type { Language } from "./text";

const URL = "https://packages.bonk-os.app";
const KEY = "8DE680FFBE475B663E8B019A757866E34D67014B";

export type Manager = {
  id: string;
  name: string;
  logos: readonly string[];
  note?: Record<Language, string>;
  install: string;
  update: string;
  remove: string;
};

const PREVIEW = {
  en: "Preview: cannot write to disks yet.",
  fr: "Aperçu : n'écrit pas encore sur les disques.",
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
    update: "sudo apt update && sudo apt upgrade bonk",
    remove: "sudo apt remove bonk",
  },
  {
    id: "dnf",
    name: "DNF: Fedora, RHEL, Rocky, Alma",
    logos: ["fedora", "rhel"],
    install: `sudo curl -fsSL ${URL}/rpm/bonk.repo -o /etc/yum.repos.d/bonk.repo
sudo dnf install bonk`,
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
    update: "sudo pacman -Syu",
    remove: "sudo pacman -R bonk",
  },
  {
    id: "brew",
    name: "Homebrew: macOS, Linux",
    logos: ["apple"],
    note: PREVIEW,
    install: "brew install fantasmaglad/bonk/bonk",
    update: "brew upgrade bonk",
    remove: "brew uninstall bonk",
  },
  {
    id: "scoop",
    name: "Scoop: Windows",
    logos: ["windows"],
    note: PREVIEW,
    install: `scoop install ${URL}/scoop/bonk.json`,
    update: `scoop uninstall bonk; scoop install ${URL}/scoop/bonk.json`,
    remove: "scoop uninstall bonk",
  },
];

export const HEADLESS_INSTALL = `curl -fsSL ${URL}/install.sh | sh`;
export const HEADLESS_REMOVE = "rm ~/.local/bin/bonk";
