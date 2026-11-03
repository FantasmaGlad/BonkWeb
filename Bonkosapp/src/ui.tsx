import { createContext, useContext, useEffect, useState } from "react";
import { type Catalog, loadCatalog } from "./images";
import { localHref } from "./language";
import { type Language, TEXT } from "./text";

export const LanguageContext = createContext<Language>("en");

export const useText = () => TEXT[useContext(LanguageContext)];
export const useLanguage = () => useContext(LanguageContext);

/** A link inside the site that keeps the language named in the address, if any. */
export const href = (path: string, params: Record<string, string | undefined> = {}) =>
  localHref(path, location.search, params);

/** Reads the catalog once; `failed` when it does not answer. */
export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current = true;
    loadCatalog()
      .then((value) => current && setCatalog(value))
      .catch(() => current && setFailed(true));
    return () => {
      current = false;
    };
  }, []);

  return { catalog, failed };
}

export function Logo({ src, size = 40 }: { src: string; size?: number }) {
  return (
    <span className="logo-tile" data-size={size}>
      <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" />
    </span>
  );
}

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const text = useText();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) {
      return;
    }
    const timer = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(timer);
  }, [done]);

  return (
    <button
      type="button"
      className="copy"
      onClick={() => {
        // Without clipboard access (insecure context, refused permission) the text stays selectable.
        navigator.clipboard?.writeText(value).then(
          () => setDone(true),
          () => undefined,
        );
      }}
    >
      <span aria-live="polite">{done ? text.copied : (label ?? text.copy)}</span>
    </button>
  );
}

export function Command({ value }: { value: string }) {
  return (
    <div className="command">
      <pre>{value}</pre>
      <CopyButton value={value} />
    </div>
  );
}
