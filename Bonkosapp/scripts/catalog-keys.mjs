import { existsSync, writeFileSync } from "node:fs";

const SOURCE =
  "https://raw.githubusercontent.com/FantasmaGlad/Bonk/main/crates/bonk-catalog/src/manifest/trusted-keys.txt";
const TARGET = "src/data/catalogKeys.json";

const response = await fetch(SOURCE).catch((error) => ({ ok: false, status: error.message }));
if (!response.ok) {
  if (!existsSync(TARGET)) throw new Error(`${SOURCE}: ${response.status}`);
  console.warn(`${SOURCE}: ${response.status}, ${TARGET} kept`);
  process.exit(0);
}
const keys = (await response.text()).split("\n").filter(Boolean);
if (keys.length === 0 || !keys.every((key) => /^[0-9a-f]{64}$/.test(key))) {
  throw new Error(`${SOURCE}: not one lowercase hexadecimal Ed25519 key per line`);
}
writeFileSync(TARGET, `${JSON.stringify(keys, null, 2)}\n`);
console.log(`${TARGET}: ${keys.length} keys`);
