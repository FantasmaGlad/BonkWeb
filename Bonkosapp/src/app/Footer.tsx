import { REFERENCE, RELEASES, SECURITY_MAIL, SOURCE } from "../data/links";
import { RELEASE } from "../data/releases";
import { useText } from "../i18n/I18nProvider";
import styles from "./Layout.module.css";

export function Footer() {
  const text = useText();
  return (
    <footer className={styles.footer}>
      <div className={styles.bar}>
        <p className={styles.about}>
          <strong>Bonk</strong>{" "}
          <span className="muted">{`${RELEASE.version} · ${text.footer.tagline}`}</span>
        </p>
        <p className={styles.links}>
          <a href={SOURCE}>{text.footer.source}</a>
          <a href={RELEASES}>{text.footer.releases}</a>
          <a href={REFERENCE}>{text.footer.reference}</a>
          <a href={`mailto:${SECURITY_MAIL}`}>{text.footer.security}</a>
        </p>
      </div>
    </footer>
  );
}
