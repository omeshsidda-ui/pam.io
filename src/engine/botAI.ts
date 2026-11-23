import { STEP, R, rand, SECTORS, angleDiff, SPEED, BOOST } from "../config";
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

const rushes = new WeakMap<Snake, { pellet: Pellet; until: number }>();
const attackAfter = new WeakMap<Snake, number>();

// Each responder approaches the part of the trail closest to its own head.
export function callScavengers(
  snakes: Snake[],
  drops: Pellet[],
  tick: number,
  skill: number,
) {
  const reach = 480 + 300 * skill;
  const candidates = [];
  for (const s of snakes) {
    if (!s.id || s.dead || s.boss) continue;
    let nearest: Pellet | undefined;
    let distance = reach;
    for (const p of drops) {
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < distance) {
        nearest = p;
        distance = d;
      }
    }
    if (nearest) {
      const priority = distance * (s.role === 1 || s.role === 4 ? 0.75 : 1);
      candidates.push({ s, nearest, priority });
    }
  }
  candidates.sort((a, b) => a.priority - b.priority);
  const count = Math.min(
    2 + Math.round(skill * 4),
    Math.ceil(drops.length / 5),
  );
  for (const { s, nearest } of candidates.slice(0, count)) {
    rushes.set(s, { pellet: nearest, until: tick + 150 });
    s.think = Math.min(s.think, 0.12);
  }
}

// Sample a reachable arc, including the distance travelled before a broad turn completes.
function safeSteps(
  s: Snake,
  aim: number,
  boosting: boolean,
  body: Grid<Segment>,
) {
  let { x, y, a } = s;
  const dt = 0.075;
  const turn = turnRate(s) * dt;
  const stride = SPEED * (boosting ? BOOST : 1) * dt;
  const radius = width(s);
  for (let step = 0; step < 5; step++) {
    a += Math.max(-turn, Math.min(turn, angleDiff(aim, a)));
    x += Math.cos(a) * stride;
    y += Math.sin(a) * stride;
    if (Math.hypot(x, y) > R - radius) return step;
    let blocked = false;
    body.near(x, y, radius + 50, (p) => {
      if (!blocked && p.s !== s && !p.s.dead)
        blocked =
          Math.hypot(x - p.x, y - p.y) < radius + width(p.s) + stride * 0.3;
    });
    if (blocked) return step;
  }
  return 5;
}

export function decide(
  s: Snake,
  food: Grid<Pellet>,
  body: Grid<Segment>,
  leader: Snake,
  skill = 0.4,
  tick = 0,
) {
  const open = new Float32Array(SECTORS).fill(220),
    value = new Float32Array(SECTORS);
  let goal = s.a,
    prey: Snake | undefined,
    bestCost = Infinity,
    attackBoost = false,
    loot = false;
  const rush = rushes.get(s);
  const drop =
    rush && tick < rush.until && rush.pellet.v > 0 ? rush.pellet : undefined;
  const vision = 320 + 160 * skill;
  body.near(s.x, s.y, vision, (p) => {
    if (p.s === s || p.s.dead) return;
    const dx = p.x - s.x,
      dy = p.y - s.y,
      d = Math.hypot(dx, dy),
      i = sector(Math.atan2(dy, dx));
    open[i] = Math.min(open[i], d);
    if (p.i !== 0 || s.boss || d > vision) return;
    if (drop || (p.s.id === 0 && tick < (attackAfter.get(s) ?? 0))) return;
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
  const leftPlayer = targets.get(s)?.id === 0 && prey?.id !== 0;
  if (prey) {
    targets.set(s, prey);
    if (!s.boss && s.role === 2) goal = coil(s, prey);
  } else {
    targets.delete(s);
    coils.delete(s);
  }
  if (drop) goal = Math.atan2(drop.y - s.y, drop.x - s.x);
  s.boost = drop
    ? s.mass >= 35
    : prey
      ? attackBoost
      : loot && (s.role === 1 || s.role === 4);
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
      margin =
        (s.role === 3 ? 135 : s.boost ? (s.boss ? 75 : 128) : 98) + skill * 28;
    const clear = Math.min(
      open[i],
      open[(i + SECTORS - 1) % SECTORS] + 28,
      open[(i + 1) % SECTORS] + 28,
    );
    const score =
      Math.min(0, clear - margin) * 0.14 +
      Math.cos(angleDiff(a, goal)) * (prey || drop ? 3.5 : 0.5) +
      Math.cos(a - s.a) * 0.6 +
      Math.min(value[i], 0.7) * (prey || drop ? 0.6 : 8) +
      Math.random() * 0.18;
    if (score > best) {
      best = score;
      // Keep a little variation for natural movement, while avoiding the
      // sector-to-sector aim jitter that becomes conspicuous on broad turns.
      s.aim = a + rand(-1, 1) * (0.035 - 0.02 * skill);
    }
  }
  if (s.boss && best < -3) s.boost = true;
  const abort =
    !s.boss &&
    (s.boost || prey || drop || best < -3) &&
    safeSteps(s, s.aim, s.boost, body) < 5;
  if (abort) {
    s.boost = false;
    let clearance = safeSteps(s, s.aim, false, body);
    for (const offset of [-Math.PI / 2, Math.PI / 2]) {
      const aim = s.a + offset;
      const steps = safeSteps(s, aim, false, body);
      if (steps > clearance) {
        clearance = steps;
        s.aim = aim;
      }
    }
    targets.delete(s);
  }
  if (leftPlayer || (abort && prey?.id === 0))
    attackAfter.set(s, tick + (3 - 2.4 * skill) / STEP);
  s.think = rand(0.18, 0.28) * (1 - 0.4 * skill);
}
