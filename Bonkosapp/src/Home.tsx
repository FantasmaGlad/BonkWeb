import { downloadUrl, VERSION } from "./downloads";
import {
  type Catalog,
  type CatalogImage,
  categoryLabel,
  countByCategory,
  logoOf,
  recentReleases,
  sizeLabel,
} from "./images";
import { MANAGERS } from "./install";
import { type Arch, type Distro, MANAGER_OF, type Os, suggestBonk, suggestImages } from "./machine";
import { Command, href, Logo, useCatalog, useLanguage, useText } from "./ui";
import { DISTROS, type MachineState, OS_NAMES, useMachine } from "./useMachine";

/** Logos shown before the catalog answers, so the first screen is never empty. */
const SHOWCASE = [
  ["ubuntu", "Ubuntu"],
  ["fedora", "Fedora"],
  ["debian", "Debian"],
  ["linuxmint", "Linux Mint"],
  ["arch", "Arch Linux"],
  ["windows", "Windows"],
  ["opensuse", "openSUSE"],
  ["manjaro", "Manjaro"],
  ["nixos", "NixOS"],
  ["kali", "Kali Linux"],
  ["rockylinux", "Rocky Linux"],
  ["almalinux", "AlmaLinux"],
] as const;

const armLabel = (image: CatalogImage) => (image.arch === "x86_64" ? undefined : image.arch);

export function ImageCard({ image, catalog }: { image: CatalogImage; catalog: Catalog }) {
  const language = useLanguage();
  const family = catalog.families.find((candidate) => candidate.id === image.family);
  return (
    <a className="image-card" href={href("/images/", { system: image.family })}>
      {family ? <Logo src={logoOf(family)} size={48} /> : null}
      <span className="image-card-text">
        <strong>{`${image.name} ${image.version}`}</strong>
        <span className="muted">
          {[image.edition, armLabel(image), image.channel === "lts" ? "LTS" : undefined]
            .filter(Boolean)
            .join(" · ")}
        </span>
        <small className="muted">
          {[image.size_bytes ? sizeLabel(image.size_bytes, language) : null, image.released]
            .filter(Boolean)
            .join(" · ")}
        </small>
      </span>
    </a>
  );
}

function Hero({ machine }: { machine: MachineState }) {
  const text = useText();
  const { detected, os, arch, distro } = machine;
  const suggestion = suggestBonk(os, arch || undefined, distro);
  const named = [OS_NAMES[os], arch].filter(Boolean).join(" ");
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-text">
        <p className="eyebrow">{`Bonk ${VERSION}`}</p>
        <h1 id="hero-title">{text.heroTitle}</h1>
        <p className="lead">{text.heroText}</p>
        <p className="muted">
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
        <p className="hero-actions">
          {suggestion ? (
            <a className="button primary large" href={downloadUrl(suggestion.file.file)}>
              {text.downloadBonk} <small>{suggestion.file.format}</small>
            </a>
          ) : null}
          <a className="button secondary large" href={href("/images/")}>
            {text.explore}
          </a>
        </p>
        {suggestion ? null : os === "other" ? null : os === "android" ? (
          <p className="notice">{text.androidUnsupported}</p>
        ) : (
          <p className="notice">{text.machineChoose}</p>
        )}
        {suggestion && !suggestion.family.writes ? (
          <p className="notice">{os === "android" ? text.androidBeta : text.preview}</p>
        ) : null}
        <details className="change" open={os === "other" || !suggestion}>
          <summary>{text.machineChange}</summary>
          <MachineForm machine={machine} />
        </details>
      </div>
      <div className="hero-art">
        <img src="/bonk.png" alt="" width="377" height="471" />
      </div>
    </section>
  );
}

function Terminal({ machine }: { machine: MachineState }) {
  const text = useText();
  const { os, distro } = machine;
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
  return (
    <section id="get" className="block" aria-labelledby="terminal">
      <div className="block-head">
        <h2 id="terminal">{text.machineCommand}</h2>
        <a className="more" href={href("/install/")}>
          {text.allOptions}
        </a>
      </div>
      {manager ? <Command value={manager.install} /> : null}
    </section>
  );
}

