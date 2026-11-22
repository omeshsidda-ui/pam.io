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
import { Grid } from "./spatialGrid";
import { move, width } from "./physics";
import { decide } from "./botAI";
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
  constructor() {
    this.player = this.spawn(0);
    for (let i = 1; i <= BOTS; i++) this.spawn(i);
    while (this.food.length < FOOD) this.pellet();
    this.index();
    this.rank();
  }
  spawn(id: number, boss = false) {
    let p = spot();
    if (!id) p = { x: 0, y: 0 };
    else
      for (
        let i = 0;
        i < 80 &&
        (Math.hypot(p.x - this.player.x, p.y - this.player.y) <
          Math.min(1800, innerWidth * 0.65 + 220) ||
          this.snakes.some((s) => Math.hypot(s.x - p.x, s.y - p.y) < 330));
        i++
      )
        p = spot();
    const v = Math.random(),
      s: Snake = {
        ...p,
        id,
        name: boss
          ? "KING COBRA"
          : id
            ? names[(id - 1) % names.length]
            : profile.name || "Player",
        skin: id ? (id * 5) % 12 : profile.skin,
        mass: boss ? 1500 : id ? rand(55, 720) : 65,
        a: rand(0, 6.28),
        prevA: 0,
        aim: 0,
        boost: false,
        body: [],
        old: [],
        role: v < 0.2 ? 0 : v < 0.45 ? 1 : v < 0.6 ? 2 : v < 0.85 ? 3 : 4,
        think: 0,
        dead: false,
        kills: 0,
        boss,
      };
    s.aim = s.a;
    move(s);
    for (let i = 1; i < s.body.length; i++) {
      s.body[i].x = s.x - i * Math.cos(s.a) * width(s) * 0.64;
      s.body[i].y = s.y - i * Math.sin(s.a) * width(s) * 0.64;
    }
    this.snakes.push(s);
    return s;
  }
  pellet() {
    this.food.push({
      ...spot(),
      v: 2,
      c: Math.floor(rand(0, 12)),
      loot: false,
    });
  }
  segments: Segment[] = [];
  index() {
    this.fg.clear();
    for (const p of this.food) this.fg.add(p);
    this.indexBodies();
  }
  indexBodies() {
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
    this.ranking = this.snakes
      .filter((s) => !s.dead)
      .sort((a, b) => b.mass - a.mass);
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
    for (let i = 0; i < s.body.length; i += 2) {
      const p = s.body[i];
      this.food.push({
        x: p.x + rand(-9, 9),
        y: p.y + rand(-9, 9),
        v: s.boss ? 18 : 6,
        c: s.skin,
        loot: true,
      });
    }
    for (let i = 0; i < 18; i++) this.fx(s.x, s.y, skins[s.skin][1]);
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
        deaths.set(s, undefined);
        continue;
      }
      let nearest = Infinity,
        killer: Snake | undefined;
      this.bg.near(s.x, s.y, 85, (p) => {
        if (p.s === s || p.s.dead || (p.i > 0 && p.i <= 3)) return;
        const distance = Math.hypot(p.x - s.x, p.y - s.y);
        if (distance > (width(s) + width(p.s)) * 0.78) return;
        if (p.i === 0 && s.mass >= p.s.mass * 1.08) return;
        if (
          distance < nearest ||
          (distance === nearest && p.s.id < (killer?.id ?? Infinity))
        ) {
          nearest = distance;
          killer = p.s;
        }
      });
      if (killer) deaths.set(s, killer);
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
        p.x += (s.x - p.x) * 0.09;
        p.y += (s.y - p.y) * 0.09;
      }
    }
  }
  update() {
    this.tick++;
    this.shake *= 0.9;
    this.noticeTime -= STEP;
    const leader = this.ranking[0] ?? this.player;
    for (const s of this.snakes)
      if (!s.dead && s.id && (s.think -= STEP) <= 0)
        decide(s, this.fg, this.bg, leader === s ? this.player : leader);
    for (const s of this.snakes) {
      if (s.dead) continue;
      move(s);
      if (s.boost && this.tick % 8 === 0) {
        s.mass--;
        const p = s.body.at(-1)!;
        this.food.push({ ...p, c: s.skin, loot: false, v: 1 });
        this.fx(p.x, p.y, skins[s.skin][1]);
      }
    }
    this.indexBodies();
    this.resolveHits();
    this.eat();
    this.food = this.food.filter((p) => p.v > 0);
    if (this.tick % 60 === 0 && this.food.length > 2000)
      this.food.splice(0, this.food.length - 2000);
    if (this.tick % 30 === 0) {
      let ambient = this.food.reduce(
        (n, p) => n + Number(!p.loot && p.v === 2),
        0,
      );
      while (ambient++ < FOOD) this.pellet();
    }
    for (const s of this.snakes.filter((s) => s.dead && s.id)) {
      this.snakes.splice(this.snakes.indexOf(s), 1);
      if (!s.boss) this.spawn(s.id);
    }
    this.rank();
    if (
      !this.player.dead &&
      !this.bossAppeared &&
      (this.ranking[0] === this.player || this.player.mass >= 1500)
    ) {
      this.bossAppeared = true;
      this.spawn(33, true);
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
        !this.player.dead && Math.hypot(this.player.x - t.x, this.player.y - t.y) < 140
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
