import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

for (const [description, skin, expected] of [
  ["an unknown skin falls back to Viper", 99, 0],
  ["a valid equipped skin survives reload", 2, 2],
]) {
  test(description, async (t) => {
    const saved = { skin, best: 900, name: "Rae", mute: true };
    const storage = new Map([["pam.profile", JSON.stringify(saved)]]);
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: (key) => storage.get(key) ?? null },
    });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, "localStorage", original);
      else delete globalThis.localStorage;
    });
    const server = await createServer({
      server: { middlewareMode: true, hmr: false },
      optimizeDeps: { noDiscovery: true },
    });
    t.after(() => server.close());
    const { profile } = await server.ssrLoadModule("/src/storage.ts");
    assert.equal(profile.skin, expected);
    assert.equal(profile.best, 900);
    assert.equal(profile.name, "Rae");
    assert.equal(profile.mute, true);
  });
}
