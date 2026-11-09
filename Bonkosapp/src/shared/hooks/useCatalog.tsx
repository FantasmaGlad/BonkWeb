import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { loadCatalog } from "../../data/catalogService";
import type { Catalog } from "../../types/catalog";

type CatalogState = { catalog: Catalog | null; failed: boolean };

const CatalogContext = createContext<CatalogState>({ catalog: null, failed: false });

/** One read per visit: every view shares it across navigation. */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>({ catalog: null, failed: false });

  useEffect(() => {
    let current = true;
    loadCatalog()
      .then((catalog) => current && setState({ catalog, failed: false }))
      .catch(() => current && setState({ catalog: null, failed: true }));
    return () => {
      current = false;
    };
  }, []);

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>;
}

export const useCatalog = (): CatalogState => useContext(CatalogContext);
