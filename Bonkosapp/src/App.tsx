import { type ReactNode, useEffect } from "react";
import { Docs } from "./Docs";
import { VERSION } from "./downloads";
import { Home } from "./Home";
import { Install } from "./Install";
import { type Language, languageFrom } from "./language";
import { Store } from "./Store";
import { RELEASES, SECURITY_MAIL, SOURCE, TEXT } from "./text";
import { href, LanguageContext } from "./ui";

export type Page = "home" | "install" | "docs" | "images";

const PAGES: Record<Page, () => ReactNode> = {
  home: () => <Home />,
  install: () => <Install />,
  docs: () => <Docs />,
  images: () => <Store />,
};

export function App({
  page = "home",
  language = languageFrom(location.search, navigator.language),
}: {
  page?: Page;
  language?: Language;
}) {
  const text = TEXT[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const link = (target: Page, path: string, label: string) => (
    <a href={href(path)} aria-current={page === target ? "page" : undefined}>
      {label}
    </a>
  );

  return (
    <LanguageContext.Provider value={language}>
      <a className="skip" href="#main">
        {text.skip}
      </a>
      <header className="site-header">
        <div className="bar">
          <a className="brand" href={href("/")} aria-current={page === "home" ? "page" : undefined}>
            <img src="/logo.png" alt="" width="36" height="36" />
            <span>Bonk</span>
          </a>
          <nav aria-label="Bonk">
            {link("images", "/images/", text.systemsNav)}
            {link("install", "/install/", text.getNav)}
            {link("docs", "/docs/", text.commandsNav)}
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {PAGES[page]()}
      </main>
      <footer className="site-footer">
        <div className="bar">
          <p className="footer-brand">
            <img src="/logo.png" alt="" width="28" height="28" />
            <span>
              <strong>Bonk</strong> <span className="muted">{`${VERSION} · ${text.tagline}`}</span>
            </span>
          </p>
          <p className="links">
            <a href={SOURCE}>{text.source}</a>
            <a href={RELEASES}>{text.allReleases}</a>
            <a href={`mailto:${SECURITY_MAIL}`}>{text.security}</a>
          </p>
        </div>
      </footer>
    </LanguageContext.Provider>
  );
}
