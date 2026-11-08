import { useEffect, useState } from "react";
import {
  architecturesOf,
  type Catalog,
  type CatalogImage,
  categoryLabel,
  compareVersions,
  countByCategory,
  imagesOf,
  logoOf,
  NO_STORE_FILTER,
  noteLabel,
  type StoreFilter,
  type SystemSummary,
  sizeLabel,
  storeFromAddress,
  summarize,
  versionsOf,
} from "./images";
import { CopyButton, href, Logo, useCatalog, useLanguage, useText } from "./ui";

/** Keeps the address in step with the store, so a view can be shared and reloaded as it is. */
const writeAddress = (filter: StoreFilter, system: string, push: boolean) => {
  const query = new URLSearchParams(location.search);
  const values: Record<string, string> = {
    q: filter.query,
    category: filter.category,
    arch: filter.arch,
    sort: filter.sort === "name" ? "" : filter.sort,
    system,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value) {
      query.set(key, value);
    } else {
      query.delete(key);
    }
  }
  const text = query.toString();
  const address = `${location.pathname}${text ? `?${text}` : ""}`;
  if (push) {
    history.pushState(null, "", address);
  } else {
    history.replaceState(null, "", address);
  }
};

function useStoreState() {
  const [state, setState] = useState(() => storeFromAddress(location.search));

  useEffect(() => {
    const back = () => setState(storeFromAddress(location.search));
    addEventListener("popstate", back);
    return () => removeEventListener("popstate", back);
  }, []);

  return {
    ...state,
    setFilter: (filter: StoreFilter) => {
      writeAddress(filter, state.system, false);
      setState({ ...state, filter });
    },
    open: (system: string) => {
      writeAddress(state.filter, system, true);
      setState({ ...state, system });
      scrollTo({ top: 0 });
    },
  };
}

/** Inside a chosen family the card does not repeat it. */
function SystemCard({
  summary,
  onOpen,
  showFamily,
}: {
  summary: SystemSummary;
  onOpen: () => void;
  showFamily: boolean;
}) {
  const text = useText();
  const language = useLanguage();
  const { family, latest, count, architectures } = summary;
  return (
    <li>
      <a
        className="system-card"
        href={href("/images/", { system: family.id })}
        onClick={(event) => {
          if (!(event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)) {
            event.preventDefault();
            onOpen();
          }
        }}
      >
        <Logo src={logoOf(family)} size={56} />
        <span className="system-card-text">
          <strong>{family.name}</strong>
          {showFamily ? (
            <span className="muted">{categoryLabel(family.category ?? "", language)}</span>
          ) : null}
        </span>
        <span className="system-card-meta">
          <span className="version">
            {latest.version}
            {latest.channel === "lts" ? <span className="badge">LTS</span> : null}
          </span>
          <small className="muted">
            {[text.imageCount(count), architectures.join(", ")].join(" · ")}
          </small>
        </span>
      </a>
    </li>
  );
}

