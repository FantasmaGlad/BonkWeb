import { type ReactNode, useEffect, useState } from "react";
import commands from "./commands.json";
import { CLI_FAMILIES, downloadUrl, FAMILIES, type Family, VERSION } from "./downloads";
import {
  CATALOG_URL,
  type Catalog,
  type CatalogImage,
  imagesOf,
  loadCatalog,
  sizeLabel,
} from "./images";
import {
  HEADLESS_INSTALL,
  HEADLESS_INSTALL_WINDOWS,
  HEADLESS_REMOVE,
  HEADLESS_REMOVE_WINDOWS,
  MANAGERS,
} from "./install";
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

function Home({ language }: { language: Language }) {
  const text = TEXT[language];
  return (
    <>
      <img src="/logo.png" alt="" width="160" height="160" />
      <h1>Bonk</h1>
      <p className="tagline">{text.tagline}</p>
      <ul>
        {text.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <h2>
        {text.downloads} <span className="version">{`${text.version} ${VERSION}`}</span>
      </h2>
      <Families families={FAMILIES} language={language} />
      <h2 id="cli">{text.headless}</h2>
      <p>{text.headlessText}</p>
      <pre>{HEADLESS_INSTALL}</pre>
      <pre>{HEADLESS_INSTALL_WINDOWS}</pre>
      <Families families={CLI_FAMILIES} language={language} />
      <p className="links">
        <a href="/install/#headless">{text.cliCommands}</a>
      </p>
      <p className="links">
        <a href={RELEASES}>{text.allReleases}</a>
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

function ImageRow({ image, language }: { image: CatalogImage; language: Language }) {
  const text = TEXT[language];
  const channel = channelLabel(image, language);
  const title = [image.name, image.version, image.edition, channel].filter(Boolean).join(" ");
  return (
    <li>
      <strong>{title}</strong> <small>{image.released}</small>
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
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch(() => setFailed(true));
  }, []);

  return (
    <>
      <h1>{text.imagesTitle}</h1>
      <p>{text.imagesIntro}</p>
      {failed ? <p role="alert">{text.imagesFailed}</p> : null}
      {catalog?.families.map((family) => (
        <section key={family.id} aria-labelledby={family.id} className="manager">
          <p className="logos">
            <img src={`${CATALOG_URL}${family.icon}`} alt="" width="32" height="32" />
          </p>
          <h2 id={family.id}>{family.name}</h2>
          <ul>
            {imagesOf(catalog, family.id).map((image) => (
              <ImageRow key={image.id} image={image} language={language} />
            ))}
          </ul>
        </section>
      ))}
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
