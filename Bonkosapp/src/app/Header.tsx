import { SOURCE } from "../data/links";
import { useText } from "../i18n/I18nProvider";
import { Link } from "../router/Link";
import { useLocation } from "../router/Router";
import { GitHubMark } from "../shared/components/GitHubMark";
import styles from "./Header.module.css";
import bar from "./Layout.module.css";
import { PATHS, type View, viewOf } from "./routes";

export function Header() {
  const text = useText();
  const current = viewOf(useLocation().path);
  const entry = (view: View, label: string, more?: string) => (
    <Link to={PATHS[view]} aria-current={current === view ? "page" : undefined}>
      {label}
      {more ? <span className={styles.more}>{more}</span> : null}
    </Link>
  );
  return (
    <header className={styles.header}>
      <div className={bar.bar}>
        <Link
          className={styles.brand}
          to={PATHS.home}
          aria-current={current === "home" ? "page" : undefined}
        >
          <img src="/logo.png" alt="" width="36" height="36" />
          <span>Bonk</span>
        </Link>
        <nav className={styles.nav} aria-label={text.nav.label}>
          {entry("marketplace", text.nav.systems)}
          {entry("download", text.nav.download, text.nav.downloadMore)}
          <a className={styles.github} href={SOURCE} aria-label={text.nav.github}>
            <GitHubMark />
          </a>
        </nav>
      </div>
    </header>
  );
}
