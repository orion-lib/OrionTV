export {};
declare global {
  function base64FromArrayBuffer(buffer: ArrayBuffer): string;
  function base64ToArrayBuffer(base64: string): ArrayBuffer;
}
(() => {
  const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  const base64Lookup: string[] = base64Chars.split("");
  const base64RevLookup: Record<string, number> = {};

  for (let i = 0; i < base64Chars.length; i++) {
    base64RevLookup[base64Chars[i]] = i;
  }

  // Support URL-safe variants
  base64RevLookup["-"] = 62;
  base64RevLookup["_"] = 63;

  if (typeof globalThis.base64FromArrayBuffer !== "function") {
    globalThis.base64FromArrayBuffer = function base64FromArrayBuffer(buffer: ArrayBuffer): string {
      const bytes = new Uint8Array(buffer);
      const len = bytes.length;
      let base64 = "";

      for (let i = 0; i < len; i += 3) {
        const a = bytes[i];
        const b = i + 1 < len ? bytes[i + 1] : 0;
        const c = i + 2 < len ? bytes[i + 2] : 0;

        const triplet = (a << 16) | (b << 8) | c;

        base64 += base64Lookup[(triplet >> 18) & 0x3f];
        base64 += base64Lookup[(triplet >> 12) & 0x3f];
        base64 += i + 1 < len ? base64Lookup[(triplet >> 6) & 0x3f] : "=";
        base64 += i + 2 < len ? base64Lookup[triplet & 0x3f] : "=";
      }

      return base64;
    };
  }

  if (typeof globalThis.base64ToArrayBuffer !== "function") {
    globalThis.base64ToArrayBuffer = function base64ToArrayBuffer(base64: string): ArrayBuffer {
      const clean = base64.replaceAll(/[^\w+/=-]/g, "");
      const len = clean.length;

      if (len % 4 !== 0) {
        throw new Error("Invalid base64 string");
      }

      const placeHolders = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
      const byteLength = (len * 3) / 4 - placeHolders;
      const buffer = new Uint8Array(byteLength);

      let bufferIndex = 0;
      for (let i = 0; i < len; i += 4) {
        const chunk =
          (base64RevLookup[clean[i]] << 18) |
          (base64RevLookup[clean[i + 1]] << 12) |
          (base64RevLookup[clean[i + 2]] << 6) |
          base64RevLookup[clean[i + 3]];

        buffer[bufferIndex++] = (chunk >> 16) & 0xff;
        if (clean[i + 2] !== "=") buffer[bufferIndex++] = (chunk >> 8) & 0xff;
        if (clean[i + 3] !== "=") buffer[bufferIndex++] = chunk & 0xff;
      }

      return buffer.buffer;
    };
  }
})();
// This file ensures that base64 conversion functions are available globally,
// which may be required by certain libraries that expect these functions to exist.