import { R, rand, SECTORS, angleDiff, SPEED, BOOST } from "../config";
import type { Snake, Pellet, Segment } from "../types";
import type { Grid } from "./spatialGrid";
import { width, turnRate } from "./physics";

interface Coil {
  target: Snake;
  direction: number;
  radius: number;
  angle: number;
  x: number;
  y: number;
}
const coils = new WeakMap<Snake, Coil>();
const targets = new WeakMap<Snake, Snake>();
const TAU = Math.PI * 2;
const sector = (a: number) =>
  (Math.round((a * SECTORS) / TAU) + SECTORS) % SECTORS;

// Search future points on the rival's path. Budget time for both the turn
// and the run, so a rival directly behind the hunter is expensive to pursue.
function cutoff(s: Snake, target: Snake) {
  const vx = Math.cos(target.a),
    vy = Math.sin(target.a);
  const rivalSpeed = SPEED * (target.boost ? BOOST : 1),
    runSpeed = SPEED * BOOST;
  for (let t = 0.3; t <= 2.4; t += 0.15) {
    const lead = rivalSpeed * t + width(target) * 2;
    const x = target.x + vx * lead,
      y = target.y + vy * lead;
    if (Math.hypot(x, y) > R - 100) continue;
    const dx = x - s.x,
      dy = y - s.y,
      angle = Math.atan2(dy, dx);
    const turn = Math.abs(angleDiff(angle, s.a)) / turnRate(s);
    const arrival = Math.hypot(dx, dy) / runSpeed + turn * 0.65;
    if (arrival <= t)
      return { angle, cost: t + turn * 0.4, boost: arrival > 0.24 };
  }
}

function coil(s: Snake, target: Snake) {
  let state = coils.get(s);
  const base = Math.min(
    185,
    Math.max(112, (s.body.length * width(s) * 0.64) / TAU),
  );
  if (
    !state ||
    state.target !== target ||
    Math.hypot(target.x - state.x, target.y - state.y) > state.radius + 30
  ) {
    // Place the loop ahead of the rival, and approach it on the gentler tangent.
    const x = target.x + Math.cos(target.a) * base * 0.72,
      y = target.y + Math.sin(target.a) * base * 0.72;
    const angle = Math.atan2(s.y - y, s.x - x);
    const direction = angleDiff(s.a, angle) >= 0 ? 1 : -1;
    state = { target, x, y, radius: base, direction, angle };
    coils.set(s, state);
  }
  const dx = s.x - state.x,
    dy = s.y - state.y,
    d = Math.hypot(dx, dy),
    angle = Math.atan2(dy, dx);
  const advance = Math.max(0, angleDiff(angle, state.angle) * state.direction);
  state.angle = angle;
  if (Math.abs(d - state.radius) < 40)
    state.radius = Math.max(94, state.radius - advance * 3.6);
  const radial = Math.atan2(
    d - state.radius,
    Math.max(30, state.radius * 0.42),
  );
  return angle + state.direction * (Math.PI / 2 + radial);
}

export function decide(
  s: Snake,
  food: Grid<Pellet>,
  body: Grid<Segment>,
  leader: Snake,
  skill = 0.4,
) {
  const open = new Float32Array(SECTORS).fill(220),
    value = new Float32Array(SECTORS);
  let goal = s.a,
    prey: Snake | undefined,
    bestCost = Infinity,
    attackBoost = false,
    loot = false;
  const vision = 320 + 160 * skill;
  body.near(s.x, s.y, vision, (p) => {
    if (p.s === s || p.s.dead) return;
    const dx = p.x - s.x,
      dy = p.y - s.y,
      d = Math.hypot(dx, dy),
      i = sector(Math.atan2(dy, dx));
    open[i] = Math.min(open[i], d);
    if (p.i !== 0 || s.boss || d > vision) return;
    // A confident hunter can cut across a bigger rival from the side.
    // Keep head-on and tail-chase attempts restricted to smaller prey.
    const lateral = Math.abs(dx * Math.sin(p.s.a) - dy * Math.cos(p.s.a));
    const flank =
      skill > 0.48 && s.role === 0 && lateral > 85 && lateral > d * 0.55;
    if (!flank && p.s.mass >= s.mass * 0.92) return;
    let cost: number,
      aim = s.a,
      boost = false;
    if (s.role === 2) {
      if (s.mass < 240 || p.s.mass > s.mass * 0.72) return;
      cost = d / 220;
    } else if (s.role === 0 || s.role === 4) {
      const hit = cutoff(s, p.s);
      if (!hit || (s.role === 4 && hit.cost > 0.9 + skill * 0.9)) return;
      cost = hit.cost;
      aim = hit.angle;
      boost = hit.boost;
    } else return;
    if (targets.get(s) === p.s) cost -= 0.32;
    if (
      cost < bestCost ||
      (cost === bestCost && p.s.id < (prey?.id ?? Infinity))
    ) {
      prey = p.s;
      bestCost = cost;
      goal = aim;
      attackBoost = boost;
    }
  });
  food.near(s.x, s.y, 380, (p) => {
    const dx = p.x - s.x,
      dy = p.y - s.y,
      d = Math.hypot(dx, dy);
    value[sector(Math.atan2(dy, dx))] += p.v / (45 + d);
    if (p.loot && d < 260) loot = true;
  });
  if (s.boss) {
    prey = leader;
    goal = Math.atan2(
      leader.y + Math.sin(leader.a) * 115 - s.y,
      leader.x + Math.cos(leader.a) * 115 - s.x,
    );
    attackBoost = true;
  }
  if (prey) {
    targets.set(s, prey);
    if (!s.boss && s.role === 2) goal = coil(s, prey);
  } else {
    targets.delete(s);
    coils.delete(s);
  }
  s.boost = prey ? attackBoost : loot && (s.role === 1 || s.role === 4);
  const lookahead = 145 + skill * 70 + (s.boost ? 35 : 0);
  for (let i = 0; i < SECTORS; i++) {
    const a = (i * TAU) / SECTORS;
    if (
      Math.hypot(s.x + Math.cos(a) * lookahead, s.y + Math.sin(a) * lookahead) >
      R - 35
    )
      open[i] = 0;
  }
  let best = -Infinity;
  for (let i = 0; i < SECTORS; i++) {
    const a = (i * TAU) / SECTORS,
      margin = (s.role === 3 ? 135 : s.boost ? 75 : 98) + skill * 28;
    const clear = Math.min(
      open[i],
      open[(i + SECTORS - 1) % SECTORS] + 28,
      open[(i + 1) % SECTORS] + 28,
    );
    const score =
      Math.min(0, clear - margin) * 0.14 +
      Math.cos(angleDiff(a, goal)) * (prey ? 3.5 : 0.5) +
      Math.cos(a - s.a) * 0.6 +
      Math.min(value[i], 0.7) * (prey ? 0.6 : 8) +
      Math.random() * 0.18;
    if (score > best) {
      best = score;
      s.aim = a + rand(-1, 1) * (0.085 - 0.048 * skill);
    }
  }
  if (best < -3) s.boost = true;
  s.think = rand(0.18, 0.28) * (1 - 0.4 * skill);
}
