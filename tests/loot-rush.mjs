// Run with node --test tests/loot-rush.mjs
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
});
after(() => server.close());
const { callScavengers, decide } = await server.ssrLoadModule(
  "/src/engine/botAI.ts",
);
const { Grid } = await server.ssrLoadModule("/src/engine/spatialGrid.ts");

function encounter(skill, wall = false, tick = 1) {
  const bots = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    x: -410,
    y: i * 2,
    a: 0,
    aim: 0,
    role: 3,
    mass: 100,
    think: 1,
    boost: false,
    dead: false,
    boss: false,
  }));
  const body = new Grid();
  if (wall) {
    for (let y = -180; y <= 180; y += 12)
      body.add({ x: -336, y, i: 2, s: { mass: 300, dead: false } });
  }
  const drops = Array.from({ length: 35 }, (_, y) => ({
    x: 0,
    y,
    v: 6,
    loot: true,
  }));
  const food = new Grid();
  for (const drop of drops) food.add(drop);
  callScavengers(bots, drops, 0, skill);
  for (const bot of bots) decide(bot, food, body, bots[0], skill, tick);
  return bots.filter((bot) => bot.boost).length;
}

test("a large accessible drop draws a local rush scaled to difficulty", () => {
  assert.equal(encounter(0), 2);
  assert.equal(encounter(1), 6);
});
test("a body across the approach breaks the charge", () => {
  assert.equal(encounter(1, true), 0);
});
test("the invitation expires even if the food is still present", () => {
  assert.equal(encounter(1, false, 151), 0);
});
