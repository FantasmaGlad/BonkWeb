export const systemsFr: Record<string, string> = {
  ubuntu: "Distribution généraliste de Canonical. Bureau GNOME ; variantes KDE, Xfce et LXQt.",
  kubuntu: "Saveur officielle d'Ubuntu avec le bureau KDE Plasma.",
  xubuntu: "Saveur officielle d'Ubuntu avec le bureau Xfce, légère.",
  lubuntu: "Saveur officielle d'Ubuntu avec le bureau LXQt, pour les machines modestes.",
  ubuntustudio: "Saveur officielle d'Ubuntu pour la création : son, vidéo, graphisme.",
  "ubuntu-mate": "Saveur officielle d'Ubuntu avec le bureau MATE, classique.",
  "ubuntu-budgie": "Saveur officielle d'Ubuntu avec le bureau Budgie.",
  ubuntucinnamon: "Saveur officielle d'Ubuntu avec le bureau Cinnamon.",
  "ubuntu-unity": "Saveur officielle d'Ubuntu avec le bureau Unity.",
  ubuntukylin: "Saveur officielle d'Ubuntu pour les utilisateurs chinois, avec le bureau UKUI.",
  edubuntu: "Saveur officielle d'Ubuntu pour l'école, avec des logiciels éducatifs.",
  bazzite: "Système fondé sur Fedora et fait pour jouer, Steam prêt ; bureau ou mode jeu de Steam.",
  cachyos:
    "Distribution fondée sur Arch et réglée pour la vitesse, avec une édition pour consoles portables.",
  nobara: "Distribution fondée sur Fedora et réglée pour le jeu et la diffusion en direct.",
  lakka: "Console de jeux rétro construite sur RetroArch, pour un PC branché à la télévision.",
  libreelec: "Système minimal qui démarre directement sur le centre multimédia Kodi.",
  debian:
    "Distribution communautaire, base de nombreuses autres. Installateur réseau et images live.",
  linuxmint: "Distribution de bureau fondée sur Ubuntu. Cinnamon, MATE ou Xfce.",
  popos: "Distribution de System76 fondée sur Ubuntu, avec une image pour les cartes NVIDIA.",
  zorin: "Distribution de bureau fondée sur Ubuntu, disposée pour qui vient de Windows.",
  tails:
    "Système live qui fait passer les connexions par Tor et ne laisse aucune trace sur l'ordinateur.",
  qubes:
    "Système axé sur la sécurité qui isole chaque tâche dans sa propre machine virtuelle, sur Xen.",
  parrot: "Distribution fondée sur Debian, pour les tests de sécurité et la vie privée.",
  raspios: "Système fondé sur Debian pour les cartes Raspberry Pi.",
  kali: "Distribution fondée sur Debian, pour les tests d'intrusion.",
  fedora: "Distribution communautaire soutenue par Red Hat. Workstation (GNOME), KDE et Server.",
  "fedora-coreos":
    "Système à mise à jour automatique pour faire tourner des conteneurs, issu de Fedora.",
  bluefin:
    "Bureau construit sur Fedora Atomic, avec GNOME et des mises à jour appliquées d'un bloc.",
  almalinux: "Distribution d'entreprise communautaire, compatible avec RHEL.",
  rockylinux: "Distribution d'entreprise communautaire, compatible avec RHEL.",
  arch: "Distribution en publication continue, installée en ligne de commande.",
  artix: "Système fondé sur Arch sans systemd, avec OpenRC, runit, s6 ou dinit.",
  caine:
    "Système live fondé sur Ubuntu pour l'analyse forensique, disques gardés en lecture seule.",
  turnkey:
    "Base de serveur fondée sur Debian, d'où TurnKey tire ses applications prêtes à l'emploi.",
  freedombox: "Serveur personnel fondé sur Debian, pour héberger ses propres services chez soi.",
  vyos: "Routeur et pare-feu fondé sur Debian, configuré en ligne de commande.",
  batocera: "Système de jeu rétro qui démarre directement sur un menu d'émulateurs.",
  chimera:
    "Système indépendant avec musl, des outils de base issus de FreeBSD et le gestionnaire de services dinit.",
  porteus: "Petit système live modulaire fondé sur Slackware.",
  minios: "Système live portable fondé sur Debian, qui peut garder ses modifications sur la clé.",
  slax: "Petit système portable fondé sur Debian, avec son propre bureau, fait pour démarrer sur une clé USB.",
  altlinux: "Distribution indépendante à paquets RPM maintenue en Russie, ici avec GNOME.",
  manjaro: "Distribution fondée sur Arch, avec un installateur graphique. KDE, GNOME ou Xfce.",
  endeavouros: "Distribution fondée sur Arch, avec un installateur graphique.",
  opensuse: "Tumbleweed, en publication continue, et Leap, aux versions fixes.",
  alpine: "Petite distribution construite sur musl et BusyBox.",
  nixos: "Distribution configurée de façon déclarative avec le gestionnaire de paquets Nix.",
  void: "Distribution indépendante en publication continue, avec XBPS et runit.",
  gentoo: "Distribution compilée depuis les sources. Image d'installation minimale.",
  proxmox: "Plateforme de virtualisation fondée sur Debian, avec KVM et LXC.",
  truenas: "Système de stockage en réseau construit sur ZFS.",
  "proxmox-backup":
    "Serveur de sauvegarde des machines virtuelles et conteneurs Proxmox, avec déduplication.",
  xcpng: "Plateforme de virtualisation fondée sur l'hyperviseur Xen.",
  openwrt: "Système de routeur et d'équipement réseau, ici pour machines x86_64.",
  ipfire: "Système de pare-feu et de routeur, pour machines x86_64 et ARM64.",
  talos: "Système minimal dédié à Kubernetes, administré par une API, sans shell.",
  yunohost:
    "Système fondé sur Debian pour héberger des services web chez soi, administré depuis une interface web.",
  freebsd: "Système BSD pour serveurs, postes de travail et embarqué.",
  openbsd: "Système BSD centré sur la sécurité et la rigueur du code.",
  fuguita: "Système live fondé sur OpenBSD, qui démarre depuis une clé USB.",
  "glf-os":
    "Distribution de jeu de la communauté française Gaming Linux FR, fondée sur NixOS, mise à jour automatiquement.",
  kicksecure:
    "Système fondé sur Debian et renforcé pour la sécurité, par l'équipe de Whonix, avec le bureau LXQt.",
  armbian: "Système fondé sur Debian pour cartes ARM, ici en image UEFI générique sans bureau.",
  dietpi:
    "Système léger fondé sur Debian pour Raspberry Pi et PC, avec un outil pour installer des logiciels prêts à l'emploi.",
  homeassistant:
    "Système dédié à la domotique Home Assistant, administré depuis une interface web.",
  openindiana: "Système Unix issu d'OpenSolaris, fondé sur illumos, avec ZFS et un bureau MATE.",
  windows: "Images d'évaluation et de vente de Microsoft. Bonk dispose la clé d'installation.",
  templeos: "Système d'exploitation amateur de Terry A. Davis.",
  haiku: "Système open source inspiré de BeOS.",
  omnios: "Système serveur illumos, descendant d'OpenSolaris, avec ZFS et les zones.",
  mxlinux: "Distribution de bureau fondée sur Debian stable. Xfce, KDE Plasma ou Fluxbox.",
  linuxlite: "Distribution fondée sur Ubuntu LTS avec le bureau Xfce, pour qui débute.",
  kdeneon: "Image de KDE fondée sur Ubuntu LTS, avec les dernières versions de Plasma.",
  deepin: "Distribution venue de Chine, avec son propre bureau, DDE.",
  solus:
    "Distribution indépendante en publication continue encadrée. Budgie, GNOME, KDE Plasma ou Xfce.",
  mageia:
    "Distribution communautaire issue de Mandriva. Images live GNOME, KDE Plasma ou Xfce, et installateurs.",
  openmandriva:
    "Distribution communautaire issue de Mandriva : Rock aux versions fixes, ROME en publication continue.",
  peppermint: "Distribution légère avec le bureau Xfce, fondée sur Debian ou sur Devuan.",
  bodhi: "Distribution légère fondée sur Ubuntu, avec le bureau Moksha, issu d'Enlightenment.",
  q4os: "Distribution fondée sur Debian, avec KDE Plasma ou Trinity pour les machines anciennes.",
  sparky: "Distribution fondée sur Debian. Xfce, KDE Plasma, LXQt, MATE ou sans bureau.",
  antix: "Distribution légère fondée sur Debian, sans systemd, pour les très vieux PC.",
  trisquel: "Distribution fondée sur Ubuntu, composée uniquement de logiciels libres.",
  devuan: "Debian sans systemd. Images live, installateurs et image minimale.",
  tuxedo: "Distribution de TUXEDO Computers fondée sur Ubuntu, avec KDE Plasma.",
  vanillaos: "Distribution immuable fondée sur Debian, avec le bureau GNOME.",
  garuda: "Distribution fondée sur Arch, avec de nombreux bureaux et une édition pour le jeu.",
  ultramarine: "Distribution fondée sur Fedora. Budgie, GNOME, KDE Plasma ou Xfce.",
  rhino:
    "Distribution en publication continue fondée sur Ubuntu, avec le bureau Unicorn construit sur Xfce.",
  nitrux: "Distribution fondée sur Debian, sans systemd, avec une image pour les cartes NVIDIA.",
  slackware: "La plus ancienne distribution encore maintenue, installée en mode texte.",
  puppy: "Distribution très légère qui fonctionne entièrement en mémoire vive.",
  centos: "Distribution de Red Hat qui précède RHEL : ce qui deviendra la prochaine version.",
  oraclelinux:
    "Distribution d'entreprise d'Oracle, compatible avec RHEL, avec le noyau UEK au choix.",
  openeuler: "Distribution d'entreprise de la fondation OpenAtom, lancée par Huawei.",
  netbsd: "Système BSD conçu pour la portabilité, sur de nombreuses architectures.",
  ghostbsd: "Système de bureau fondé sur FreeBSD, avec MATE ou Xfce.",
  dragonfly: "Système BSD issu de FreeBSD, avec le système de fichiers HAMMER2.",
  midnightbsd: "Système BSD dérivé de FreeBSD, tourné vers le poste de travail.",
  systemrescue: "Système live de dépannage : partitions, sauvegarde, récupération de données.",
  clonezilla: "Système live pour cloner et sauvegarder des disques et des partitions.",
  gparted: "Système live pour modifier les partitions d'un disque avec GParted.",
  rescuezilla:
    "Système live graphique pour sauvegarder, restaurer et cloner des disques, compatible avec Clonezilla.",
  grml: "Système live fondé sur Debian, pour le dépannage en ligne de commande.",
  tribblix: "Système fondé sur illumos, descendant d'OpenSolaris.",
  tiny11: "Windows 11 allégé par NTDEV pour les PC modestes.",
  genode: "Sculpt OS, système d'usage général bâti sur le cadre à composants Genode.",
  atlasos:
    "Modification de Windows pour la performance et la vie privée, appliquée à une installation officielle.",
  revios:
    "Modification de Windows pour la performance et la vie privée, appliquée à une installation officielle.",
  "sergei-strelec":
    "Trousse de dépannage sur Windows PE : sauvegarde, partitions, récupération et diagnostic.",
  nhvboot:
    "Trousse de dépannage sur Windows PE pour la réparation, la sauvegarde et la récupération de données.",
  "acronis-true-image":
    "Logiciel de sauvegarde et d'image disque ; son support de secours restaure une sauvegarde.",
  "macrium-reflect":
    "Logiciel d'image disque et de sauvegarde ; son support de secours restaure hors de Windows.",
  "easeus-todo-backup":
    "Logiciel de sauvegarde et de clonage de disque, avec un support de secours amorçable.",
  "aomei-backupper":
    "Logiciel de sauvegarde, de restauration et de clonage, avec un support de secours amorçable.",
  diskgenius:
    "Gestionnaire de partitions et outil de récupération de données, avec un support de secours amorçable.",
  "r-drive-image": "Logiciel d'image disque et de clonage, avec un support de secours amorçable.",
  "active-boot-disk":
    "Trousse amorçable de récupération de données, de gestion des disques et de réinitialisation de mot de passe.",
  "oo-diskimage": "Logiciel de sauvegarde et d'image disque, avec un support de secours amorçable.",
  "hasleo-backup-suite":
    "Logiciel gratuit de sauvegarde, de restauration et de clonage, avec un support de secours amorçable.",
  "minitool-partition-wizard":
    "Gestionnaire de partitions : redimensionner, déplacer, convertir et copier partitions et disques.",
  memtest86: "Testeur de mémoire de PassMark, démarré seul pour chercher les erreurs de la RAM.",
  "kaspersky-rescue-disk":
    "Antivirus amorçable gratuit qui analyse un ordinateur sans démarrer son système.",
  rhel: "Red Hat Enterprise Linux, distribution commerciale pour serveurs et postes, par abonnement.",
  sles: "SUSE Linux Enterprise Server, distribution commerciale pour serveurs, par abonnement.",
  fydeos: "Système fondé sur Chromium OS pour les PC, avec les applications Android.",
  unraid:
    "Système de NAS et de virtualisation qui tourne depuis une clé USB, payant après un essai.",
  "mikrotik-routeros": "Système de routeur de MikroTik, pour machines x86 et ARM.",
};
