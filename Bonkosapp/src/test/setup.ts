import { vi } from "vitest";
import { TEST_KEY } from "./signing";

// Tests serve a catalog signed by a test key: the site trusts it in place of Bonk's.
vi.mock("../data/catalogKeys", () => ({ TRUSTED_KEYS: [TEST_KEY] }));
