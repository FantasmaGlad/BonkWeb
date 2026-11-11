import { PATHS } from "../../../app/routes";
import { CATEGORIES } from "../../../data/categories";
import { useText } from "../../../i18n/I18nProvider";
import { Link } from "../../../router/Link";
import type { CatalogFilter, SystemSummary } from "../../../types/system";
import { paramsOfFilter } from "../lib/filter";
import styles from "./CategoryRail.module.css";

export function CategoryRail({
  systems,
  filter,
  onChange,
}: {
  systems: readonly SystemSummary[];
  filter: CatalogFilter;
  onChange: (filter: CatalogFilter) => void;
}) {
  const text = useText();
  return (
    <nav className={styles.rail} aria-label={text.market.categoriesLabel}>
      <ul>
        {CATEGORIES.map((category) => ({
          category,
          count: systems.filter(category.match).length,
        }))
          .filter(({ category, count }) => count > 0 || category.id === filter.category)
          .map(({ category, count }) => (
            <li key={category.id}>
              <Link
                to={PATHS.marketplace}
                params={paramsOfFilter({ ...filter, category: category.id })}
                aria-current={filter.category === category.id ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onChange({ ...filter, category: category.id });
                }}
              >
                {text.market.categories[category.id]}
                <span className={styles.count}>{count}</span>
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
