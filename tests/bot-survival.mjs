// Run with: BOT_SURVIVAL_REPORT=1 node --test tests/bot-survival.mjs
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function installGlobals(t) {
  const origWidth = Object.getOwnPropertyDescriptor(globalThis, "innerWidth");
  const origHeight = Object.getOwnPropertyDescriptor(globalThis, "innerHeight");
  const origStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  const store = new Map([
    [
      "pam.profile",
      JSON.stringify({
        skin: 0,
        best: 0,
        kills: 0,
        mute: true,
        recentDifficulty: 0.45,
      }),
    ],
  ]);

  Object.defineProperty(globalThis, "innerWidth", {
    configurable: true,
    writable: true,
    value: 1280,
  });
  Object.defineProperty(globalThis, "innerHeight", {
    configurable: true,
    writable: true,
    value: 720,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, String(v)),
    },
  });

  t.after(() => {
    if (origWidth) Object.defineProperty(globalThis, "innerWidth", origWidth);
    else delete globalThis.innerWidth;
    if (origHeight) Object.defineProperty(globalThis, "innerHeight", origHeight);
    else delete globalThis.innerHeight;
    if (origStorage)
      Object.defineProperty(globalThis, "localStorage", origStorage);
    else delete globalThis.localStorage;
  });
}

function patchRandom(t, seed) {
  const origRandom = Math.random;
  Math.random = mulberry32(seed);
  t.after(() => {
    Math.random = origRandom;
  });
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true },
});
after(() => server.close());

const SEEDS = [11, 23, 37, 53, 71];
const TICKS_60S = 3600;

