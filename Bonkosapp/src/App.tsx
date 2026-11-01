import { type ReactNode, useEffect, useState } from "react";
import commands from "./commands.json";
import { CLI_FAMILIES, downloadUrl, FAMILIES, type Family, VERSION } from "./downloads";
import {
  architecturesOf,
  CATALOG_URL,
  type Catalog,
  type CatalogFilter,
  type CatalogImage,
  categoriesOf,
  familiesIn,
  filterFromAddress,
  loadCatalog,
  NO_FILTER,
  type SortBy,
  selectImages,
  sizeLabel,
} from "./images";
import {
  HEADLESS_INSTALL,
  HEADLESS_INSTALL_WINDOWS,
  HEADLESS_REMOVE,
  HEADLESS_REMOVE_WINDOWS,
  MANAGERS,
} from "./install";
import {
  type Arch,
  type Distro,
  detect,
  MANAGER_OF,
  type Os,
  readHints,
  suggestBonk,
  suggestImages,
} from "./machine";
import { type Language, RELEASES, SECURITY_MAIL, SOURCE, TEXT } from "./text";

export type Page = "home" | "install" | "docs" | "images";

const initialLanguage = (): Language => (navigator.language.startsWith("fr") ? "fr" : "en");

type Row = { flag: string; text: { en: string; fr: string } };

function Logos({ names }: { names: readonly string[] }) {
  return (
    <p className="logos">
      {names.map((logo) => (
        <img key={logo} src={`/icons/${logo}.svg`} alt="" width="32" height="32" />
      ))}
    </p>
  );
}

const DISTROS = [
  ["debian", "distroDebian"],
  ["fedora", "distroFedora"],
  ["suse", "distroSuse"],
  ["arch", "distroArch"],
  ["manjaro", "distroManjaro"],
  ["other", "distroOther"],
] as const;

const SAVED_DISTRO = "bonk-distro";

const savedDistro = (): Distro | undefined => {
  try {
    const value = localStorage.getItem(SAVED_DISTRO);
    return DISTROS.some(([id]) => id === value) ? (value as Distro) : undefined;
  } catch {
    return undefined;
  }
};

const saveDistro = (distro: Distro) => {
  try {
    localStorage.setItem(SAVED_DISTRO, distro);
  } catch {
    // Sans stockage, le choix vaut pour cette visite.
  }
};

/** What the page knows of this computer, and the choices that correct it. */
function useMachine() {
  const [detected, setDetected] = useState(() => detect(navigator.userAgent, navigator.platform));
  const [os, setOs] = useState<Os | null>(null);
  const [arch, setArch] = useState<Arch | "" | null>(null);
  const [distro, setDistro] = useState<Distro | null>(savedDistro() ?? null);

  useEffect(() => {
    let current = true;
    readHints().then((hints) => {
      if (current) {
        setDetected(detect(navigator.userAgent, navigator.platform, hints));
      }
    });
    return () => {
      current = false;
    };
  }, []);

  return {
    detected,
    os: os ?? detected.os,
    arch: (arch ?? detected.arch ?? "") as Arch | "",
    distro: distro ?? detected.distro ?? ("debian" as Distro),
    setOs,
    setArch,
    setDistro: (value: Distro) => {
      saveDistro(value);
      setDistro(value);
    },
  };
}

const OS_NAMES: Record<Os, string> = {
  linux: "Linux",
  windows: "Windows",
  macos: "macOS",
  android: "Android",
  other: "",
};

