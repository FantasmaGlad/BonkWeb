import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { buildHref, type Params, patchSearch } from "./address";

export type Location = { path: string; search: string; hash: string };
type NavigateOptions = { replace?: boolean };
type RouterValue = Location & { navigate: (to: string, options?: NavigateOptions) => void };

const read = (): Location => ({
  path: location.pathname,
  search: location.search,
  hash: location.hash,
});

const RouterContext = createContext<RouterValue>({ ...read(), navigate: () => undefined });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(read);
  const shown = useRef(current.path);

  useEffect(() => {
    const sync = () => setCurrent(read());
    addEventListener("popstate", sync);
    return () => removeEventListener("popstate", sync);
  }, []);

  const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
    if (options.replace) {
      history.replaceState(null, "", to);
    } else {
      history.pushState(null, "", to);
    }
    setCurrent(read());
  }, []);

  // A new page starts at its top or at its anchor; a parameter change keeps the scroll position.
  useEffect(() => {
    const target = current.hash ? document.getElementById(current.hash.slice(1)) : null;
    if (target) {
      target.scrollIntoView?.({ behavior: "instant" });
    } else if (shown.current !== current.path) {
      scrollTo({ top: 0, behavior: "instant" });
    }
    shown.current = current.path;
  }, [current.path, current.hash]);

  const value = useMemo(() => ({ ...current, navigate }), [current, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useLocation = (): Location => useContext(RouterContext);
export const useNavigate = () => useContext(RouterContext).navigate;

/** Internal addresses that keep the language named in the current one. */
export const useHref = () => {
  const { search } = useContext(RouterContext);
  return useCallback((to: string, params?: Params) => buildHref(to, search, params), [search]);
};

export const useSearchParams = () => {
  const { path, search, navigate } = useContext(RouterContext);
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const set = useCallback(
    (patch: Params, options?: NavigateOptions) =>
      navigate(`${path}${patchSearch(search, patch)}`, options),
    [path, search, navigate],
  );
  return [params, set] as const;
};
