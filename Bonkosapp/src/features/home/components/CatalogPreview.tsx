import { PATHS } from "../../../app/routes";
import { logoOf } from "../../../data/catalogService";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { Link } from "../../../router/Link";
import { Logo } from "../../../shared/components/Logo";
import { useCatalog } from "../../../shared/hooks/useCatalog";
import { recentReleases, summarize } from "../../../shared/lib/catalog";
import { dateLabel } from "../../../shared/lib/format";
import styles from "./CatalogPreview.module.css";

const LOGOS = 9;
const RECENT = 6;

export function CatalogPreview() {
  const text = useText();
  const language = useLanguage();
  const { catalog, failed } = useCatalog();
  const systems = catalog ? summarize(catalog) : [];
  return (
    <section className={styles.section} aria-labelledby="catalog-title">
      <div className={styles.intro}>
        <h2 id="catalog-title">{text.home.catalogTitle}</h2>
        <p className="muted">{text.home.catalogText}</p>
        <p className={styles.logos} aria-hidden="true">
          {systems.slice(0, LOGOS).map(({ family }) => (
            <Logo key={family.id} src={logoOf(family)} size={28} />
          ))}
        </p>
        <Link className={styles.all} to={PATHS.marketplace}>
          {catalog ? text.home.seeAll(catalog.families.length) : text.home.explore}
        </Link>
      </div>
      <div>
        <h3 className={styles.label}>{text.home.recent}</h3>
        {failed ? (
          <p role="alert" className="notice">
            {text.common.catalogFailed}
          </p>
        ) : null}
        <ul className={styles.list}>
          {recentReleases(systems, RECENT).map(({ family, latest }) => (
            <li key={family.id}>
              <Link className={styles.row} to={PATHS.marketplace} params={{ system: family.id }}>
                <Logo src={logoOf(family)} size={40} />
                <span className={styles.text}>
                  <strong>{family.name}</strong>
                  <span className="muted">{text.market.systems[family.id]}</span>
                </span>
                <span className={styles.release}>
                  <code>{latest.version}</code>
                  <span className="muted">{dateLabel(latest.released, language, "medium")}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
