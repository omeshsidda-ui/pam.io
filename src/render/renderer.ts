import { R, STEP, angleDiff, CHARGE_SECONDS } from "../config";
import type { World } from "../engine/world";
import type { Snake } from "../types";
import {
  playZoom,
  framingMass,
  cameraEase,
  cameraShake,
} from "../engine/camera";
import { width } from "../engine/physics";
import {
  beads,
  atSize,
  orbs,
  crown,
  face,
  shadow,
  marking,
  boostWake,
} from "./spriteCache";
import { ArenaResolution } from "./resolution";

const canvas = document.querySelector<HTMLCanvasElement>("#arena")!,
  c = canvas.getContext("2d", { desynchronized: true, alpha: false })!;
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
const resolution = new ArenaResolution();
let colors = readColors();
const tile = document.createElement("canvas");
const stamp = document.createElement("canvas");
let pattern: CanvasPattern | null = null;

function paintTile() {
  tile.width = 288 * 4;
  tile.height = 166 * 4;
  const t = tile.getContext("2d")!;
  t.scale(4, 4);
  t.fillStyle = colors.field;
  t.fillRect(0, 0, 288, 166);
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
  pattern = null;
}

function drawFloor(w: number, h: number, scale: number, x: number, y: number) {
  // Cache a single repeat near its final pixel size. The opaque fill also
  // erases the previous frame without a separate full-screen clear.
  const periodX = 144 * scale,
    periodY = 83 * scale;
  const sw = Math.max(1, Math.round((periodX * canvas.width) / w));
  const sh = Math.max(1, Math.round((periodY * canvas.height) / h));
  if (!pattern || stamp.width !== sw || stamp.height !== sh) {
    stamp.width = sw;
    stamp.height = sh;
    const brush = stamp.getContext("2d", { alpha: false })!;
    brush.imageSmoothingQuality = "high";
    brush.drawImage(tile, 0, 0, sw, sh);
    pattern = c.createPattern(stamp, "repeat")!;
  }
  // Anchor subpixel rounding at the camera center so the floor follows the
  // player through a zoom. Integer bitmap offsets avoid filtering every pixel.
  const tx = Math.round(
    (((x - w / 2) % periodX) * sw) / periodX + canvas.width / 2,
  );
  const ty = Math.round(
    (((y - h / 2) % periodY) * sh) / periodY + canvas.height / 2,
  );
  c.save();
  c.setTransform(1, 0, 0, 1, tx, ty);
  c.fillStyle = pattern;
  c.fillRect(-tx, -ty, canvas.width, canvas.height);
  c.restore();
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
function snake(s: Snake, f: number, leader = false) {
  const r = width(s),
    n = s.body.length;
  const pixelScale = c.getTransform().a;
  const light = atSize(beads[s.skin][0], 2 * r * pixelScale);
  const dark = atSize(beads[s.skin][1], 2 * r * pixelScale);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = n - 1; i >= 0; i--) {
      const p = s.body[i],
        o = s.old[i],
        x = o.x + (p.x - o.x) * f,
        y = o.y + (p.y - o.y) * f;
      if (visible(x, y)) {
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
            c.drawImage(shadow, x - r * 1.4, y - r * 0.96, r * 2.8, r * 2.8);
        } else {
          const img = Math.floor(i / 4) % 2 ? dark : light;
          c.drawImage(img, x - r, y - r, 2 * r, 2 * r);
          if (!i) {
            face(
              c,
              x,
              y,
              s.prevA + angleDiff(s.a, s.prevA) * f,
              r,
              s.skin,
              angleDiff(s.aim, s.a),
              pixelScale,
            );
            c.textAlign = "center";
            c.font = "600 12px Arial";
            c.fillStyle = colors.ink;
            c.fillText(s.name, x, y - r - 9);
            if (leader)
              c.drawImage(crown, x - 15, y - r - 48, 30, 30);
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
    if (!visible(x, y)) continue;
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
  f: number,
  time: number,
  pullback = 0,
) {
  const frameDt = lastRenderTime ? time - lastRenderTime : 1 / 60;
  lastRenderTime = time;
  const w = innerWidth,
    h = innerHeight,
    dpr = resolution.update(
      w,
      h,
      devicePixelRatio,
      frameDt,
      world.spectator || !world.player.dead,
    ),
    pw = Math.round(w * dpr),
    ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  c.setTransform(pw / w, 0, 0, ph / h, 0, 0);

  c.imageSmoothingQuality = "low";
  c.save();
  let originX = w / 2;
  let originY = h / 2;
  if (world.spectator) {
    // Keep even the viewport corners inside the arena's warning ring.
    const minZoom = Math.hypot(w, h) / (2 * (R - 120));
    const pulse = 1 + 0.035 * (1 + Math.sin(world.tick * STEP / 5));
    zoom = Math.max(minZoom, playZoom(65, w, h) * 0.65) * pulse;
  } else {
    const s = world.player;
    if (!s.dead) {
      world.cameraMass = framingMass(world.cameraMass, s.mass);
      world.cameraZoom +=
        (playZoom(world.cameraMass, w, h) - world.cameraZoom) *
        cameraEase(frameDt);
    }
    const ease = pullback * pullback * (3 - 2 * pullback);
    zoom = world.cameraZoom * (1 - 0.25 * ease);
    if (s.dead) f = 1;
    cx = s.old[0].x + (s.x - s.old[0].x) * f;
    cy = s.old[0].y + (s.y - s.old[0].y) * f;
    const shake = cameraShake(time, world.shake);
    originX += shake.x - cx * zoom;
    originY += shake.y - cy * zoom;
  }
  left = -originX / zoom;
  top = -originY / zoom;
  right = left + w / zoom;
  bottom = top + h / zoom;
  drawFloor(w, h, zoom, originX, originY);
  c.translate(originX, originY);
  c.scale(zoom, zoom);
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
