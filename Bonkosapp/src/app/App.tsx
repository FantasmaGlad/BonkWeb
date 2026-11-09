import { I18nProvider } from "../i18n/I18nProvider";
import { RouterProvider } from "../router/Router";
import { CatalogProvider } from "../shared/hooks/useCatalog";
import { Layout } from "./Layout";
import { Routes } from "./Routes";

export function App() {
  return (
    <RouterProvider>
      <I18nProvider>
        <CatalogProvider>
          <Layout>
            <Routes />
          </Layout>
        </CatalogProvider>
      </I18nProvider>
    </RouterProvider>
  );
}
