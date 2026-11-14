import { PATHS } from "../../../app/routes";
import { termLabel } from "../../../data/categories";
import { useLanguage, useText } from "../../../i18n/I18nProvider";
import { Link } from "../../../router/Link";
import type { Term } from "../../../types/catalog";
import type { CatalogFilter, SystemSummary } from "../../../types/system";
import { paramsOfFilter } from "../lib/filter";
import styles from "./CategoryRail.module.css";

export function CategoryRail({
  systems,
  uses,
  filter,
  onChange,
}: {
  systems: readonly SystemSummary[];
  uses: readonly Term[];
  filter: CatalogFilter;
  onChange: (filter: CatalogFilter) => void;
}) {
  const text = useText();
  const language = useLanguage();
  const entries = [
    { id: "all", label: text.market.allCategories, count: systems.length },
    ...uses.map(({ id }) => ({
      id,
      label: termLabel(uses, id, language),
      count: systems.filter(({ family }) => family.uses?.includes(id)).length,
    })),
  ];
  return (
    <nav className={styles.rail} aria-label={text.market.categoriesLabel}>
      <ul>
        {entries
          .filter(({ id, count }) => count > 0 || id === filter.category)
          .map(({ id, label, count }) => (
            <li key={id}>
              <Link
                to={PATHS.marketplace}
                params={paramsOfFilter({ ...filter, category: id })}
                aria-current={filter.category === id ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onChange({ ...filter, category: id });
                }}
              >
                {label}
                <span className={styles.count}>{count}</span>
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
