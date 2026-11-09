import { useMemo } from "react";
import { useText } from "../../../i18n/I18nProvider";
import { useSearchParams } from "../../../router/Router";
import { summarize } from "../../../shared/lib/catalog";
import type { Catalog } from "../../../types/catalog";
import type { CatalogFilter } from "../../../types/system";
import { filterFromParams, filterSystems, NO_FILTER, paramsOfFilter } from "../lib/filter";

/** Filters live in the address: a view can be shared, reloaded and left with the back button. */
export function useCatalogFilter(catalog: Catalog | null) {
  const text = useText();
  const [params, setParams] = useSearchParams();
  const filter = useMemo(() => filterFromParams(params), [params]);
  const all = useMemo(() => (catalog ? summarize(catalog) : []), [catalog]);
  const descriptions = text.market.systems;
  const systems = useMemo(
    () => filterSystems(all, filter, (id) => descriptions[id] ?? ""),
    [all, filter, descriptions],
  );
  const openId = params.get("system") ?? "";
  return {
    filter,
    all,
    systems,
    openId,
    opened: all.find((system) => system.family.id === openId),
    imageId: params.get("image") ?? "",
    setFilter: (next: CatalogFilter) => setParams(paramsOfFilter(next), { replace: true }),
    clear: () => setParams(paramsOfFilter(NO_FILTER), { replace: true }),
    open: (system: string) => setParams({ system, image: undefined }),
    close: () => setParams({ system: undefined, image: undefined }),
    selectImage: (image: string) => setParams({ image }, { replace: true }),
  };
}
