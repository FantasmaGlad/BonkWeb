import { describe, expect, it, vi } from "vitest";
import { verifiedText } from "./catalogSignature";

const NOW = 1_000;

const signer = async () => {
  const pair = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const hex = Buffer.from(raw).toString("hex");
  const sign = async (text: string) => {
    const manifest = new TextEncoder().encode(text);
    const signature = new Uint8Array(
      await crypto.subtle.sign({ name: "Ed25519" }, pair.privateKey, manifest),
    );
    return { manifest, signature };
  };
  return { hex, sign };
};

describe("signature du catalogue", () => {
  it("un catalogue signé et en cours de validité se lit", async () => {
    const { hex, sign } = await signer();
    const { manifest, signature } = await sign(`{"expires_unix":${NOW + 1},"images":[]}`);
    expect(await verifiedText(manifest, signature, ["00".repeat(32), hex], NOW)).toContain(
      "images",
    );
  });

  it("un octet changé, une autre clé ou un catalogue expiré sont refusés", async () => {
    const { hex, sign } = await signer();
    const autre = await signer();
    const { manifest, signature } = await sign(`{"expires_unix":${NOW + 1}}`);
    const change = manifest.slice();
    change[2] = (change[2] ?? 0) ^ 1;
    await expect(verifiedText(change, signature, [hex], NOW)).rejects.toThrow("signature");
    await expect(verifiedText(manifest, signature, [autre.hex], NOW)).rejects.toThrow("signature");
    const vieux = await sign(`{"expires_unix":${NOW}}`);
    await expect(verifiedText(vieux.manifest, vieux.signature, [hex], NOW)).rejects.toThrow(
      "expired",
    );
  });

  it("les deux clés de Bonk sont distinctes et de 32 octets", async () => {
    const { TRUSTED_KEYS } = await vi.importActual<typeof import("./catalogKeys")>("./catalogKeys");
    expect(new Set(TRUSTED_KEYS).size).toBe(2);
    for (const key of TRUSTED_KEYS) {
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});
