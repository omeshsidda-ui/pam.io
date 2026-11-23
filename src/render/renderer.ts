import { R, angleDiff, CHARGE_SECONDS } from "../config";
import type { World } from "../engine/world";
import type { Snake } from "../types";
import { playZoom, cameraEase, cameraShake } from "../engine/camera";
import { width } from "../engine/physics";
import {
  beads,
  orbs,
  crown,
  face,
  shadow,
  marking,
  boostWake,
  tail,
} from "./spriteCache";
import { lobby } from "./lobby";
const canvas = document.querySelector<HTMLCanvasElement>("#arena")!,
  c = canvas.getContext("2d")!;
function readColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (role: string) => style.getPropertyValue("--" + role).trim();
  return {
    field: get("field"),
    tile: get("tile"),
    grid: get("grid"),
    ink: get("ink"),
    muted: get("muted"),
    edge: get("edge"),
    paper: get("paper"),
    outside: get("outside"),
    danger: get("danger"),
    charge: get("charge"),
    gold: get("gold"),
  };
}
let colors = readColors();
// The floor is static artwork. Pan a separate composited layer rather than
// resampling a screen-sized Canvas pattern behind every animated frame.
const floor = document.createElement("div");
floor.id = "arena-floor";
floor.setAttribute("aria-hidden", "true");
canvas.before(floor);
let floorScale = 0,
  floorW = 0,
  floorH = 0;
