import { expect, it } from "vitest";
import { redirectOf, viewOf } from "../app/routes";
import { buildHref, patchSearch } from "./address";

it("garde dans les liens la langue de l'adresse, et elle seule", () => {
  expect(buildHref("/images/", "")).toBe("/images/");
  expect(buildHref("/images/", "?lang=fr&q=x", { system: "ubuntu" })).toBe(
    "/images/?system=ubuntu&lang=fr",
  );
  expect(buildHref("/install/#commands", "?lang=en")).toBe("/install/?lang=en#commands");
  expect(buildHref("/", "?lang=xx")).toBe("/");
});

it("change des paramètres sans perdre les autres", () => {
  expect(patchSearch("?lang=fr&q=x", { q: undefined, system: "ubuntu" })).toBe(
    "?lang=fr&system=ubuntu",
  );
  expect(patchSearch("?q=x", { q: "" })).toBe("");
});

it("reconnaît les trois vues et renvoie l'ancienne page des commandes", () => {
  expect(viewOf("/")).toBe("home");
  expect(viewOf("/images")).toBe("marketplace");
  expect(viewOf("/install/")).toBe("download");
  expect(redirectOf("/docs/")).toBe("/install/#commands");
  expect(redirectOf("/docs")).toBe("/install/#commands");
  expect(redirectOf("/install/")).toBeUndefined();
});
