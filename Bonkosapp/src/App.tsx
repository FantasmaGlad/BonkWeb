import { useEffect, useState } from "react";
import { downloadUrl, FAMILIES, VERSION } from "./downloads";
import { type Language, RELEASES, SECURITY_MAIL, SOURCE, TEXT } from "./text";

const initialLanguage = (): Language => (navigator.language.startsWith("fr") ? "fr" : "en");

export function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const text = TEXT[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <>
      <header>
        <button
          type="button"
          lang={language === "en" ? "fr" : "en"}
          onClick={() => setLanguage(language === "en" ? "fr" : "en")}
        >
          {text.switchLabel}
        </button>
      </header>
      <main>
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
        <div className="families">
          {FAMILIES.map((family) => (
            <section key={family.id} aria-labelledby={family.id} className="family">
              <p className="logos">
                {family.logos.map((logo) => (
                  <img key={logo} src={`/icons/${logo}.svg`} alt="" width="32" height="32" />
                ))}
              </p>
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
        <p className="links">
          <a href={RELEASES}>{text.allReleases}</a>
          <a href={SOURCE}>{text.source}</a>
        </p>
      </main>
      <footer>
        <a href={`mailto:${SECURITY_MAIL}`}>{text.security}</a>
      </footer>
    </>
  );
}
