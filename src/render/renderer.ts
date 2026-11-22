import { R, angleDiff } from "../config";
import type { World } from "../engine/world";
import type { Snake } from "../types";
import { width } from "../engine/physics";
import { beads, orbs, crown, face, shadow } from "./spriteCache";
import { lobby } from "./lobby";
const canvas = document.querySelector<HTMLCanvasElement>("#arena")!,
  c = canvas.getContext("2d")!;
const tile = document.createElement("canvas");
tile.width = 288;
tile.height = 166;
const t = tile.getContext("2d")!;
t.strokeStyle = "#35506b70";
t.lineWidth = 1.6;
for (let j = -1; j < 3; j++)
  for (let i = -1; i < 5; i++) {
    const x = i * 72,
      y = j * 83 + (i % 2) * 41.5;
    t.beginPath();
    for (let k = 0; k <= 6; k++) {
      const a = (k * Math.PI) / 3;
      t.lineTo(x + 48 * Math.cos(a), y + 48 * Math.sin(a));
    }
    t.fillStyle = (i + j) % 3 === 0 ? "#1b3046" : "#192c41";
    t.fill();
    t.stroke();
  }
const pattern = c.createPattern(tile, "repeat")!;
pattern.setTransform(new DOMMatrix().scale(0.5));
let zoom = 1,
  cx = 0,
  cy = 0,
  left = 0,
  right = 0,
  top = 0,
  bottom = 0;
