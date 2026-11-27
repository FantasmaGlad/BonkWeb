import {
  CATALOG_URL,
  COMMANDS_PAGE,
  MIRROR,
  PACKAGES,
  RELEASES,
  SECURITY_MAIL,
  SECURITY_POLICY,
  SOURCE,
} from "../data/links";
import { RELEASE } from "../data/releases";
import { useText } from "../i18n/I18nProvider";
import { Link } from "../router/Link";
import styles from "./Footer.module.css";
import { COMMANDS_ANCHOR, PATHS } from "./routes";

type FooterText = ReturnType<typeof useText>["footer"];
type FooterLink = { href: string; label: keyof FooterText; internal?: boolean };

const COLUMNS: readonly { title: keyof FooterText; links: readonly FooterLink[] }[] = [
  {
    title: "product",
    links: [
      { href: PATHS.marketplace, label: "systems", internal: true },
      { href: PATHS.download, label: "download", internal: true },
      { href: `${PATHS.download}#${COMMANDS_ANCHOR}`, label: "commands", internal: true },
    ],
  },
  {
    title: "resources",
    links: [
      { href: COMMANDS_PAGE, label: "allCommands" },
      { href: RELEASES, label: "releases" },
      { href: CATALOG_URL, label: "catalog" },
      { href: PACKAGES, label: "packages" },
    ],
  },
  {
    title: "project",
    links: [
      { href: SOURCE, label: "source" },
      { href: MIRROR, label: "mirror" },
      { href: SECURITY_POLICY, label: "policy" },
      { href: `mailto:${SECURITY_MAIL}`, label: "security" },
    ],
  },
];

export function Footer() {
  const text = useText().footer;
  return (
    <footer className={styles.footer}>
      <nav className={styles.columns} aria-label={text.label}>
        <div className={styles.about}>
          <p className={styles.brand}>
            <img src="/logo.png" alt="" width="32" height="32" />
            <strong>Bonk</strong>
          </p>
          <p className="muted">{text.tagline}</p>
          <p className="muted">{`Bonk ${RELEASE.version}`}</p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2>{text[column.title]}</h2>
            <ul>
              {column.links.map(({ href, label, internal }) => (
                <li key={href}>
                  {internal ? (
                    <Link to={href}>{text[label]}</Link>
                  ) : (
                    <a href={href}>{text[label]}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </footer>
  );
}