test("passive cruising player: bots avoid casual self-destruction", async (t) => {
  installGlobals(t);
  const { World } = await server.ssrLoadModule("/src/engine/world.ts");
  const { move } = await server.ssrLoadModule("/src/engine/physics.ts");
  const { STEP, R } = await server.ssrLoadModule("/src/config.ts");
  const { profile } = await server.ssrLoadModule("/src/storage.ts");

  let totalAccidentalKills = 0;
  let totalWallDeaths = 0;
  let totalBotVsBotDeaths = 0;
  let totalPlayerDeaths = 0;
  let massSamples = 0;
  let massSum = 0;
  let lifeTicksSum = 0;
  let lifeCount = 0;

  const perSeed = [];

  for (const seed of SEEDS) {
    const origRandom = Math.random;
    Math.random = mulberry32(seed);
    try {
      profile.recentDifficulty = 0.45;
      profile.mute = true;
      profile.kills = 0;

      const world = new World(false);
      let accidentalKills = 0;
      let wallDeaths = 0;
      let botVsBotDeaths = 0;
      let playerDied = 0;
      const bornAt = new Map();
      for (const s of world.snakes) {
        if (s.id) bornAt.set(s, 0);
      }

      const origSpawn = world.spawn.bind(world);
      world.spawn = (id, boss = false) => {
        const s = origSpawn(id, boss);
        if (s && s.id) bornAt.set(s, world.tick);
        return s;
      };

      const origDie = world.die.bind(world);
      world.die = (s, k) => {
        if (!s.dead) {
          if (s === world.player) {
            playerDied++;
            // Keep the passive cruising player in the arena for the full 60s
            // so accidental bot deaths into the player are measured over 5 full minutes.
            s.x = 900 * Math.sin(world.tick * STEP * 0.22);
            s.y = 550 * Math.sin(world.tick * STEP * 0.44);
            s.mass = 65;
            s.boost = false;
            s.body.length = 0;
            s.old.length = 0;
            move(s);
            world.indexBodies();
            return;
          } else {
            const start = bornAt.get(s) ?? 0;
            lifeTicksSum += world.tick - start;
            lifeCount++;
            if (k === world.player) accidentalKills++;
            else if (k === undefined) wallDeaths++;
            else botVsBotDeaths++;
          }
        }
        return origDie(s, k);
      };

      for (let tick = 0; tick < TICKS_60S; tick++) {
        const simT = tick * STEP;
        // Smooth figure-eight cruise path well inside r <= 1200 (max ~1055 px).
        const targetX = 900 * Math.sin(simT * 0.22);
        const targetY = 550 * Math.sin(simT * 0.44);
        if (!world.player.dead) {
          world.player.boost = false;
          world.player.aim = Math.atan2(
            targetY - world.player.y,
            targetX - world.player.x,
          );
          assert.ok(
            Math.hypot(world.player.x, world.player.y) <= R,
            "player stays inside arena",
          );
        }
        world.update();

        if (tick % 60 === 59) {
          for (const s of world.snakes) {
            if (s.id && !s.dead) {
              massSum += s.mass;
              massSamples++;
            }
          }
        }
      }

      for (const s of world.snakes) {
        if (s.id && !s.dead) {
          const start = bornAt.get(s) ?? 0;
          lifeTicksSum += TICKS_60S - start;
          lifeCount++;
        }
      }

      totalAccidentalKills += accidentalKills;
      totalWallDeaths += wallDeaths;
      totalBotVsBotDeaths += botVsBotDeaths;
      totalPlayerDeaths += playerDied;
      perSeed.push({
        seed,
        accidentalKills,
        wallDeaths,
        botVsBotDeaths,
        playerDied,
      });
    } finally {
      Math.random = origRandom;
    }
  }

  const totalMinutes = SEEDS.length;
  const meanAccidentalPerMin = totalAccidentalKills / totalMinutes;
  const meanBotAndWallPerMin =
    (totalWallDeaths + totalBotVsBotDeaths) / totalMinutes;
  const meanWallPerMin = totalWallDeaths / totalMinutes;
  const meanBotMass = massSamples ? massSum / massSamples : 0;
  const meanBotSurvivalSec = lifeCount ? (lifeTicksSum / lifeCount) * STEP : 0;

  if (process.env.BOT_SURVIVAL_REPORT === "1") {
    console.info(
      JSON.stringify(
        {
          scenario: "passive-cruising-player",
          seeds: SEEDS,
          simulatedMinutes: totalMinutes,
          totalAccidentalKills,
          meanAccidentalPerMin: Number(meanAccidentalPerMin.toFixed(2)),
          totalWallDeaths,
          meanWallPerMin: Number(meanWallPerMin.toFixed(2)),
          totalBotVsBotDeaths,
          meanBotAndWallPerMin: Number(meanBotAndWallPerMin.toFixed(2)),
          totalPlayerDeaths,
          meanBotMass: Number(meanBotMass.toFixed(1)),
          meanBotSurvivalSec: Number(meanBotSurvivalSec.toFixed(2)),
          perSeed,
        },
        null,
        2,
      ),
    );
  }

  assert.ok(
    totalAccidentalKills <= 3,
    `Expected <= 3 accidental bot deaths into passive player across 5 seeds, got ${totalAccidentalKills}`,
  );
  assert.ok(
    meanWallPerMin <= 2,
    `Expected <= 2 bot wall deaths per 60s on average, got ${meanWallPerMin.toFixed(2)}`,
  );
});

