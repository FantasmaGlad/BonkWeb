import { type ReactNode, useEffect } from "react";
import { Download } from "../features/download/Download";
import { Home } from "../features/home/Home";
import { Marketplace } from "../features/marketplace/Marketplace";
import { useText } from "../i18n/I18nProvider";
import { useHref, useLocation, useNavigate } from "../router/Router";
import { redirectOf, type View, viewOf } from "./routes";

const VIEWS: Record<View, () => ReactNode> = {
  home: () => <Home />,
  marketplace: () => <Marketplace />,
  download: () => <Download />,
};

export function Routes() {
  const { path } = useLocation();
  const navigate = useNavigate();
  const href = useHref();
  const text = useText();
  const redirect = redirectOf(path);
  const view = viewOf(path);

  useEffect(() => {
    if (redirect) {
      navigate(href(redirect), { replace: true });
    }
  }, [redirect, navigate, href]);

  useEffect(() => {
    document.title = text.titles[view];
  }, [text, view]);

  return redirect ? null : VIEWS[view]();
}