function GetBonk({
  machine,
  language,
}: {
  machine: ReturnType<typeof useMachine>;
  language: Language;
}) {
  const text = TEXT[language];
  const { detected, os, arch, distro } = machine;
  const suggestion = suggestBonk(os, arch || undefined, distro);
  const manager = MANAGERS.find(
    (candidate) =>
      candidate.id ===
      (os === "linux"
        ? MANAGER_OF[distro]
        : os === "macos"
          ? "brew"
          : os === "windows"
            ? "scoop"
            : ""),
  );
  const named = [OS_NAMES[detected.os], detected.arch].filter(Boolean).join(" ");
  return (
    <section aria-labelledby="get-bonk" className="step">
      <h2 id="get-bonk">
        {text.machineTitle} <span className="version">{`${text.version} ${VERSION}`}</span>
      </h2>
      <p>
        {detected.os === "other" ? (
          /iphone|ipad|cros/i.test(navigator.userAgent) ? (
            text.machineOtherDevice
          ) : (
            text.machineUnknown
          )
        ) : (
          <>
            {text.machineDetected} <strong>{named}</strong>
          </>
        )}
      </p>
      <form className="filters" aria-label={text.machineTitle}>
        <label>
          {text.machineSystem}
          <select
            value={os === "other" ? "" : os}
            onChange={(event) => machine.setOs(event.target.value as Os)}
          >
            {os === "other" ? <option value="">{text.choiceUnknown}</option> : null}
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
            <option value="macos">macOS</option>
            <option value="android">Android</option>
          </select>
        </label>
        {os === "linux" ? (
          <label>
            {text.machineDistro}
            <select
              value={distro}
              onChange={(event) => machine.setDistro(event.target.value as Distro)}
            >
              {DISTROS.map(([id, label]) => (
                <option key={id} value={id}>
                  {text[label]}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {os !== "macos" && os !== "android" && os !== "other" ? (
          <label>
            {text.machineArch}
            <select value={arch} onChange={(event) => machine.setArch(event.target.value as Arch)}>
              {arch ? null : <option value="">{text.choiceUnknown}</option>}
              <option value="x86_64">Intel, AMD 64 bits</option>
              <option value="aarch64">ARM 64 bits</option>
              <option value="i686">Intel, AMD 32 bits</option>
            </select>
          </label>
        ) : null}
      </form>
      {os === "linux" && !detected.distro ? <p className="note">{text.machineDistroHint}</p> : null}
      {suggestion ? (
        <p>
          <a className="primary" href={downloadUrl(suggestion.file.file)}>
            {text.machineDownload} <small>{suggestion.file.format}</small>
          </a>
        </p>
      ) : os === "android" ? (
        <p className="note">{text.androidSoon}</p>
      ) : os === "other" ? null : (
        <p className="note">{text.machineChoose}</p>
      )}
      {suggestion && !suggestion.family.writes ? <p className="note">{text.preview}</p> : null}
      {manager ? (
        <>
          <p>{text.machineCommand}</p>
          <pre>{manager.install}</pre>
        </>
      ) : null}
      <details>
        <summary>{text.otherDownloads}</summary>
        <Families families={FAMILIES} language={language} />
        <h3 id="cli">{text.headless}</h3>
        <p>{text.headlessText}</p>
        <pre>{HEADLESS_INSTALL}</pre>
        <pre>{HEADLESS_INSTALL_WINDOWS}</pre>
        <Families families={CLI_FAMILIES} language={language} />
        <p className="links">
          <a href="/install/#headless">{text.cliCommands}</a>
          <a href={RELEASES}>{text.allReleases}</a>
        </p>
      </details>
    </section>
  );
}

function SuggestedImages({
  machine,
  language,
}: {
  machine: ReturnType<typeof useMachine>;
  language: Language;
}) {
  const text = TEXT[language];
  const { catalog, failed } = useCatalog();
  const suggested = catalog
    ? suggestImages(catalog, machine.os, machine.arch || undefined, machine.distro)
    : [];
  return (
    <section aria-labelledby="images" className="step">
      <h2 id="images">{text.suggestTitle}</h2>
      {failed ? <p role="alert">{text.imagesFailed}</p> : null}
      {catalog ? <p>{suggested.length ? text.suggestIntro : text.suggestNone}</p> : null}
      <div className="families">
        {catalog
          ? suggested.map((image) => {
              const family = catalog.families.find((candidate) => candidate.id === image.family);
              return (
                <a key={image.id} className="card" href={image.url}>
                  {family ? (
                    <img src={`${CATALOG_URL}${family.icon}`} alt="" width="40" height="40" />
                  ) : null}
                  <span>
                    <strong>{`${image.name} ${image.version}`}</strong>{" "}
                    {[image.edition, armLabel(image), channelLabel(image, language)]
                      .filter(Boolean)
                      .join(" ")}
                    <small>{image.size_bytes ? sizeLabel(image.size_bytes) : null}</small>
                  </span>
                </a>
              );
            })
          : null}
      </div>
      {catalog ? (
        <>
          <p className="links">
            <a href={machine.arch ? `/images/?arch=${machine.arch}` : "/images/"}>
              {text.browseAll}
            </a>
          </p>
          <h3>{text.browseCategories}</h3>
          <p className="actions">
            {categoriesOf(catalog).map((category) => (
              <a key={category} href={`/images/?category=${encodeURIComponent(category)}`}>
                {category}
              </a>
            ))}
          </p>
        </>
      ) : null}
      <details>
        <summary>{text.allIsos}</summary>
        <DirectLinks catalog={catalog} language={language} />
      </details>
    </section>
  );
}

function Home({ language }: { language: Language }) {
  const text = TEXT[language];
  const machine = useMachine();
  return (
    <>
      <div className="hero">
        <img src="/logo.png" alt="" width="96" height="96" />
        <div>
          <h1>Bonk</h1>
          <p className="tagline">{text.tagline}</p>
        </div>
      </div>
      <GetBonk machine={machine} language={language} />
      <SuggestedImages machine={machine} language={language} />
      <ul>
        {text.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p className="links">
        <a href={SOURCE}>{text.source}</a>
      </p>
    </>
  );
}

function Families({ families, language }: { families: readonly Family[]; language: Language }) {
  const text = TEXT[language];
  return (
    <div className="families">
      {families.map((family) => (
        <section key={family.id} aria-labelledby={family.id} className="family">
          <Logos names={family.logos} />
          <h3 id={family.id}>{family.name}</h3>
          {family.writes ? null : <p className="note">{text.preview}</p>}
          <p className="actions">
            {family.files.map(({ arch, format, file }) => (
              <a key={file} href={downloadUrl(file)}>
                {arch} <small>{format}</small>
              </a>
            ))}
          </p>
        </section>
      ))}
    </div>
  );
}

function Install({ language }: { language: Language }) {
  const text = TEXT[language];
  return (
    <>
      <h1>{text.installTitle}</h1>
      {MANAGERS.map((manager) => (
        <section key={manager.id} aria-labelledby={manager.id} className="manager">
          <Logos names={manager.logos} />
          <h2 id={manager.id}>{manager.name}</h2>
          {manager.note ? <p className="note">{manager.note[language]}</p> : null}
          <h3>{text.installStep}</h3>
          <pre>{manager.install}</pre>
          <h3>{text.cliStep}</h3>
          <pre>{manager.cli}</pre>
          <h3>{text.updateStep}</h3>
          <pre>{manager.update}</pre>
          <h3>{text.removeStep}</h3>
          <pre>{manager.remove}</pre>
        </section>
      ))}
      <section aria-labelledby="headless" className="manager">
        <Logos names={["linux", "apple", "windows"]} />
        <h2 id="headless">{text.headless}</h2>
        <p>{text.headlessText}</p>
        <h3>{text.installStep}</h3>
        <pre>{HEADLESS_INSTALL}</pre>
        <pre>{HEADLESS_INSTALL_WINDOWS}</pre>
        <h3>{text.updateStep}</h3>
        <pre>{HEADLESS_INSTALL}</pre>
        <pre>{HEADLESS_INSTALL_WINDOWS}</pre>
        <h3>{text.removeStep}</h3>
        <pre>{HEADLESS_REMOVE}</pre>
        <pre>{HEADLESS_REMOVE_WINDOWS}</pre>
      </section>
    </>
  );
}

function channelLabel(image: CatalogImage, language: Language): string | null {
  if (image.channel === "lts") {
    return "LTS";
  }
  return image.channel === "end_of_life" ? TEXT[language].endOfLife : null;
}

/** Reads the catalog once; `failed` when it does not answer. */
function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch(() => setFailed(true));
  }, []);

  return { catalog, failed };
}

function CatalogFilters({
  catalog,
  filter,
  onChange,
  language,
}: {
  catalog: Catalog;
  filter: CatalogFilter;
  onChange: (filter: CatalogFilter) => void;
  language: Language;
}) {
  const text = TEXT[language];
  const inCategory = familiesIn(catalog, { ...filter, family: "" });
  return (
    <form className="filters" aria-label={text.filterTitle}>
      <label>
        {text.filterCategory}
        <select
          value={filter.category}
          onChange={(event) => onChange({ ...filter, category: event.target.value, family: "" })}
        >
          <option value="">{text.filterAll}</option>
          {categoriesOf(catalog).map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label>
        {text.filterSystem}
        <select
          value={filter.family}
          onChange={(event) => onChange({ ...filter, family: event.target.value })}
        >
          <option value="">{text.filterAll}</option>
          {inCategory.map((family) => (
            <option key={family.id} value={family.id}>
              {family.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {text.filterArch}
        <select
          value={filter.arch}
          onChange={(event) => onChange({ ...filter, arch: event.target.value })}
        >
          <option value="">{text.filterAll}</option>
          {architecturesOf(catalog).map((arch) => (
            <option key={arch}>{arch}</option>
          ))}
        </select>
      </label>
      <label>
        {text.sortBy}
        <select
          value={filter.sort}
          onChange={(event) => onChange({ ...filter, sort: event.target.value as SortBy })}
        >
          <option value="version">{text.sortVersion}</option>
          <option value="released">{text.sortReleased}</option>
          <option value="size">{text.sortSize}</option>
        </select>
      </label>
    </form>
  );
}

function DirectLinks({ catalog, language }: { catalog: Catalog | null; language: Language }) {
  const text = TEXT[language];
  const [filter, setFilter] = useState(NO_FILTER);
  return (
    <>
      <p>{text.isoIntro}</p>
      {catalog ? (
        <CatalogFilters
          catalog={catalog}
          filter={filter}
          onChange={setFilter}
          language={language}
        />
      ) : null}
      <div className="families">
        {catalog
          ? familiesIn(catalog, filter).map((family) => {
              const images = selectImages(catalog, family.id, filter);
              return images.length === 0 ? null : (
                <section key={family.id} aria-labelledby={`iso-${family.id}`} className="family">
                  <p className="logos">
                    <img src={`${CATALOG_URL}${family.icon}`} alt="" width="32" height="32" />
                  </p>
                  <h3 id={`iso-${family.id}`}>{family.name}</h3>
                  <p className="actions">
                    {images.map((image) => (
                      <a key={image.id} href={image.url ?? image.official_page}>
                        {[
                          image.version,
                          image.edition,
                          armLabel(image),
                          channelLabel(image, language),
                        ]
                          .filter(Boolean)
                          .join(" ")}{" "}
                        <small>
                          {image.size_bytes ? sizeLabel(image.size_bytes) : text.officialPage}
                        </small>
                      </a>
                    ))}
                  </p>
                </section>
              );
            })
          : null}
      </div>
      <p className="links">
        <a href="/images/">{text.isoAll}</a>
      </p>
    </>
  );
}

/** x86_64 is the default: only the other architectures are named. */
const armLabel = (image: CatalogImage) => (image.arch === "x86_64" ? undefined : image.arch);

function ImageRow({ image, language }: { image: CatalogImage; language: Language }) {
  const text = TEXT[language];
  const channel = channelLabel(image, language);
  const title = [image.name, image.version, image.edition, armLabel(image), channel]
    .filter(Boolean)
    .join(" ");
  return (
    <li>
      <strong>{title}</strong> <small>{image.released}</small>
      {image.note ? <p className="note">{image.note}</p> : null}
      <p className="actions">
        {image.url ? (
          <a href={image.url}>
            {text.officialDownload} <small>{sizeLabel(image.size_bytes ?? 0)}</small>
          </a>
        ) : (
          <a href={image.official_page}>{text.officialPage}</a>
        )}
      </p>
      {image.sha256 ? (
        <p className="note">
          SHA-256 <code>{image.sha256}</code>
        </p>
      ) : null}
    </li>
  );
}

function Images({ language }: { language: Language }) {
  const text = TEXT[language];
  const { catalog, failed } = useCatalog();
  const [filter, setFilter] = useState(() => filterFromAddress(location.search));

  return (
    <>
      <h1>{text.imagesTitle}</h1>
      <p>{text.imagesIntro}</p>
      {failed ? <p role="alert">{text.imagesFailed}</p> : null}
      {catalog ? (
        <CatalogFilters
          catalog={catalog}
          filter={filter}
          onChange={setFilter}
          language={language}
        />
      ) : null}
      {catalog
        ? familiesIn(catalog, filter).map((family) => {
            const images = selectImages(catalog, family.id, filter);
            return images.length === 0 ? null : (
              <section key={family.id} aria-labelledby={family.id} className="manager">
                <p className="logos">
                  <img src={`${CATALOG_URL}${family.icon}`} alt="" width="32" height="32" />
                </p>
                <h2 id={family.id}>{family.name}</h2>
                <ul>
                  {images.map((image) => (
                    <ImageRow key={image.id} image={image} language={language} />
                  ))}
                </ul>
              </section>
            );
          })
        : null}
    </>
  );
}

function Rows({ title, rows, language }: { title: string; rows: Row[]; language: Language }) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <>
      <h3>{title}</h3>
      <dl>
        {rows.map((row) => (
          <div key={row.flag}>
            <dt>
              <code>{row.flag}</code>
            </dt>
            <dd>{row.text[language]}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function Docs({ language }: { language: Language }) {
  const text = TEXT[language];
  return (
    <>
      <h1>{text.commandsTitle}</h1>
      <p>{text.commandsIntro}</p>
      <nav aria-label={text.commandsTitle}>
        <ul className="index">
          {commands.commands.map((command) => (
            <li key={command.command}>
              <a href={`#${command.command.replaceAll(" ", "-")}`}>{command.command}</a>
            </li>
          ))}
        </ul>
      </nav>
      {commands.commands.map((command) => (
        <section
          key={command.command}
          id={command.command.replaceAll(" ", "-")}
          className="manager"
        >
          <h2>
            <code>{command.command}</code>
          </h2>
          <p>{command.text[language]}</p>
          <Rows title={text.arguments} rows={command.args} language={language} />
          <Rows title={text.options} rows={command.options} language={language} />
        </section>
      ))}
      <section className="manager">
        <Rows title={text.globalOptions} rows={commands.global} language={language} />
      </section>
    </>
  );
}

export function App({ page = "home" }: { page?: Page }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const text = TEXT[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const pages: Record<Page, ReactNode> = {
    home: <Home language={language} />,
    install: <Install language={language} />,
    docs: <Docs language={language} />,
    images: <Images language={language} />,
  };

  return (
    <>
      <header>
        <nav>
          <a href="/" aria-current={page === "home" ? "page" : undefined}>
            {text.home}
          </a>
          <a href="/install/" aria-current={page === "install" ? "page" : undefined}>
            {text.installNav}
          </a>
          <a href="/images/" aria-current={page === "images" ? "page" : undefined}>
            {text.imagesNav}
          </a>
          <a href="/docs/" aria-current={page === "docs" ? "page" : undefined}>
            {text.commandsNav}
          </a>
        </nav>
        <button
          type="button"
          lang={language === "en" ? "fr" : "en"}
          onClick={() => setLanguage(language === "en" ? "fr" : "en")}
        >
          {text.switchLabel}
        </button>
      </header>
      <main>{pages[page]}</main>
      <footer>
        <a href={`mailto:${SECURITY_MAIL}`}>{text.security}</a>
      </footer>
    </>
  );
}
