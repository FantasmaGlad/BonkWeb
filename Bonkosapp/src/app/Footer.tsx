import {
  CATALOG_URL,
  PACKAGES,
  REFERENCE,
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
        <div>
          <h2>{text.product}</h2>
          <ul>
            <li>
              <Link to={PATHS.marketplace}>{text.systems}</Link>
            </li>
            <li>
              <Link to={PATHS.download}>{text.download}</Link>
            </li>
            <li>
              <Link to={`${PATHS.download}#${COMMANDS_ANCHOR}`}>{text.commands}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>{text.resources}</h2>
          <ul>
            <li>
              <a href={REFERENCE}>{text.reference}</a>
            </li>
            <li>
              <a href={RELEASES}>{text.releases}</a>
            </li>
            <li>
              <a href={CATALOG_URL}>{text.catalog}</a>
            </li>
            <li>
              <a href={PACKAGES}>{text.packages}</a>
            </li>
          </ul>
        </div>
        <div>
          <h2>{text.project}</h2>
          <ul>
            <li>
              <a href={SOURCE}>{text.source}</a>
            </li>
            <li>
              <a href={SECURITY_POLICY}>{text.policy}</a>
            </li>
            <li>
              <a href={`mailto:${SECURITY_MAIL}`}>{text.security}</a>
            </li>
          </ul>
        </div>
      </nav>
    </footer>
  );
}