function visible(x: number, y: number) {
  return x > left - 70 && x < right + 70 && y > top - 70 && y < bottom + 70;
}
function snake(s: Snake, f: number, leader = false, demo = false) {
  const r = width(s),
    n = s.body.length;
  for (let pass = 0; pass < 2; pass++) {
    let tailX = 0,
      tailY = 0;
    for (let i = n - 1; i >= 0; i--) {
      const p = s.body[i],
        o = s.old[i],
        x = o.x + (p.x - o.x) * f,
        y = o.y + (p.y - o.y) * f;
      const rr =
        r * (0.16 + 0.84 * Math.sin((Math.min(1, (n - i) / 10) * Math.PI) / 2));
      if (demo || visible(x, y)) {
        if (pass === 0) {
          if (s.boost)
            c.drawImage(
              orbs[s.skin],
              x - rr * 2.3,
              y - rr * 2.3,
              rr * 4.6,
              rr * 4.6,
            );
          if (i % 2 === 0)
            c.drawImage(
              shadow,
              x - rr * 1.4,
              y - rr * 0.96,
              rr * 2.8,
              rr * 2.8,
            );
        } else {
          const img = beads[s.skin][Math.floor(i / 4) % 2];
          if (i < n - 1)
            c.drawImage(
              img,
              (x + tailX) / 2 - rr,
              (y + tailY) / 2 - rr,
              2 * rr,
              2 * rr,
            );
          c.drawImage(img, x - rr, y - rr, 2 * rr, 2 * rr);
          if (!i) {
            face(
              c,
              x,
              y,
              s.prevA + angleDiff(s.a, s.prevA) * f,
              r,
              s.skin,
              angleDiff(s.aim, s.a),
            );
            c.textAlign = "center";
            c.font = "600 12px Arial";
            c.fillStyle = "#e9f1fa";
            c.fillText(s.name, x, y - r - 9);
            if (leader)
              c.drawImage(crown, x - 15, y - r - (demo ? 31 : 48), 30, 30);
          }
        }
      }
      tailX = x;
      tailY = y;
    }
  }
}
export function draw(world: World, live: boolean, f: number, time: number) {
  const w = innerWidth,
    h = innerHeight,
    dpr = Math.min(devicePixelRatio || 1, 2),
    pw = Math.round(w * dpr),
    ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.imageSmoothingQuality = "high";
  c.save();
  if (live) {
    const s = world.player;
    zoom +=
      (Math.max(
        0.53,
        (Math.min(w, h) < 600 ? 0.79 : 1.08) - Math.log1p(s.mass / 200) * 0.16,
      ) -
        zoom) *
      0.035;
    cx = s.old[0].x + (s.x - s.old[0].x) * f;
    cy = s.old[0].y + (s.y - s.old[0].y) * f;
    c.translate(
      w / 2 + (Math.random() - 0.5) * world.shake,
      h / 2 + (Math.random() - 0.5) * world.shake,
    );
    c.scale(zoom, zoom);
    c.translate(-cx, -cy);
  }
  left = live ? cx - w / (2 * zoom) : 0;
  top = live ? cy - h / (2 * zoom) : 0;
  right = left + (live ? w / zoom : w);
  bottom = top + (live ? h / zoom : h);
  c.fillStyle = pattern;
  c.fillRect(left - 12, top - 12, right - left + 24, bottom - top + 24);
  if (!live) {
    lobby(c, w, h, time, (s, alpha) => snake(s, alpha, s.id === 1, true));
    c.restore();
    return;
  }
  c.beginPath();
  c.arc(0, 0, R, 0, 7);
  c.strokeStyle = "#ff4558";
  c.lineWidth = 12;
  c.stroke();
  for (const p of world.food) {
    if (!visible(p.x, p.y)) continue;
    const r = p.loot ? 25 + 3 * Math.sin(time * 5 + p.x) : 18;
    c.drawImage(orbs[p.c], p.x - r, p.y - r, r * 2, r * 2);
  }
  const tr = world.trap;
  if (tr) {
    c.save();
    c.translate(tr.x, tr.y);
    c.fillStyle = "#ff424b28";
    c.strokeStyle = "white";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, 140, 0, 7);
    c.fill();
    c.stroke();
    c.fillStyle = "#ff465566";
    c.beginPath();
    c.moveTo(0, 0);
    c.arc(
      0,
      0,
      137,
      -Math.PI / 2,
      -Math.PI / 2 + (Math.PI * 2 * tr.charge) / 2.5,
    );
    c.closePath();
    c.fill();
    for (let i = 0; i < 4; i++) {
      c.rotate(Math.PI / 2);
      c.fillStyle = "white";
      c.fillRect(125, -2, 27, 4);
    }
    c.beginPath();
    c.arc(
      0,
      0,
      132,
      -Math.PI / 2,
      -Math.PI / 2 + (Math.PI * 2 * tr.charge) / 2.5,
    );
    c.strokeStyle = "#ff4759";
    c.lineWidth = 10;
    c.stroke();
    c.textAlign = "center";
    c.font = "bold 35px Arial";
    c.fillText("ϟ", 0, 0);
    c.font = "bold 13px Arial";
    c.fillText("CHARGING BOLT", 0, 24);
    c.restore();
  }
  const lead = world.ranking[0];
  for (const s of world.snakes) if (!s.dead) snake(s, f, s === lead);
  for (const p of world.particles) {
    if (!visible(p.x, p.y)) continue;
    c.fillStyle = p.color;
    c.globalAlpha = Math.min(1, p.life * 2);
    if (p.label) c.fillText(p.label, p.x, p.y);
    else c.fillRect(p.x, p.y, 4, 4);
  }
  c.restore();
  if (lead && lead !== world.player) {
    const dx = (lead.x - cx) * zoom,
      dy = (lead.y - cy) * zoom,
      k = Math.min(
        (w / 2 - 30) / Math.max(1, Math.abs(dx)),
        (h / 2 - 33) / Math.max(1, Math.abs(dy)),
      );
    if (k < 1) {
      c.save();
      c.translate(w / 2 + dx * k, h / 2 + dy * k);
      c.drawImage(crown, -12, -12, 24, 24);
      c.rotate(Math.atan2(dy, dx));
      c.fillStyle = "#fff";
      c.beginPath();
      c.moveTo(22, 0);
      c.lineTo(15, -4);
      c.lineTo(15, 4);
      c.fill();
      c.restore();
    }
  }
}
