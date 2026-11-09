import { CatalogPreview } from "./components/CatalogPreview";
import { Explainer } from "./components/Explainer";
import { Hero } from "./components/Hero";

const HOW = "how";

export function Home() {
  return (
    <>
      <Hero next={HOW} />
      <Explainer id={HOW} />
      <CatalogPreview />
    </>
  );
}
