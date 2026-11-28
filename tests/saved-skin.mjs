import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadStorage(savedData) {
  const storage = new Map([["pam.profile", JSON.stringify(savedData)]]);
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: (key) => storage.get(key) ?? null },
  });

  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true },
  });

  let result;
  try {
    result = await server.ssrLoadModule("/src/storage.ts");
  } finally {
    await server.close();
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Skin index clamping
// ---------------------------------------------------------------------------

test("unknown skin index 99 falls back to index 0 (Emerald)", async () => {
  const { profile } = await loadStorage({ skin: 99, best: 0, name: "Test" });
  assert.equal(profile.skin, 0);
});

test("negative skin index -1 falls back to index 0 (Emerald)", async () => {
  const { profile } = await loadStorage({ skin: -1, best: 0, name: "Test" });
  assert.equal(profile.skin, 0);
});

test("valid skin index 2 (Citrus) survives reload", async () => {
  const { profile } = await loadStorage({ skin: 2, best: 0, name: "Rae" });
  assert.equal(profile.skin, 2);
});

test("valid skin index 15 (Monarch, last in roster) survives reload", async () => {
  const { profile } = await loadStorage({
    skin: 15,
    best: 5000,
    name: "Max",
    unlocked: 16,
  });
  assert.equal(profile.skin, 15);
});

// ---------------------------------------------------------------------------
// Extra fields survive reload
// ---------------------------------------------------------------------------

test("profile fields (best, name, mute) survive reload alongside skin", async () => {
  const { profile } = await loadStorage({
    skin: 2,
    best: 900,
    name: "Rae",
    mute: true,
  });
  assert.equal(profile.skin, 2);
  assert.equal(profile.best, 900);
  assert.equal(profile.name, "Rae");
  assert.equal(profile.mute, true);
});

// ---------------------------------------------------------------------------
// profile.unlocked clamping
// ---------------------------------------------------------------------------

test("unlocked below BASIC_SKIN_COUNT is clamped up to BASIC_SKIN_COUNT (4)", async () => {
  const { profile } = await loadStorage({ skin: 0, unlocked: 1 });
  // BASIC_SKIN_COUNT === 4 (Basic category has 4 skins)
  assert.ok(profile.unlocked >= 4, `expected >= 4, got ${profile.unlocked}`);
});

test("unlocked above SKINS.length (16) is clamped down to 16", async () => {
  const { profile } = await loadStorage({ skin: 0, unlocked: 999 });
  assert.ok(profile.unlocked <= 16, `expected <= 16, got ${profile.unlocked}`);
});

test("unlocked: NaN is replaced with BASIC_SKIN_COUNT", async () => {
  const { profile } = await loadStorage({ skin: 0, unlocked: NaN });
  assert.ok(profile.unlocked >= 4);
});

// ---------------------------------------------------------------------------
// progress() unlock curve across all 16 skins
// ---------------------------------------------------------------------------

test("progress(): score of 300 unlocks skin 5 (index 4)", async () => {
  const { profile, progress } = await loadStorage({
    skin: 0,
    best: 0,
    kills: 0,
    unlocked: 4,
  });
  // score-based: BASIC_SKIN_COUNT + floor(best / 300)
  // first unlock at score 300 → index 4 unlocked
  progress(300);
  assert.ok(profile.unlocked >= 5, `expected >= 5, got ${profile.unlocked}`);
});

test("progress(): score of 3600 unlocks up to skin 16 (all)", async () => {
  const { profile, progress } = await loadStorage({
    skin: 0,
    best: 0,
    kills: 0,
    unlocked: 4,
  });
  // BASIC_SKIN_COUNT(4) + floor(3600/300)=12 → 16 = skins.length
  progress(3600);
  assert.equal(profile.unlocked, 16);
});

test("progress(): score beyond 3600 does not exceed skins.length", async () => {
  const { profile, progress } = await loadStorage({
    skin: 0,
    best: 0,
    kills: 0,
    unlocked: 4,
  });
  progress(999999);
  assert.equal(profile.unlocked, 16);
});

test("progress(): 3 kills unlocks skin 5 (index 4)", async () => {
  // BASIC_SKIN_COUNT(4) + floor(kills/3) → at kills=3, floor=1 → 5
  const { profile, progress } = await loadStorage({
    skin: 0,
    best: 0,
    kills: 3,
    unlocked: 4,
  });
  progress(0);
  assert.ok(profile.unlocked >= 5, `expected >= 5, got ${profile.unlocked}`);
});

test("progress(): 36 kills unlocks all 16 skins", async () => {
  // BASIC_SKIN_COUNT(4) + floor(36/3)=12 → 16
  const { profile, progress } = await loadStorage({
    skin: 0,
    best: 0,
    kills: 36,
    unlocked: 4,
  });
  progress(0);
  assert.equal(profile.unlocked, 16);
});

test("progress(): unlocked never decreases", async () => {
  const { profile, progress } = await loadStorage({
    skin: 0,
    best: 0,
    kills: 0,
    unlocked: 10,
  });
  progress(0); // score=0, kills=0 → computed = 4, but current=10 → stays 10
  assert.ok(profile.unlocked >= 10);
});

// ---------------------------------------------------------------------------
// Boundary skin indices (edge of valid range)
// ---------------------------------------------------------------------------

test("skin index 0 (first) is valid and survives", async () => {
  const { profile } = await loadStorage({ skin: 0 });
  assert.equal(profile.skin, 0);
});

test("skin index 15 (last) is valid when fully unlocked", async () => {
  const { profile } = await loadStorage({ skin: 15, unlocked: 16 });
  assert.equal(profile.skin, 15);
});

test("skin index 16 (one past end) falls back to 0", async () => {
  const { profile } = await loadStorage({ skin: 16 });
  assert.equal(profile.skin, 0);
});

// ---------------------------------------------------------------------------
// Corrupt / missing profile
// ---------------------------------------------------------------------------

test("missing profile (empty localStorage) uses all defaults", async () => {
  const storage = new Map();
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: (key) => storage.get(key) ?? null },
  });
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    optimizeDeps: { noDiscovery: true },
  });
  let profile;
  try {
    ({ profile } = await server.ssrLoadModule("/src/storage.ts"));
  } finally {
    await server.close();
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
  assert.equal(profile.skin, 0);
  assert.equal(profile.unlocked, 4);
  assert.equal(profile.best, 0);
});