test("close-pass gentle weave: nearby bot avoids cruising non-boosting player", async (t) => {
  installGlobals(t);
  patchRandom(t, 101);

  const { World } = await server.ssrLoadModule("/src/engine/world.ts");
  const { move } = await server.ssrLoadModule("/src/engine/physics.ts");
  const { profile } = await server.ssrLoadModule("/src/storage.ts");
  profile.recentDifficulty = 0.45;
  profile.mute = true;

  const world = new World(false);
  // Keep only player and one ordinary bot near the center for a clean encounter.
  const bot = world.snakes.find((s) => s.id === 1);
  assert.ok(bot, "bot 1 exists");
  for (const s of world.snakes) {
    if (s !== world.player && s !== bot) s.dead = true;
  }

  function placeStraight(snake, x, y, a, mass) {
    snake.x = x;
    snake.y = y;
    snake.a = a;
    snake.prevA = a;
    snake.aim = a;
    snake.mass = mass;
    snake.boost = false;
    snake.dead = false;
    snake.body.length = 0;
    snake.old.length = 0;
    move(snake);
    for (let i = 0; i < snake.body.length; i++) {
      const px = x - Math.cos(a) * i * 7;
      const py = y - Math.sin(a) * i * 7;
      snake.body[i].x = px;
      snake.body[i].y = py;
      snake.old[i].x = px;
      snake.old[i].y = py;
    }
  }

  placeStraight(world.player, 0, 0, 0, 260);
  // Bot approaching at a gentle converging angle toward a loot pellet just past the player's body.
  placeStraight(bot, -10, -135, 0.55, 110);
  bot.role = 3;
  bot.think = 0;
  world.food.push({ x: 60, y: 55, v: 6, c: 0, loot: true });
  world.index();

  for (let tick = 0; tick < 180; tick++) {
    world.player.boost = false;
    world.player.aim = 0.08 * Math.sin(tick * 0.05);
    world.update();
  }

  if (process.env.BOT_SURVIVAL_REPORT === "1") {
    console.info(
      JSON.stringify({
        scenario: "close-pass-gentle-weave",
        botDead: bot.dead,
        playerDead: world.player.dead,
        playerKills: world.player.kills,
      }),
    );
  }

  assert.equal(bot.dead, false, "bot should avoid running into cruising player");
  assert.equal(world.player.dead, false, "cruising player should remain alive");
});

test("intentional player boost-cutoff: crisp cutoff still scores a kill", async (t) => {
  installGlobals(t);
  patchRandom(t, 202);

  const { World } = await server.ssrLoadModule("/src/engine/world.ts");
  const { move } = await server.ssrLoadModule("/src/engine/physics.ts");
  const { profile } = await server.ssrLoadModule("/src/storage.ts");
  profile.recentDifficulty = 0.45;
  profile.mute = true;

  const world = new World(false);
  const bot = world.snakes.find((s) => s.id === 1);
  assert.ok(bot, "bot 1 exists");
  for (const s of world.snakes) {
    if (s !== world.player && s !== bot) s.dead = true;
  }

  function placeStraight(snake, x, y, a, mass) {
    snake.x = x;
    snake.y = y;
    snake.a = a;
    snake.prevA = a;
    snake.aim = a;
    snake.mass = mass;
    snake.boost = false;
    snake.dead = false;
    snake.body.length = 0;
    snake.old.length = 0;
    move(snake);
    for (let i = 0; i < snake.body.length; i++) {
      const px = x - Math.cos(a) * i * 7;
      const py = y - Math.sin(a) * i * 7;
      snake.body[i].x = px;
      snake.body[i].y = py;
      snake.old[i].x = px;
      snake.old[i].y = py;
    }
  }

  // Bot cruising straight east; player ahead-sideways boosting perpendicularly across its path.
  placeStraight(bot, 0, 0, 0, 100);
  bot.role = 3;
  bot.think = 0.2;
  placeStraight(world.player, 120, -90, Math.PI / 2, 160);
  world.player.boost = true;
  world.indexBodies();

  for (let tick = 0; tick < 90 && !bot.dead; tick++) {
    world.player.aim = Math.PI / 2;
    world.player.boost = true;
    world.update();
  }

  if (process.env.BOT_SURVIVAL_REPORT === "1") {
    console.info(
      JSON.stringify({
        scenario: "intentional-boost-cutoff",
        botDead: bot.dead,
        playerKills: world.player.kills,
      }),
    );
  }

  assert.ok(
    world.player.kills >= 1,
    `Expected player boost cutoff to kill bot, got kills=${world.player.kills}`,
  );
});
