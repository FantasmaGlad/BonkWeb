import { describe, expect, it } from "vitest";
import { en } from "../i18n/en";
import { CATALOG } from "../test/fixtures";
import { headFor } from "./meta";

const FACTS = { version: "0.1.0", source: "https://github.com/FantasmaGlad/Bonk" };
const structured = (head: string) =>
  JSON.parse(head.match(/<script type="application\/ld\+json">(.*)<\/script>/)?.[1] ?? "{}");

describe("en-tête des pages prérendues", () => {
  it("décrit la page Systèmes par les chiffres du catalogue, à son adresse canonique", () => {
    const head = headFor(en, "marketplace", CATALOG, FACTS);
    expect(head).toContain("of 9 images of 4 systems, read every day");
    expect(head).toContain('<link rel="canonical" href="https://bonk-os.app/images/" />');
    expect(structured(head)["@type"]).toBe("BreadcrumbList");
    expect(structured(head).itemListElement[1].name).toBe("Systems");
  });

  it("ne donne que des faits vérifiables sur l'application", () => {
    const app = structured(headFor(en, "home", null, FACTS));
    expect(app).toMatchObject({ "@type": "SoftwareApplication", softwareVersion: "0.1.0" });
    expect(Object.keys(app)).not.toContain("aggregateRating");
    expect(Object.keys(app)).not.toContain("offers");
  });

  it("échappe le texte et sort sans catalogue", () => {
    const head = headFor(
      { ...en, titles: { ...en.titles, download: 'a "b" <c>' } },
      "download",
      null,
      FACTS,
    );
    expect(head).toContain("<title>a &quot;b&quot; &lt;c&gt;</title>");
    expect(headFor(en, "marketplace", null, FACTS)).toContain('content="Bonk: systems"');
  });
});