function Showcase() {
  const text = useText();
  return (
    <ul className="showcase" aria-label={text.storeTitle}>
      {SHOWCASE.map(([id, name]) => (
        <li key={id}>
          <a
            className="showcase-link"
            href={href("/images/", { system: id })}
            aria-label={name}
            title={name}
          >
            <img src={`/logos/${id}.png`} alt="" width="44" height="44" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Shelf({
  title,
  intro,
  images,
  catalog,
  more,
}: {
  title: string;
  intro?: string;
  images: CatalogImage[];
  catalog: Catalog;
  more: string;
}) {
  const text = useText();
  const id = title.toLowerCase().replaceAll(/\W+/g, "-");
  return (
    <section className="block" aria-labelledby={id}>
      <div className="block-head">
        <div>
          <h2 id={id}>{title}</h2>
          {intro ? <p className="muted">{intro}</p> : null}
        </div>
        <a className="more" href={more}>
          {text.seeAll}
        </a>
      </div>
      <div className="image-grid">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} catalog={catalog} />
        ))}
      </div>
    </section>
  );
}

function Families({ catalog }: { catalog: Catalog }) {
  const text = useText();
  const language = useLanguage();
  return (
    <section className="block" aria-labelledby="families">
      <div className="block-head">
        <h2 id="families">{text.familiesTitle}</h2>
      </div>
      <ul className="family-grid">
        {countByCategory(catalog).map(([category, count]) => (
          <li key={category}>
            <a className="family-tile" href={href("/images/", { category })}>
              <span className="family-logos">
                {catalog.families
                  .filter((family) => family.category === category)
                  .slice(0, 4)
                  .map((family) => (
                    <img key={family.id} src={logoOf(family)} alt="" width="28" height="28" />
                  ))}
              </span>
              <strong>{categoryLabel(category, language)}</strong>
              <small className="muted">{text.systemCount(count)}</small>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MachineForm({ machine }: { machine: MachineState }) {
  const text = useText();
  const { os, arch, distro, detected } = machine;
  return (
    <form className="fields" aria-label={text.machineTitle}>
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
      {os === "linux" && !detected.distro ? <p className="hint">{text.machineDistroHint}</p> : null}
    </form>
  );
}

export function Home() {
  const text = useText();
  const machine = useMachine();
  const { catalog, failed } = useCatalog();
  const suggested = catalog
    ? suggestImages(catalog, machine.os, machine.arch || undefined, machine.distro)
    : [];
  return (
    <>
      <Hero machine={machine} />
      <Terminal machine={machine} />
      <section className="block" aria-labelledby="systems">
        <div className="block-head">
          <div>
            <h2 id="systems">{text.systemsTitle}</h2>
            <p className="muted">
              {catalog
                ? text.heroStats(catalog.families.length, catalog.images.length)
                : text.storeIntro}
            </p>
          </div>
          <a className="more" href={href("/images/")}>
            {text.seeAll}
          </a>
        </div>
        <Showcase />
      </section>
      {failed ? (
        <p role="alert" className="notice">
          {text.imagesFailed}
        </p>
      ) : null}
      {catalog ? (
        <>
          {suggested.length ? (
            <Shelf
              title={text.forYouTitle}
              intro={text.forYouText}
              images={suggested}
              catalog={catalog}
              more={href("/images/", { arch: machine.arch || undefined })}
            />
          ) : (
            <p className="notice">{text.forYouNone}</p>
          )}
          <Shelf
            title={text.recentTitle}
            images={recentReleases(catalog, 6)}
            catalog={catalog}
            more={href("/images/", { sort: "recent" })}
          />
          <Families catalog={catalog} />
        </>
      ) : failed ? null : (
        <div className="image-grid" aria-hidden="true">
          {[0, 1, 2].map((key) => (
            <span key={key} className="image-card placeholder" />
          ))}
        </div>
      )}
      <section className="block points" aria-label="Bonk">
        {text.points.map((point) => (
          <div key={point.title}>
            <h3>{point.title}</h3>
            <p className="muted">{point.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
