import { TRUSTED_KEYS } from "./catalogKeys";

const bytesOf = (hex: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(hex.match(/../g) ?? [], (byte) => Number.parseInt(byte, 16));

/** Without a key to import, nothing can be checked: same answer as a browser without Ed25519. */
export const ed25519Available = async (): Promise<boolean> => {
  try {
    await crypto.subtle.importKey(
      "raw",
      bytesOf(TRUSTED_KEYS[0] ?? ""),
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    return true;
  } catch {
    return false;
  }
};

/** The catalog text once its signature and expiry hold, as Bonk checks them; an error otherwise. */
export const verifiedText = async (
  manifest: Uint8Array<ArrayBuffer>,
  signature: Uint8Array<ArrayBuffer>,
  keys: readonly string[],
  nowSeconds: number,
): Promise<string> => {
  let signed = false;
  for (const hex of keys) {
    const key = await crypto.subtle.importKey("raw", bytesOf(hex), { name: "Ed25519" }, false, [
      "verify",
    ]);
    if (await crypto.subtle.verify({ name: "Ed25519" }, key, signature, manifest)) {
      signed = true;
      break;
    }
  }
  if (!signed) {
    throw new Error("catalog signature does not match Bonk's keys");
  }
  const text = new TextDecoder().decode(manifest);
  const { expires_unix: expires } = JSON.parse(text) as { expires_unix?: number };
  if (typeof expires !== "number" || expires <= nowSeconds) {
    throw new Error("catalog expired");
  }
  return text;
};
