import { PATHS } from "../../app/routes";
import { taxonomyOf } from "../../data/categories";
import { useText } from "../../i18n/I18nProvider";
import { Breadcrumb } from "../../shared/components/Breadcrumb";
import { useCatalog } from "../../shared/hooks/useCatalog";
import { useOsDetection } from "../../shared/hooks/useOsDetection";
import { architecturesOf, basesOf, desktopsOf } from "../../shared/lib/catalog";
import type { Catalog } from "../../types/catalog";
import { CategoryRail } from "./components/CategoryRail";
import { SpecFilters } from "./components/SpecFilters";
import { SystemCard } from "./components/SystemCard";
import { SystemPage } from "./components/SystemPage";
import { useCatalogFilter } from "./hooks/useCatalogFilter";
import { isFiltered, paramsOfFilter, splitByRam } from "./lib/filter";
import styles from "./Marketplace.module.css";

export function Marketplace() {
  const text = useText();
  const market = text.market;
  const { catalog, failed } = useCatalog();
  const machine = useOsDetection();
  const store = useCatalogFilter(catalog);
  const { filter } = store;
  if (catalog && store.opened) {
    return (
      <SystemPage
        key={store.openId}
        system={store.opened}
        imageId={store.imageId}
        preferredArch={filter.arch || machine.arch}
        onSelect={store.selectImage}
        onBack={store.close}
      />
    );
  }
  return (
    <>
      <header className={styles.head}>
        <Breadcrumb trail={[{ label: "Bonk", to: PATHS.home }, { label: text.nav.systems }]} />
        <h1>{market.title}</h1>
        <p className="lead">{market.intro}</p>
      </header>
      {failed ? (
        <p role="alert" className="notice">
          {text.common.catalogFailed}
        </p>
      ) : null}
      {catalog ? (
        <Results catalog={catalog} store={store} />
      ) : failed ? null : (
        <div className={styles.loading} aria-hidden="true" />
      )}
    </>
  );
}

type Store = ReturnType<typeof useCatalogFilter>;
type System = Store["systems"][number];

function Results({ catalog, store }: { catalog: Catalog; store: Store }) {
  const text = useText();
  const market = text.market;
  const { filter, systems } = store;
  const { fitting, unstated } = splitByRam(systems, filter);
  const taxonomy = taxonomyOf(catalog);
  const card = (system: System) => (
    <SystemCard
      key={system.family.id}
      system={system}
      params={paramsOfFilter(filter)}
      onOpen={() => store.open(system.family.id)}
    />
  );
  return (
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
          bases={basesOf(catalog, taxonomy.bases)}
          architectures={architecturesOf(catalog)}
          desktops={desktopsOf(catalog)}
          filter={filter}
          onChange={store.setFilter}
        />
      </div>
      <CategoryRail
        systems={store.all}
        uses={taxonomy.uses}
        filter={filter}
        onChange={store.setFilter}
      />
      <p className={styles.count} aria-live="polite">
        {text.common.stats(
          systems.length,
          systems.reduce((total, system) => total + system.images.length, 0),
        )}
      </p>
      {fitting.length ? <ul className={styles.grid}>{fitting.map(card)}</ul> : null}
      {unstated.length ? (
        <section aria-labelledby="unstated-title">
          <h2 id="unstated-title" className={styles.group}>
            {market.ramUnstated}
          </h2>
          <ul className={styles.grid}>{unstated.map(card)}</ul>
        </section>
      ) : null}
      {systems.length ? null : (
        <p className={styles.empty}>
          {market.noMatch}{" "}
          {isFiltered(filter) ? (
            <button type="button" onClick={store.clear}>
              {market.clear}
            </button>
          ) : null}
        </p>
      )}
      {store.openId ? (
        <p role="alert" className="notice">
          {market.unknownSystem}
        </p>
      ) : null}
    </>
  );
}
