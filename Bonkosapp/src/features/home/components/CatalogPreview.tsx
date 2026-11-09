import { PATHS } from "../../../app/routes";
import { logoOf } from "../../../data/catalogService";
import { CATEGORIES } from "../../../data/categories";
import { useText } from "../../../i18n/I18nProvider";
import { Link } from "../../../router/Link";
import { Logo } from "../../../shared/components/Logo";
import { useCatalog } from "../../../shared/hooks/useCatalog";
import { summarize } from "../../../shared/lib/catalog";
import styles from "./CatalogPreview.module.css";

const SHOWN = 8;
const FIRST = CATEGORIES.find((category) => category.id === "daily");

export function CatalogPreview() {
  const text = useText();
  const { catalog, failed } = useCatalog();
  const systems = catalog ? summarize(catalog) : [];
  // Everyday systems first: they are what most visitors look for.
  const shown = [
    ...systems.filter((system) => FIRST?.match(system)),
    ...systems.filter((system) => !FIRST?.match(system)),
  ].slice(0, SHOWN);
  return (
    <section className={styles.section} aria-labelledby="catalog-title">
      <div className={styles.head}>
        <div>
          <h2 id="catalog-title">{text.home.catalogTitle}</h2>
          <p className="muted">
            {catalog
              ? `${text.common.stats(catalog.families.length, catalog.images.length)}. ${text.home.catalogText}`
              : text.home.catalogText}
          </p>
        </div>
        <Link to={PATHS.marketplace}>{text.home.explore}</Link>
      </div>
      {failed ? (
        <p role="alert" className="notice">
          {text.common.catalogFailed}
        </p>
      ) : null}
      <ul className={styles.list}>
        {shown.map(({ family, latest }) => (
          <li key={family.id}>
            <Link className={styles.system} to={PATHS.marketplace} params={{ system: family.id }}>
              <Logo src={logoOf(family)} size={40} />
              <span>
                <strong>{family.name}</strong>
                <small className="muted">{latest.version}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