function paintTile() {
  const tile = document.createElement("canvas");
  tile.width = 288;
  tile.height = 166;
  const t = tile.getContext("2d")!;
  t.strokeStyle = colors.grid;
  t.lineWidth = 1.1;
  for (let j = -1; j < 3; j++)
    for (let i = -1; i < 5; i++) {
      const x = i * 72,
        y = j * 83 + (i % 2) * 41.5;
      t.beginPath();
      for (let k = 0; k <= 6; k++) {
        const a = (k * Math.PI) / 3;
        t.lineTo(x + 48 * Math.cos(a), y + 48 * Math.sin(a));
      }
      t.fillStyle = (i + j) % 3 === 0 ? colors.tile : colors.field;
      t.fill();
      t.stroke();
    }
  floor.style.backgroundImage = "url(" + tile.toDataURL() + ")";
}
function placeFloor(
  w: number,
  h: number,
  scale: number,
  worldX: number,
  worldY: number,
) {
  if (
    w !== floorW ||
    h !== floorH ||
    scale / floorScale < 0.91 ||
    scale / floorScale > 1.1
  ) {
    floorW = w;
    floorH = h;
    floorScale = scale;
    floor.style.width = w * 1.12 + 288 * scale + "px";
    floor.style.height = h * 1.12 + 166 * scale + "px";
    floor.style.backgroundSize = 144 * scale + "px " + 83 * scale + "px";
  }
  const periodX = 144 * scale,
    periodY = 83 * scale;
  const x = (((worldX % periodX) + periodX) % periodX) - periodX;
  const y = (((worldY % periodY) + periodY) % periodY) - periodY;
  floor.style.transform =
    "translate3d(" + x + "px," + y + "px,0) scale(" + scale / floorScale + ")";
}
paintTile();
window.addEventListener("pam-theme", () => {
  colors = readColors();
  paintTile();
});
let zoom = 1,
  cx = 0,
  cy = 0,
  lastRenderTime = 0,
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
    for (let i = n - 1; i >= 0; i--) {
      const p = s.body[i],
        o = s.old[i],
        x = o.x + (p.x - o.x) * f,
        y = o.y + (p.y - o.y) * f;
      const rr =
        r * (0.16 + 0.84 * Math.sin((Math.min(1, (n - i) / 10) * Math.PI) / 2));
      if (demo || visible(x, y)) {
        if (pass === 0) {
          if (s.boost && i === 0) {
            c.save();
            c.translate(x, y);
            c.rotate(s.prevA + angleDiff(s.a, s.prevA) * f);
            c.drawImage(
              boostWake[s.skin],
              -r * 4.1,
              -r * 1.9,
              r * 4.6,
              r * 3.8,
            );
            c.restore();
          }
          if (i % 2 === 0)
            c.drawImage(
              shadow,
              x - rr * 1.4,
              y - rr * 0.96,
              rr * 2.8,
              rr * 2.8,
            );
        } else {
          if (i === n - 1 && i > 0) {
            const front = s.body[i - 1],
              prior = s.old[i - 1];
            tail(
              c,
              x,
              y,
              Math.atan2(
                prior.y + (front.y - prior.y) * f - y,
                prior.x + (front.x - prior.x) * f - x,
              ),
              r * 0.75,
              s.skin,
            );
          }
          const img = beads[s.skin][Math.floor(i / 4) % 2];
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
            c.fillStyle = colors.ink;
            c.fillText(s.name, x, y - r - 9);
            if (leader)
              c.drawImage(crown, x - 15, y - r - (demo ? 31 : 48), 30, 30);
          }
        }
      }
    }
  }
  for (let i = 4; i < n - 5; i += 5) {
    const p = s.body[i],
      o = s.old[i],
      x = o.x + (p.x - o.x) * f,
      y = o.y + (p.y - o.y) * f;
    if (!demo && !visible(x, y)) continue;
    const ahead = s.body[i - 1];
    marking(
      c,
      s.skin,
      x,
      y,
      Math.atan2(
        s.old[i - 1].y + (ahead.y - s.old[i - 1].y) * f - y,
        s.old[i - 1].x + (ahead.x - s.old[i - 1].x) * f - x,
      ),
      r * 0.87,
    );
  }
}
export function draw(
  world: World,
  live: boolean,
  f: number,
  time: number,
  pullback = 0,
) {
  const renderDt = lastRenderTime
    ? Math.max(0, Math.min(time - lastRenderTime, 0.08))
    : 1 / 60;
  lastRenderTime = time;
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
  c.clearRect(0, 0, w, h);
  c.imageSmoothingQuality = "low";
  let originX = 0,
    originY = 0;
  c.save();
  if (live) {
    const s = world.player;
    world.cameraZoom +=
      (playZoom(s.mass, w, h) - world.cameraZoom) * cameraEase(renderDt);
    const ease = pullback * pullback * (3 - 2 * pullback);
    zoom = world.cameraZoom * (1 - 0.25 * ease);
    if (s.dead) f = 1;
    cx = s.old[0].x + (s.x - s.old[0].x) * f;
    cy = s.old[0].y + (s.y - s.old[0].y) * f;
    const shake = cameraShake(time, world.shake);
    originX = w / 2 + shake.x - cx * zoom;
    originY = h / 2 + shake.y - cy * zoom;
    c.translate(w / 2 + shake.x, h / 2 + shake.y);
    c.scale(zoom, zoom);
    c.translate(-cx, -cy);
  }
  left = live ? cx - w / (2 * zoom) : 0;
  top = live ? cy - h / (2 * zoom) : 0;
  right = left + (live ? w / zoom : w);
  bottom = top + (live ? h / zoom : h);
  placeFloor(w, h, live ? zoom : 1, originX, originY);
  if (!live) {
    lobby(c, w, h, time, (s, alpha) => snake(s, alpha, s.id === 1, true));
    c.restore();
    return;
  }
  // Darken the out-of-bounds area and mark the approach before the lethal edge.
  if (
    Math.hypot(
      Math.max(Math.abs(left), Math.abs(right)),
      Math.max(Math.abs(top), Math.abs(bottom)),
    ) >=
    R - 110
  ) {
    c.beginPath();
    c.rect(left - 14, top - 14, right - left + 28, bottom - top + 28);
    c.arc(0, 0, R, 0, Math.PI * 2);
    c.fillStyle = colors.outside;
    c.fill("evenodd");
    c.beginPath();
    c.arc(0, 0, R - 46, 0, Math.PI * 2);
    c.lineWidth = 80;
    c.strokeStyle = colors.danger + "22";
    c.stroke();
    c.beginPath();
    c.arc(0, 0, R - 95, 0, Math.PI * 2);
    c.lineWidth = 3;
    c.strokeStyle = colors.danger + "99";
    c.setLineDash([14, 12]);
    c.stroke();
    c.setLineDash([]);
    c.beginPath();
    c.arc(0, 0, R, 0, 7);
    c.strokeStyle = colors.danger;
    c.lineWidth = 12;
    c.stroke();
  }
  for (const p of world.food) {
    if (!visible(p.x, p.y)) continue;
    const r = p.loot ? 25 + 3 * Math.sin(time * 5 + p.x) : 18;
    const blend = p.movedAt === world.tick ? 1 - f : 0;
    const x = p.x + ((p.previousX ?? p.x) - p.x) * blend,
      y = p.y + ((p.previousY ?? p.y) - p.y) * blend;
    c.drawImage(orbs[p.c], x - r, y - r, r * 2, r * 2);
  }
  const tr = world.trap;
  if (tr) {
    c.save();
    c.translate(tr.x, tr.y);
    c.fillStyle = colors.charge + "23";
    c.strokeStyle = colors.ink;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, 140, 0, 7);
    c.fill();
    c.stroke();
    c.fillStyle = colors.charge + "64";
    c.beginPath();
    c.moveTo(0, 0);
    c.arc(
      0,
      0,
      137,
      -Math.PI / 2,
      -Math.PI / 2 + (Math.PI * 2 * tr.charge) / CHARGE_SECONDS,
    );
    c.closePath();
    c.fill();
    for (let i = 0; i < 4; i++) {
      c.rotate(Math.PI / 2);
      c.fillStyle = colors.ink;
      c.fillRect(125, -2, 27, 4);
    }
    c.beginPath();
    c.arc(
      0,
      0,
      132,
      -Math.PI / 2,
      -Math.PI / 2 + (Math.PI * 2 * tr.charge) / CHARGE_SECONDS,
    );
    c.strokeStyle = colors.charge;
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
    if (p.life <= 0 || !visible(p.x, p.y)) continue;
    c.fillStyle = p.label ? colors.ink : p.color;
    c.globalAlpha = Math.min(1, p.life * 2);
    if (p.label) c.fillText(p.label, p.x, p.y);
    else c.fillRect(p.x, p.y, 4, 4);
  }
  c.restore();
  if (world.player.dead) return;
  const radius = h < 540 ? 29 : 42,
    mx = radius + 15,
    my = radius + 15;
  c.save();
  c.translate(mx, my);
  c.beginPath();
  c.arc(0, 0, radius, 0, Math.PI * 2);
  c.fillStyle = colors.paper + "ef";
  c.fill();
  c.strokeStyle = colors.danger;
  c.lineWidth = 1.5;
  c.stroke();
  for (const s of world.snakes) {
    if (s.dead || s === world.player || s === lead) continue;
    c.fillStyle = colors.muted;
    c.beginPath();
    c.arc((s.x / R) * radius, (s.y / R) * radius, 1.2, 0, 7);
    c.fill();
  }
  if (tr) {
    c.strokeStyle = colors.charge;
    c.beginPath();
    c.arc((tr.x / R) * radius, (tr.y / R) * radius, 3, 0, 7);
    c.stroke();
  }
  if (lead)
    c.drawImage(
      crown,
      (lead.x / R) * radius - 5,
      (lead.y / R) * radius - 6,
      10,
      10,
    );
  c.fillStyle = colors.ink;
  c.beginPath();
  c.arc((cx / R) * radius, (cy / R) * radius, 3, 0, 7);
  c.fill();
  c.restore();
  if (Math.hypot(cx, cy) > R - 330) {
    c.textAlign = "center";
    c.font = "bold 13px Arial";
    c.fillStyle = colors.danger;
    c.fillText("ARENA EDGE", w / 2, h - 24);
  }
  function marker(x: number, y: number, bolt: boolean, label: string) {
    if (x >= left && x <= right && y >= top && y <= bottom) return;
    const angle = Math.atan2(y - cy, x - cx),
      ux = Math.cos(angle),
      uy = Math.sin(angle);
    const k = Math.min(
      (w / 2 - (bolt ? 44 : 66)) / Math.max(0.001, Math.abs(ux)),
      (h / 2 - (bolt ? 94 : 63)) / Math.max(0.001, Math.abs(uy)),
    );
    let screenX = w / 2 + ux * k,
      screenY = h / 2 + uy * k;
    // Keep guides readable beside the leaderboard and above touch controls.
    if (screenX > w - 215 && screenY < (h < 540 ? 180 : 320)) screenX = w - 215;
    if (screenY > h - 112 && (screenX < 124 || screenX > w - 124))
      screenY = h - 112;
    c.save();
    c.translate(screenX, screenY);
    c.fillStyle = colors.paper;
    c.beginPath();
    c.arc(0, 0, 15, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = bolt ? colors.charge : colors.gold;
    if (bolt) {
      c.font = "bold 20px Arial";
      c.textAlign = "center";
      c.fillText("ϟ", 0, 7);
    } else {
      c.drawImage(crown, -13, -13, 26, 26);
      c.textAlign = "center";
      c.font = "bold 11px Arial";
      c.strokeStyle = colors.paper;
      c.lineWidth = 3;
      c.strokeText(label, 0, 28);
      c.fillText(label, 0, 28);
    }
    c.rotate(
      Math.atan2(
        (y - cy) * zoom + h / 2 - screenY,
        (x - cx) * zoom + w / 2 - screenX,
      ),
    );
    c.beginPath();
    c.moveTo(24, 0);
    c.lineTo(16, -4);
    c.lineTo(16, 4);
    c.fill();
    c.restore();
  }
  if (lead && lead !== world.player) marker(lead.x, lead.y, false, lead.name);
  if (tr) marker(tr.x, tr.y, true, "");
}
