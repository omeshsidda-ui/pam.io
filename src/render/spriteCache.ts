import {
  paintBead,
  paintTail,
  paintEye,
  paintHead,
  paintOrnaments,
  paintMark,
} from "./skinArt";
import { skins } from "../config";
// Downsample once, while all source pixels are available. In play, bilinear
// filtering then only has to handle the small gap between adjacent sizes.
const smaller = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();
export function atSize(image: HTMLCanvasElement, pixels: number) {
  while (image.width >= 2 * pixels) {
    const next = smaller.get(image);
    if (!next) break;
    image = next;
  }
  return image;
}
function sprite(n: number, paint: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = n;
  paint(canvas.getContext("2d")!);
  let level = canvas;
  while (level.width >= 24) {
    const next = document.createElement("canvas");
    next.width = next.height = Math.floor(level.width / 2);
    const ctx = next.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(level, 0, 0, next.width, next.height);
    smaller.set(level, next);
    level = next;
  }
  return canvas;
}
export const beads = skins.map((def) =>
  Array.from({ length: def.beadCount }, (_, frame) =>
    sprite(192, (c) => paintBead(c, def, frame)),
  ),
);
export const tails = skins.map((def) => sprite(192, (c) => paintTail(c, def)));
const markings = skins.map((def) => sprite(96, (c) => paintMark(c, def)));
const unmarked = new Set(["peel", "boba", "espresso"]);

// Draw the nearest cached mip, rotating only directional artwork.
function stamp(
  c: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  x: number,
  y: number,
  angle: number,
  radius: number,
  pixelScale: number,
) {
  const size = 2 * radius;
  const mip = atSize(image, size * pixelScale);
  if (!angle) {
    c.drawImage(mip, x - radius, y - radius, size, size);
    return;
  }
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.drawImage(mip, -radius, -radius, size, size);
  c.restore();
}
export function marking(
  c: CanvasRenderingContext2D,
  skin: number,
  x: number,
  y: number,
  angle: number,
  radius: number,
  pixelScale = 1,
) {
  stamp(c, markings[skin], x, y, angle, radius, pixelScale);
}
export function segment(
  c: CanvasRenderingContext2D,
  skin: number,
  i: number,
  tail: boolean,
  x: number,
  y: number,
  tangent: number,
  r: number,
  pixelScale: number,
) {
  const def = skins[skin];
  if (tail) {
    stamp(c, tails[skin], x, y, tangent + Math.PI, r * 1.5, pixelScale);
    return;
  }
  const frame =
    (Math.floor(i / def.cycleHold) * def.beadStride) % def.beadCount;
  stamp(
    c,
    beads[skin][frame],
    x,
    y,
    def.orientedBeads ? tangent : 0,
    r * def.beadScale,
    pixelScale,
  );
  if (i > 1 && i % 5 === 4 && !unmarked.has(def.id)) {
    const offset = r * 0.58;
    marking(
      c,
      skin,
      x - offset * Math.cos(tangent),
      y - offset * Math.sin(tangent),
      tangent,
      r * 0.62,
      pixelScale,
    );
  }
}