function SideMenu({
  catalog,
  filter,
  onChange,
}: {
  catalog: Catalog;
  filter: StoreFilter;
  onChange: (filter: StoreFilter) => void;
}) {
  const text = useText();
  const language = useLanguage();
  const entries: [string, string, number][] = [
    ["", text.allFamilies, catalog.families.length],
    ...countByCategory(catalog).map(([category, count]): [string, string, number] => [
      category,
      categoryLabel(category, language),
      count,
    ]),
  ];
  return (
    <aside className="side">
      <nav aria-labelledby="side-families">
        <h2 id="side-families" className="label">
          {text.family}
        </h2>
        <ul className="side-menu">
          {entries.map(([category, label, count]) => (
            <li key={category}>
              <a
                className="side-link"
                href={href("/images/", { category: category || undefined })}
                aria-current={filter.category === category ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onChange({ ...filter, category });
                }}
              >
                <span>{label}</span>
                <span className="count">{count}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="fields side-fields">
        <label>
          {text.filterArch}
          <select
            value={filter.arch}
            onChange={(event) => onChange({ ...filter, arch: event.target.value })}
          >
            <option value="">{text.anyArch}</option>
            {architecturesOf(catalog).map((arch) => (
              <option key={arch}>{arch}</option>
            ))}
          </select>
        </label>
        <label>
          {text.sortBy}
          <select
            value={filter.sort}
            onChange={(event) =>
              onChange({ ...filter, sort: event.target.value === "recent" ? "recent" : "name" })
            }
          >
            <option value="name">{text.sortName}</option>
            <option value="recent">{text.sortRecent}</option>
          </select>
        </label>
      </div>
    </aside>
  );
}

function Grid({
  catalog,
  filter,
  setFilter,
  open,
}: {
  catalog: Catalog;
  filter: StoreFilter;
  setFilter: (filter: StoreFilter) => void;
  open: (system: string) => void;
}) {
  const text = useText();
  const language = useLanguage();
  const systems = summarize(catalog, filter, language);
  return (
    <div className="store">
      <SideMenu catalog={catalog} filter={filter} onChange={setFilter} />
      <div className="store-main">
        <label className="search">
          <span className="visually-hidden">{text.search}</span>
          <input
            type="search"
            value={filter.query}
            placeholder={text.searchPlaceholder}
            autoComplete="off"
            onChange={(event) => setFilter({ ...filter, query: event.target.value })}
          />
        </label>
        <p className="muted result-count" aria-live="polite">
          {text.heroStats(
            systems.length,
            systems.reduce((total, system) => total + system.count, 0),
          )}
        </p>
        {systems.length ? (
          <ul className="system-grid">
            {systems.map((summary) => (
              <SystemCard
                key={summary.family.id}
                summary={summary}
                showFamily={!filter.category}
                onOpen={() => open(summary.family.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="empty">
            <p>{text.noMatch}</p>
            <button
              type="button"
              className="button secondary"
              onClick={() => setFilter(NO_STORE_FILTER)}
            >
              {text.clearFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const writeCommand = (image: CatalogImage) => `bonk write DISK --image ${image.id} --yes`;

function ImageRow({ image }: { image: CatalogImage }) {
  const text = useText();
  const language = useLanguage();
  return (
    <li className="image-row">
      <div className="image-row-main">
        <strong>{image.edition ?? text.standard}</strong>
        <span className="badge">{image.arch}</span>
        {image.usb_boot === false ? <span className="badge warn">{text.dvdOnly}</span> : null}
        {image.note ? <p className="hint">{noteLabel(image.note, language)}</p> : null}
      </div>
      <div className="image-row-actions">
        {image.url ? (
          <a className="button primary small" href={image.url}>
            {text.download}
            {image.size_bytes ? <small>{sizeLabel(image.size_bytes, language)}</small> : null}
          </a>
        ) : (
          <a className="button secondary small" href={image.official_page ?? image.homepage}>
            {text.publisherPage}
          </a>
        )}
        {image.url && image.usb_boot !== false ? (
          <CopyButton value={writeCommand(image)} label={text.copyCommand} />
        ) : null}
      </div>
      {image.sha256 ? (
        <details className="hash">
          <summary>SHA-256</summary>
          <code>{image.sha256}</code> <CopyButton value={image.sha256} />
        </details>
      ) : null}
    </li>
  );
}

function Versions({ images }: { images: CatalogImage[] }) {
  const text = useText();
  return (
    <>
      {versionsOf(images).map(([title, editions]) => {
        const first = editions[0];
        return (
          <section key={title} className="version-block" aria-label={title}>
            <h2>
              {title}
              {first?.channel === "lts" ? <span className="badge">LTS</span> : null}
              {first?.channel === "end_of_life" ? (
                <span className="badge warn">{text.endOfLife}</span>
              ) : null}
              <small className="muted">{first?.released}</small>
            </h2>
            <ul className="image-list">
              {editions.map((image) => (
                <ImageRow key={image.id} image={image} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function Detail({ catalog, system, arch }: { catalog: Catalog; system: string; arch: string }) {
  const text = useText();
  const language = useLanguage();
  const family = catalog.families.find((candidate) => candidate.id === system);
  const [only, setOnly] = useState(arch);
  if (!family) {
    return <p className="notice">{text.unknownSystem}</p>;
  }
  // Within one version, the system itself before its flavours (Ubuntu before Kubuntu).
  const all = imagesOf(catalog, family.id).sort(
    (a, b) =>
      compareVersions(a.version, b.version) ||
      Number(a.name !== family.name) - Number(b.name !== family.name),
  );
  const architectures = [...new Set(all.map((image) => image.arch).filter(Boolean))] as string[];
  const images = all.filter((image) => !only || image.arch === only);
  const current = images.filter((image) => image.channel !== "end_of_life");
  const ended = images.filter((image) => image.channel === "end_of_life");
  const homepage = all[0]?.homepage;
  return (
    <article className="detail" aria-labelledby="detail-title">
      <header className="detail-head">
        <Logo src={logoOf(family)} size={96} />
        <div>
          <h1 id="detail-title">{family.name}</h1>
          <p className="muted">
            {[categoryLabel(family.category ?? "", language), text.imageCount(all.length)].join(
              " · ",
            )}
          </p>
          {homepage ? (
            <p>
              <a href={homepage}>{text.officialSite}</a>
            </p>
          ) : null}
        </div>
      </header>
      {architectures.length > 1 ? (
        <nav className="menubar" aria-label={text.filterArch}>
          {["", ...architectures].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={only === value}
              onClick={() => setOnly(value)}
            >
              {value || text.anyArch}
            </button>
          ))}
        </nav>
      ) : null}
      <Versions images={current} />
      {ended.length ? (
        <details className="ended">
          <summary>{text.endOfLifeTitle}</summary>
          <Versions images={ended} />
        </details>
      ) : null}
      <p className="hint">{text.commandHint}</p>
    </article>
  );
}

export function Store() {
  const text = useText();
  const { catalog, failed } = useCatalog();
  const { filter, system, setFilter, open } = useStoreState();
  return (
    <>
      {system ? (
        <nav className="crumbs" aria-label={text.storeTitle}>
          <a
            className="back"
            href={href("/images/")}
            onClick={(event) => {
              event.preventDefault();
              open("");
            }}
          >
            {text.allSystems}
          </a>
        </nav>
      ) : (
        <header className="page-head">
          <h1>{text.storeTitle}</h1>
          <p className="lead">{text.storeIntro}</p>
        </header>
      )}
      {failed ? (
        <p role="alert" className="notice">
          {text.imagesFailed}
        </p>
      ) : null}
      {catalog ? (
        system ? (
          <Detail key={system} catalog={catalog} system={system} arch={filter.arch} />
        ) : (
          <Grid catalog={catalog} filter={filter} setFilter={setFilter} open={open} />
        )
      ) : failed ? null : (
        <ul className="system-grid" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <li key={key} className="system-card placeholder" />
          ))}
        </ul>
      )}
    </>
  );
}
