import { skins, STEP } from "../config";
import type { Snake, Segment, Pellet } from "../types";
import { Grid } from "../engine/spatialGrid";
import { decide } from "../engine/botAI";
import { move, width } from "../engine/physics";
import { orbs } from "./spriteCache";
const templates = [
  [0.21, 0.36, -0.36, 0, 370],
  [0.85, 0.35, 2.65, 4, 370],
  [0.23, 0.78, -0.76, 2, 275],
  [0.8, 0.76, -2.45, 3, 320],
  [0.52, 0.04, 0.2, 1, 210],
];
let w = 0,
  h = 0,
  acc = 0,
  last = 0;
const bots: Snake[] = [],
  food = new Grid<Pellet>(),
  segments = new Grid<Segment>();
const dots = Array.from({ length: 120 }, (_, i) => ({
  x: (i * 0.618034 + 0.08) % 1,
  y: (((Math.sin(i * 482.22) * 43758) % 1) + 1) % 1,
  c: (i * 7) % skins.length,
  r: 10 + (i % 12),
}));
export function lobby(
  c: CanvasRenderingContext2D,
  W: number,
  H: number,
  time: number,
  paint: (s: Snake, f: number) => void,
) {
  // Work in a fixed-size arena so skins keep their proportions on narrow screens.
  const scale = Math.min(W / 1120, H / 650, 1.45);
  c.save();
  c.scale(scale, scale);
  const vw = W / scale,
    vh = H / scale;
  if (vw !== w || vh !== h) {
    w = vw;
    h = vh;
    bots.length = 0;
    food.clear();
    for (const p of dots)
      food.add({ x: p.x * w, y: p.y * h, c: p.c, v: 2, loot: false });
    for (const [x, y, a, skin, mass] of templates) {
      const s: Snake = {
        x: x * w,
        y: y * h,
        a,
        aim: a,
        prevA: a,
        skin,
        mass,
        id: bots.length + 1,
        name: "",
        think: 1,
        role: 3,
        body: [],
        old: [],
        boost: false,
        dead: false,
        kills: 0,
        boss: false,
      };
      move(s);
      let px = s.x,
        py = s.y;
      for (let i = 0; i < s.body.length; i++) {
        s.body[i] = { x: px, y: py };
        s.old[i] = { x: px, y: py };
        const t = a + Math.sin(i * 0.09) * 1.18;
        px -= Math.cos(t) * width(s) * 0.64;
        py -= Math.sin(t) * width(s) * 0.64;
      }
      bots.push(s);
    }
  }
  acc += Math.min(0.06, time - last) * 0.34;
  last = time;
  while (acc >= STEP) {
    acc -= STEP;
    for (const s of bots) {
      if ((s.think -= STEP) <= 0) decide(s, food, segments, bots[0]);
      if (s.x < 55 || s.x > w - 55 || s.y < 55 || s.y > h - 55)
        s.aim = Math.atan2(h / 2 - s.y, w / 2 - s.x);
      s.boost = false;
      move(s);
    }
  }
  for (const p of dots)
    c.drawImage(orbs[p.c], p.x * w - p.r, p.y * h - p.r, p.r * 2, p.r * 2);
  for (const s of bots) paint(s, acc / STEP);
  c.restore();
}