// Count from the tail so the taper stays the same as the snake grows.
const tailTaper = [1, 0.76, 0.86, 0.94, 0.98];
export function segmentRadius(radius: number, distanceFromTail: number) {
  return radius * (tailTaper[distanceFromTail] ?? 1);
}
export const shadow = sprite(192, (c) => {
  const g = c.createRadialGradient(96, 99, 36, 96, 96, 94);
  g.addColorStop(0, "#0006");
  g.addColorStop(0.65, "#0002");
  g.addColorStop(1, "#0000");
  c.fillStyle = g;
  c.fillRect(0, 0, 192, 192);
});
// Twin tapered strokes sit outside the neck, leaving the head outline visible.
export const boostWake = skins.map((s) =>
  sprite(192, (c) => {
    for (const sign of [-1, 1]) {
      c.save();
      c.translate(0, 96);
      c.scale(1, sign);
      const ink = c.createLinearGradient(6, 0, 164, 0);
      ink.addColorStop(0, s.primary + "00");
      ink.addColorStop(0.55, s.primary + "aa");
      ink.addColorStop(1, "#fffae6");
      c.fillStyle = ink;
      c.beginPath();
      c.moveTo(6, 75);
      c.quadraticCurveTo(107, 46, 155, 58);
      c.quadraticCurveTo(182, 61, 190, 42);
      c.quadraticCurveTo(186, 65, 154, 65);
      c.quadraticCurveTo(103, 54, 6, 75);
      c.fill();
      c.restore();
    }
  }),
);
export const orbs = skins.map((s) =>
  sprite(128, (c) => {
    const glow = c.createRadialGradient(64, 64, 10, 64, 64, 60);
    glow.addColorStop(0, s.primary + "46");
    glow.addColorStop(0.5, s.primary + "13");
    glow.addColorStop(1, s.primary + "00");
    c.fillStyle = glow;
    c.fillRect(0, 0, 128, 128);
    c.fillStyle = s.secondary;
    c.beginPath();
    c.arc(64, 64, 16, 0, 7);
    c.fill();
    c.fillStyle = s.primary;
    c.beginPath();
    c.arc(63, 61, 12, 0, 7);
    c.fill();
    c.fillStyle = "#fff9";
    c.beginPath();
    c.arc(60, 57, 4, 0, 7);
    c.fill();
  }),
);
const heads = skins.map((def) => sprite(192, (c) => paintHead(c, def)));
const ornaments = skins.map((def) =>
  sprite(192, (c) => paintOrnaments(c, def)),
);
const eyes = skins.map((def) =>
  sprite(96, (c) => paintEye(c, def, false)),
);
const pupils = skins.map((def) =>
  sprite(96, (c) => paintEye(c, def, true)),
);
export const crown = sprite(128, (c) => {
  c.scale(2, 2);
  c.fillStyle = "#ffd450";
  c.strokeStyle = "#8a581d";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(6, 17);
  c.lineTo(20, 28);
  c.lineTo(32, 6);
  c.lineTo(46, 28);
  c.lineTo(58, 17);
  c.lineTo(52, 48);
  c.lineTo(12, 48);
  c.closePath();
  c.fill();
  c.stroke();
  c.fillStyle = "#fff2aa";
  c.fillRect(14, 41, 36, 3);
});
export function face(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  a: number,
  r: number,
  skin: number,
  turn = 0,
  pixelScale = 1,
) {
  const def = skins[skin];
  c.save();
  c.translate(x, y);
  c.rotate(a);
  stamp(c, ornaments[skin], 0, 0, 0, r * 1.82, pixelScale);
  stamp(c, heads[skin], 0, 0, 0, r * 1.38, pixelScale);
  const size = r * def.eyeSize;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(r * def.eyeX, side * r * def.eyeY);
    c.scale(1, side);
    stamp(c, eyes[skin], 0, 0, 0, size / 2, pixelScale);
    if (def.eyeStyle !== "happy" && def.eyeStyle !== "hollow") {
      const offset = def.tracksAim
        ? size * (def.id === "kitsune" ? 0.08 : 0.13)
        : 0;
      stamp(
        c,
        pupils[skin],
        offset * Math.cos(turn),
        side * offset * Math.sin(turn),
        0,
        size * 0.29,
        pixelScale,
      );
    }
    c.restore();
  }
  c.restore();
}

export function preview(
  canvas: HTMLCanvasElement,
  skin: number,
  time: number,
  vertical = false,
) {
  const c = canvas.getContext("2d")!,
    w = canvas.width,
    h = canvas.height;
  c.clearRect(0, 0, w, h);
  const r = vertical
    ? Math.min(w * 0.19, h * 0.12)
    : Math.min(h * 0.215, w * 0.11);
  const length = (vertical ? h : w) - 3.35 * r;
  const count = Math.max(2, Math.ceil(length / (r * 0.98)));
  const wave = (vertical ? w : h) * 0.14;
  // Bring the cap closer to the narrower last bead at preview spacing.
  const tailSample = 0.15;
  for (let i = 0; i <= count; i++) {
    const sample = i === 0 ? tailSample : i;
    const u = sample / count,
      phase = u * 5.5 + time;
    const along = 1.62 * r + length * u;
    const across = (vertical ? w : h) / 2 + wave * Math.sin(phase);
    const x = vertical ? across : along,
      y = vertical ? along : across;
    // Use the chord to the adjacent sample so the tail follows its attachment.
    const step = (i === count ? i - 1 : i + 1) - sample;
    const slope =
      (wave *
        (Math.sin(phase + (step * 5.5) / count) - Math.sin(phase)) *
        count) /
      step;
    const tangent = vertical
      ? Math.atan2(length, slope)
      : Math.atan2(slope, length);
    const drawRadius = i === count ? r : segmentRadius(r, i);
    segment(c, skin, count - i, i === 0, x, y, tangent, drawRadius, 1);
    if (i === count) face(c, x, y, tangent, r, skin);
  }
}
