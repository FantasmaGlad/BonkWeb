import type { PackageManager } from "../types/release";
import { PACKAGES as URL } from "./links";

const KEY = "8DE680FFBE475B663E8B019A757866E34D67014B";

export const PACKAGE_MANAGERS: readonly PackageManager[] = [
  {
    id: "apt",
    name: "APT",
    scope: "Debian, Ubuntu, Mint",
    os: "linux",
    distros: ["debian"],
    status: "real",
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
    name: "DNF",
    scope: "Fedora, RHEL, Rocky, Alma",
    os: "linux",
    distros: ["fedora"],
    status: "real",
    install: `sudo curl -fsSL ${URL}/rpm/bonk.repo -o /etc/yum.repos.d/bonk.repo
sudo dnf install bonk`,
    cli: "sudo dnf install bonk-cli",
    update: "sudo dnf upgrade bonk",
    remove: "sudo dnf remove bonk",
  },
  {
    id: "zypper",
    name: "Zypper",
    scope: "openSUSE, SLES",
    os: "linux",
    distros: ["suse"],
    status: "real",
    install: `sudo rpm --import ${URL}/bonk.asc
sudo zypper addrepo ${URL}/rpm/bonk.repo
sudo zypper refresh
sudo zypper install bonk`,
    cli: "sudo zypper install bonk-cli",
    update: "sudo zypper update bonk",
    remove: "sudo zypper remove bonk",
  },
  {
    id: "pacman",
    name: "pacman",
    scope: "Arch, Manjaro",
    os: "linux",
    distros: ["arch", "manjaro"],
    status: "real",
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
    name: "Homebrew",
    scope: "macOS, Linux",
    os: "macos",
    status: "ci",
    install: "brew install fantasmaglad/bonk/bonk",
    cli: "brew install fantasmaglad/bonk/bonk-cli",
    update: "brew upgrade bonk",
    remove: "brew uninstall bonk",
  },
  {
    id: "scoop",
    name: "Scoop",
    scope: "Windows",
    os: "windows",
    status: "ci",
    install: `scoop install ${URL}/scoop/bonk.json`,
    cli: `scoop install ${URL}/scoop/bonk-cli.json`,
    update: `scoop uninstall bonk; scoop install ${URL}/scoop/bonk.json`,
    remove: "scoop uninstall bonk",
  },
];

export const SCRIPTS = {
  unix: { install: `curl -fsSL ${URL}/install.sh | sh`, remove: "rm ~/.local/bin/bonk" },
  windows: {
    install: `irm ${URL}/install.ps1 | iex`,
    remove: 'Remove-Item "$env:LOCALAPPDATA\\Programs\\Bonk" -Recurse',
  },
} as const;
