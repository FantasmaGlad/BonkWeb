import { useEffect, useState } from "react";
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
        <p className="actions">
          <a className="primary" href={RELEASES}>
            {text.download}
          </a>
          <a href={SOURCE}>{text.source}</a>
        </p>
        <p>{text.preview}</p>
      </main>
      <footer>
        <a href={`mailto:${SECURITY_MAIL}`}>{text.security}</a> · MIT
      </footer>
    </>
  );
}
