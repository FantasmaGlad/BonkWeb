import { CatalogPreview } from "./components/CatalogPreview";
import { Hero } from "./components/Hero";

const CATALOG = "catalog";

export function Home() {
  return (
    <>
      <Hero next={CATALOG} />
      <CatalogPreview id={CATALOG} />
    </>
  );
}
