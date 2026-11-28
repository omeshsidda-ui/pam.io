import {
  R,
  FOOD,
  BOTS,
  STEP,
  CHARGE_SECONDS,
  names,
  rand,
  skins,
} from "../config";
import { Difficulty } from "./difficulty";
import { playZoom } from "./camera";
import { Grid } from "./spatialGrid";
import { move, width } from "./physics";
import { avoidHazards, callScavengers, decide } from "./botAI";
import type { Snake, Pellet, Segment, Particle, Trap } from "../types";
import { sound } from "../audio/sfx";
import { profile, progress } from "../storage";
const spot = () => {
  const a = rand(0, 6.28),
    r = Math.sqrt(Math.random()) * (R - 140);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
};
export class World {
  snakes: Snake[] = [];
  food: Pellet[] = [];
  particles: Particle[] = [];
  pool: Particle[] = [];
  fg = new Grid<Pellet>();
  bg = new Grid<Segment>();
  player: Snake;
  tick = 0;
  trap?: Trap;
  bossAppeared = false;
  shake = 0;
  notice = "";
  noticeTime = 0;
  streak = 0;
  lastKill = -999;
  ranking: Snake[] = [];
  deathCause = "";
  waiting = new Set<number>();
  difficulty = new Difficulty(profile.recentDifficulty);
  cameraMass = 65;
  cameraZoom = playZoom(65, innerWidth, innerHeight);
  private nextBossAttempt = 0;
  constructor(readonly spectator = false) {
    this.player = this.spawn(0)!;
    for (let i = 1; i <= BOTS; i++) if (!this.spawn(i)) this.waiting.add(i);
    if (spectator) {
      // Keep the camera anchor out of collision, scoring, and respawn logic.
      this.snakes.shift();
      this.player.dead = true;
    }
    this.seedOpeningFood();
    while (this.food.length < FOOD) this.pellet();
    this.index();
    this.rank();
  }
  spawn(id: number, boss = false) {
    // A fresh bot starts curled inside this disk. Reserve the whole footprint,
    // including its nose and tail, before adding anything to the world.
    const radius = 101;
    const footprint = radius + 52;
    const heading = rand(0, 2 * Math.PI);
    // Zoom can ease between two values. Exclude the larger visible rectangle
    // plus room for interpolation, shake, and one frame of motion.
    const zoom = Math.min(
      this.cameraZoom,
      playZoom(this.player?.mass ?? 65, innerWidth, innerHeight),
    );
    const halfW = innerWidth / (2 * zoom) + footprint + 90,
      halfH = innerHeight / (2 * zoom) + footprint + 90;
    let p = { x: 0, y: 0 };
    if (id) {
      let safe = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        p = spot();
        if (Math.hypot(p.x, p.y) > R - footprint - 70) continue;
        const dx = p.x - this.player.x,
          dy = p.y - this.player.y;
        if (Math.hypot(dx, dy) < footprint + 440) continue;
        if (!this.spectator && Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) continue;
        if (
          this.snakes.some(
            (s) =>
              !s.dead &&
              s.body.some(
                (q, i) =>
                  i % 4 === 0 &&
                  Math.hypot(q.x - p.x, q.y - p.y) < footprint + width(s) * 3,
              ),
          )
        )
          continue;
        safe = true;
        break;
      }
      if (!safe) return undefined;
      // The sampled point is the coil's center, not its head.
      p.x += Math.sin(heading) * radius;
      p.y -= Math.cos(heading) * radius;
    }
    // Keep a handful of persistent competitors in the population. Returning
    // contenders must earn the last part of their climb on the field.
    const skill = this.difficulty.level;
    const contender = id > 0 && id % 8 === 0;
    let mass = id ? rand(55, this.tick ? 175 + 215 * skill : 600) : 65;
    if (contender) {
      mass = rand(670, 900) + skill * 360;
      if (this.tick)
        mass = Math.min(
          mass,
          Math.max(180, (this.ranking[0]?.mass ?? 600) * 0.78),
        );
    }
    const v = Math.random(),
      s: Snake = {
        ...p,
        id,
        name: boss
          ? "KING COBRA"
          : id
            ? names[(id - 1) % names.length]
            : profile.name || "Player",
        skin: id ? (id * 5) % skins.length : profile.skin,
        mass: boss ? 1500 : mass,
        a: heading,
        prevA: 0,
        aim: 0,
        boost: false,
        body: [],
        old: [],
        role: contender
          ? id % 16 === 0
            ? 3
            : 4
          : v < 0.2
            ? 0
            : v < 0.45
              ? 1
              : v < 0.6
                ? 2
                : v < 0.85
                  ? 3
                  : 4,
        think: 0,
        dead: false,
        kills: 0,
        boss,
      };
    s.aim = s.a;
    move(s);
    // A gentle coil keeps even the longest boss inside the reserved disk.
    const centerX = s.x - Math.sin(s.a) * radius,
      centerY = s.y + Math.cos(s.a) * radius;
    for (let i = 0; i < s.body.length; i++) {
      const angle = s.a - (i * width(s) * 0.64) / radius;
      const q = s.body[i];
      q.x = centerX + Math.sin(angle) * radius;
      q.y = centerY - Math.cos(angle) * radius;
      s.old[i].x = q.x;
      s.old[i].y = q.y;
    }
    this.bodiesChanged = true;
    this.snakes.push(s);
    return s;
  }
  private tryBossSpawn() {
    this.nextBossAttempt = this.tick + 30;
    return this.spawn(33, true);
  }
  private seedOpeningFood() {
    const player = this.player;
    // Three short arcs invite a turn in either direction. Keep gaps large
    // enough that collecting one trail requires actively following it.
    for (const offset of [-0.85, 0, 0.85]) {
      const direction = player.a + offset,
        bend = (offset || rand(-0.6, 0.6)) * 0.55;
      const color = Math.floor(rand(0, skins.length));
      for (let i = 0; i < 7; i++) {
        const radius = 105 + i * 34,
          angle = direction + (bend * i) / 6;
        this.pellet(
          {
            x: player.x + Math.cos(angle) * radius,
            y: player.y + Math.sin(angle) * radius,
          },
          color,
        );
      }
    }
    while (this.food.length < 120) {
      const angle = rand(0, Math.PI * 2),
        radius = Math.sqrt(rand(0.12, 1)) * 520;
      this.pellet({
        x: player.x + Math.cos(angle) * radius,
        y: player.y + Math.sin(angle) * radius,
      });
    }
  }
  pellet(point = spot(), color = Math.floor(rand(0, skins.length))) {
    this.food.push({ ...point, v: 2, c: color, loot: false });
  }
  private bodiesChanged = true;
  segments: Segment[] = [];
  index() {
    this.fg.clear();
    for (const p of this.food) this.fg.add(p);
    if (this.bodiesChanged) this.indexBodies();
  }
  indexBodies() {
    this.bodiesChanged = false;
    let n = 0;
    this.bg.clear();
    for (const s of this.snakes)
      if (!s.dead)
        s.body.forEach((p, i) => {
          if (i % 2 === 0) {
            const seg =
              this.segments[n] ?? (this.segments[n] = { x: 0, y: 0, s, i });
            n++;
            seg.x = p.x;
            seg.y = p.y;
            seg.s = s;
            seg.i = i;
            this.bg.add(seg);
          }
        });
  }
  rank() {
    const incumbent = this.ranking[0];
    this.ranking = this.snakes
      .filter((s) => !s.dead)
      .sort(
        (a, b) =>
          b.mass - a.mass ||
          Number(b === incumbent) - Number(a === incumbent) ||
          a.id - b.id,
      );
    const leader = this.ranking[0];
    if (leader && incumbent && leader !== incumbent && this.noticeTime <= 0) {
      this.notice = leader.name + " takes the crown";
      this.noticeTime = 1.5;
    }
  }
  fx(x: number, y: number, color: string, label = "") {
    const p = this.pool.pop() ?? ({} as Particle);
    Object.assign(p, {
      x,
      y,
      color,
      label,
      dx: rand(-70, 70),
      dy: label ? -44 : rand(-70, 70),
      life: 0.7,
    });
    this.particles.push(p);
  }
  die(s: Snake, k?: Snake) {
    if (s.dead) return;
    s.dead = true;
    this.bodiesChanged = true;
    const drops: Pellet[] = [];
    for (let i = 0; i < s.body.length; i += 2) {
      const p = s.body[i];
      drops.push({
        x: p.x + rand(-9, 9),
        y: p.y + rand(-9, 9),
        v: s.boss ? 18 : 6,
        c: s.skin,
        loot: true,
      });
    }
    this.food.push(...drops);
    callScavengers(this.snakes, drops, this.tick, this.difficulty.level);
    for (let i = 0; i < 18; i++) this.fx(s.x, s.y, skins[s.skin].primary);
    if (k) k.kills++;
    if (k === this.player) {
      profile.kills++;
      progress(k.mass);
      this.streak = this.tick - this.lastKill < 420 ? this.streak + 1 : 1;
      this.lastKill = this.tick;
      this.notice =
        ["", "ELIMINATION", "DOUBLE KILL", "TRIPLE KILL"][this.streak] ||
        "RAMPAGE";
      this.noticeTime = 2;
    }
    if (s === this.player || k === this.player) {
      this.shake = 12;
      sound("kill");
    }
  }
  resolveHits() {
    const deaths = new Map<Snake, Snake | undefined>();
    for (const s of this.snakes) {
      if (s.dead) continue;
      if (Math.hypot(s.x, s.y) > R - width(s)) {
        if (s === this.player) this.deathCause = "You hit the arena wall.";
        deaths.set(s, undefined);
        continue;
      }
      let nearest = Infinity,
        killer: Snake | undefined;
      let headOn = false;
      this.bg.near(s.x, s.y, 100, (p) => {
        if (p.s === s || p.s.dead) return;
        const r = width(s),
          other = width(p.s);
        const hx = Math.cos(s.a),
          hy = Math.sin(s.a),
          ox = Math.cos(p.s.a),
          oy = Math.sin(p.s.a);
        const dx = p.s.x - s.x,
          dy = p.s.y - s.y;
        const headContact = p.i === 0;
        let distance: number;
        if (headContact) {
          distance = Math.hypot(dx, dy);
          if (distance > (r + other) * 0.76) return;
          const closing = dx * hx + dy * hy,
            opposing = -(dx * ox + dy * oy);
          const duel =
            hx * ox + hy * oy < -0.55 && closing >= 0 && opposing >= 0;
          if (duel) {
            if (s.mass >= p.s.mass * 1.08) return;
          } else if (closing <= Math.max(0, opposing) + distance * 0.1) return;
        } else {
          // The front of the attacking head has to enter the actual body tube.
          const noseX = s.x + hx * r * 0.45,
            noseY = s.y + hy * r * 0.45;
          const q = p.s.body[p.i - 2],
            vx = q.x - p.x,
            vy = q.y - p.y;
          const t = Math.max(
            0,
            Math.min(
              1,
              ((noseX - p.x) * vx + (noseY - p.y) * vy) /
                (vx * vx + vy * vy || 1),
            ),
          );
          distance = Math.hypot(noseX - p.x - t * vx, noseY - p.y - t * vy);
          const taper =
            0.16 +
            0.84 *
              Math.sin(
                (Math.min(1, (p.s.body.length - p.i + 2 * t) / 10) * Math.PI) /
                  2,
              );
          if (distance > r * 0.44 + other * taper * 0.82) return;
          // The first link belongs to the facing contest for a genuine frontal hit.
          if (
            p.i === 2 &&
            hx * ox + hy * oy < -0.55 &&
            dx * hx + dy * hy >= 0 &&
            dx * ox + dy * oy <= 0
          )
            return;
        }
        if (
          distance < nearest ||
          (distance === nearest && p.s.id < (killer?.id ?? Infinity))
        ) {
          nearest = distance;
          killer = p.s;
          headOn = headContact && hx * ox + hy * oy < -0.55;
        }
      });
      if (killer) {
        deaths.set(s, killer);
        if (s === this.player)
          this.deathCause = headOn
            ? "Head-on collision with " + killer.name + "."
            : "You ran into " + killer.name + ".";
      }
    }
    // A snake hit on this tick can still be the cause of another snake's death.
    for (const [snake, killer] of deaths) this.die(snake, killer);
  }
  eat() {
    const claims = new Map<Pellet, { s: Snake; distance: number }>();
    for (const s of this.snakes) {
      if (s.dead) continue;
      this.fg.near(s.x, s.y, 55, (p) => {
        const distance = Math.hypot(s.x - p.x, s.y - p.y);
        if (distance >= 48) return;
        const prior = claims.get(p);
        if (
          !prior ||
          distance < prior.distance ||
          (distance === prior.distance && s.id < prior.s.id)
        )
          claims.set(p, { s, distance });
      });
    }
    for (const [p, { s, distance }] of claims) {
      if (distance < width(s) + 6) {
        s.mass += p.v;
        if (!s.id) {
          sound("eat");
          this.fx(s.x, s.y, "#ddff95", "+" + p.v);
        }
        p.v = 0;
      } else {
        p.previousX = p.x;
        p.previousY = p.y;
        p.movedAt = this.tick;
        p.x += (s.x - p.x) * 0.09;
        p.y += (s.y - p.y) * 0.09;
      }
    }
  }
  private replenishAmbientFood() {
    const ambient = this.food.reduce(
      (count, p) => count + Number(!p.loot && p.v === 2),
      0,
    );
    let missing = FOOD - ambient;
    if (missing <= 0) return;
    // Leave a margin for camera interpolation, shake, and movement toward the edge.
    const zoom = Math.min(
      this.cameraZoom,
      playZoom(this.player.mass, innerWidth, innerHeight),
    );
    const halfW = innerWidth / (2 * zoom) + 160;
    const halfH = innerHeight / (2 * zoom) + 160;
    // Carry any deficit forward if there is little unseen arena to sample.
    for (let attempt = 0; attempt < 96 && missing > 0; attempt++) {
      const point = spot();
      if (
        Math.abs(point.x - this.player.x) <= halfW &&
        Math.abs(point.y - this.player.y) <= halfH
      )
        continue;
      this.pellet(point);
      missing--;
    }
  }
  private compactDistantFood() {
    const halfW = innerWidth / (2 * this.cameraZoom) + 240;
    const halfH = innerHeight / (2 * this.cameraZoom) + 240;
    const piles = new Map<string, Pellet>();
    this.food = this.food.filter((p) => {
      if (
        Math.abs(p.x - this.player.x) < halfW &&
        Math.abs(p.y - this.player.y) < halfH
      )
        return true;
      if (!p.loot) return p.v !== 1; // Retire distant spent boost trails.
      const key = Math.floor(p.x / 48) + "," + Math.floor(p.y / 48);
      const pile = piles.get(key);
      if (pile) {
        pile.v += p.v;
        p.v = 0;
        return false;
      }
      piles.set(key, p);
      return true;
    });
  }
  update() {
    this.tick++;
    this.shake *= 0.9;
    this.noticeTime -= STEP;
    const leader = this.ranking[0] ?? this.player;
    for (const s of this.snakes) {
      if (s.dead || !s.id) continue;
      if ((s.think -= STEP) <= 0)
        decide(
          s,
          this.fg,
          this.bg,
          leader === s ? this.player : leader,
          this.difficulty.level,
          this.tick,
        );
      else if (!s.boss) avoidHazards(s, this.bg, undefined, this.tick);
    }
    for (const s of this.snakes) {
      if (s.dead) continue;
      move(s);
      if (s.boost && this.tick % 8 === 0) {
        s.mass--;
        const p = s.body.at(-1)!;
        this.food.push({ ...p, c: s.skin, loot: false, v: 1 });
        this.fx(p.x, p.y, skins[s.skin].primary);
      }
    }
    this.indexBodies();
    this.resolveHits();
    this.eat();
    this.food = this.food.filter((p) => p.v > 0);
    if (this.tick % 60 === 0 && this.food.length > 2000)
      this.compactDistantFood();
    if (this.tick % 30 === 0) this.replenishAmbientFood();
    for (const s of this.snakes.filter((s) => s.dead && s.id)) {
      this.snakes.splice(this.snakes.indexOf(s), 1);
      if (!s.boss) this.waiting.add(s.id);
    }
    if (this.tick % 15 === 0)
      for (const id of this.waiting)
        if (this.spawn(id)) this.waiting.delete(id);
    // Publish one shared standings snapshot. Retire a fallen king immediately.
    if (this.tick % 24 === 0 || this.ranking.some((s) => s.dead)) this.rank();
    if (!this.spectator && this.tick % 120 === 0)
      this.difficulty.sample(
        this.player,
        this.tick,
        this.ranking.indexOf(this.player) + 1,
        this.ranking.length,
        this.snakes.some(
          (s) =>
            s.id &&
            !s.dead &&
            Math.hypot(s.x - this.player.x, s.y - this.player.y) < 240,
        ),
      );
    if (
      !this.player.dead &&
      !this.bossAppeared &&
      (this.ranking[0] === this.player || this.player.mass >= 1500) &&
      this.tick >= this.nextBossAttempt &&
      this.tryBossSpawn()
    ) {
      this.bossAppeared = true;

      this.trap = {
        x: this.player.x * 0.85,
        y: this.player.y * 0.85,
        charge: 0,
      };
      this.notice = "KING COBRA INBOUND";
      this.noticeTime = 3;
      sound("boss");
    }
    if (this.trap) {
      const t = this.trap;
      t.charge =
        !this.player.dead &&
        Math.hypot(this.player.x - t.x, this.player.y - t.y) < 140
          ? t.charge + STEP
          : 0;
      const boss = this.snakes.find((s) => s.boss && !s.dead);
      if (!boss) this.trap = undefined;
      else if (t.charge + 1e-9 >= CHARGE_SECONDS) {
        this.die(boss, this.player);
        this.notice = "BOSS DEFEATED";
        this.noticeTime = 2;
        this.trap = undefined;
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.dx * STEP;
      p.y += p.dy * STEP;
      if ((p.life -= STEP) <= 0) this.pool.push(this.particles.splice(i, 1)[0]);
    }
    this.index();
  }
}
