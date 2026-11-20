// Ed25519 key from the seed 01..20, for tests only.
const SEED = "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20";
export const TEST_KEY = "79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664";
const PKCS8_PREFIX = "302e020100300506032b657004220420";

const bytesOf = (hex: string) =>
  Uint8Array.from(hex.match(/../g) ?? [], (b) => Number.parseInt(b, 16));

export const signWithTestKey = async (
  manifest: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> => {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    bytesOf(PKCS8_PREFIX + SEED),
    { name: "Ed25519" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, key, manifest));
};
