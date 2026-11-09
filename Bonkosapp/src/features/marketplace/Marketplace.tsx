import { useText } from "../../i18n/I18nProvider";
import { useCatalog } from "../../shared/hooks/useCatalog";
import { useOsDetection } from "../../shared/hooks/useOsDetection";
import { architecturesOf } from "../../shared/lib/catalog";
import { CategoryRail } from "./components/CategoryRail";
import { SpecFilters } from "./components/SpecFilters";
import { SystemCard } from "./components/SystemCard";
import { SystemDrawer } from "./components/SystemDrawer";
import { useCatalogFilter } from "./hooks/useCatalogFilter";
import { isFiltered, paramsOfFilter } from "./lib/filter";
import styles from "./Marketplace.module.css";

export function Marketplace() {
  const text = useText();
  const market = text.market;
  const { catalog, failed } = useCatalog();
  const machine = useOsDetection();
  const store = useCatalogFilter(catalog);
  const { filter, systems } = store;
  return (
    <>
      <header className={styles.head}>
        <h1>{market.title}</h1>
        <p className="lead">{market.intro}</p>
      </header>
      {failed ? (
        <p role="alert" className="notice">
          {text.common.catalogFailed}
        </p>
      ) : null}
      {catalog ? (
        <>
          <div className={styles.tools}>
            <label className={styles.search}>
              <span className="visually-hidden">{market.search}</span>
              <input
                type="search"
                value={filter.query}
                placeholder={market.searchPlaceholder}
                autoComplete="off"
                onChange={(event) => store.setFilter({ ...filter, query: event.target.value })}
              />
            </label>
            <SpecFilters
              architectures={architecturesOf(catalog)}
              filter={filter}
              onChange={store.setFilter}
            />
          </div>
          <CategoryRail systems={store.all} filter={filter} onChange={store.setFilter} />
          <p className={styles.count} aria-live="polite">
            {text.common.stats(
              systems.length,
              systems.reduce((total, system) => total + system.images.length, 0),
            )}
          </p>
          {systems.length ? (
            <ul className={styles.grid}>
              {systems.map((system) => (
                <SystemCard
                  key={system.family.id}
                  system={system}
                  params={paramsOfFilter(filter)}
                  onOpen={() => store.open(system.family.id)}
                />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>
              {market.noMatch}{" "}
              {isFiltered(filter) ? (
                <button type="button" onClick={store.clear}>
                  {market.clear}
                </button>
              ) : null}
            </p>
          )}
          {store.opened ? (
            <SystemDrawer
              key={store.openId}
              system={store.opened}
              imageId={store.imageId}
              preferredArch={filter.arch || machine.arch}
              onSelect={store.selectImage}
              onClose={store.close}
            />
          ) : store.openId ? (
            <p role="alert" className="notice">
              {market.unknownSystem}
            </p>
          ) : null}
        </>
      ) : failed ? null : (
        <div className={styles.loading} aria-hidden="true" />
      )}
    </>
  );
}
