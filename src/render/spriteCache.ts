import { skins } from "../config";
function sprite(n: number, paint: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = n;
  paint(canvas.getContext("2d")!);
  return canvas;
}
export const beads = skins.map((s, i) =>
  [0, 1].map((band) =>
    sprite(192, (c) => {
      const g = c.createLinearGradient(0, 3, 0, 189);
      g.addColorStop(0, s[2]);
      g.addColorStop(0.18, s[1]);
      g.addColorStop(band ? 0.46 : 0.65, s[1]);
      g.addColorStop(1, s[2]);
      c.fillStyle = g;
      c.beginPath();
      c.arc(96, 96, 92, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = band ? "#ffffff44" : "#ffffff28";
      c.beginPath();
      c.ellipse(74, 49, 29, 10, -0.38, 0, 7);
      c.fill();
      const gloss = c.createRadialGradient(69, 47, 1, 69, 47, 70);
      gloss.addColorStop(0, "#ffffff40");
      gloss.addColorStop(1, "#ffffff00");
      c.fillStyle = gloss;
      c.fill();
      if (i % 3 === 1) {
        c.fillStyle = s[2];
        c.beginPath();
        c.ellipse(69, 92, 11, 6, -0.4, 0, 7);
        c.fill();
      }
    }),
  ),
);
// Dorsal markings remain recognizable in both appearances and at small sizes.
const markings = skins.map((s, i) =>
  sprite(96, (c) => {
    c.fillStyle = s[2] + "b3";
    c.strokeStyle = s[2] + "ab";
    c.lineWidth = 8;
    c.lineCap = "round";
    switch (i % 4) {
      case 0:
        c.beginPath();
        c.moveTo(26, 18);
        c.lineTo(60, 48);
        c.lineTo(26, 78);
        c.lineTo(40, 49);
        c.closePath();
        c.fill();
        break;
      case 1:
        for (const [x, y, r] of [
          [40, 33, 10],
          [60, 56, 6],
          [28, 64, 4],
        ]) {
          c.beginPath();
          c.arc(x, y, r, 0, 7);
          c.fill();
        }
        break;
      case 2:
        c.beginPath();
        c.moveTo(32, 19);
        c.quadraticCurveTo(60, 48, 32, 77);
        c.stroke();
        break;
      case 3:
        c.beginPath();
        c.moveTo(23, 47);
        c.lineTo(46, 27);
        c.lineTo(72, 47);
        c.lineTo(46, 66);
        c.closePath();
        c.fill();
        break;
    }
  }),
);
export function marking(
  c: CanvasRenderingContext2D,
  skin: number,
  x: number,
  y: number,
  a: number,
  r: number,
) {
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.drawImage(markings[skin], -r, -r, 2 * r, 2 * r);
  c.restore();
}
export const shadow = sprite(192, (c) => {
  const g = c.createRadialGradient(96, 99, 36, 96, 96, 94);
  g.addColorStop(0, "#0006");
  g.addColorStop(0.65, "#0002");
  g.addColorStop(1, "#0000");
  c.fillStyle = g;
  c.fillRect(0, 0, 192, 192);
});
export const orbs = skins.map((s) =>
  sprite(128, (c) => {
    const glow = c.createRadialGradient(64, 64, 10, 64, 64, 60);
    glow.addColorStop(0, s[1] + "46");
    glow.addColorStop(0.5, s[1] + "13");
    glow.addColorStop(1, s[1] + "00");
    c.fillStyle = glow;
    c.fillRect(0, 0, 128, 128);
    c.fillStyle = s[2];
    c.beginPath();
    c.arc(64, 64, 16, 0, 7);
    c.fill();
    c.fillStyle = s[1];
    c.beginPath();
    c.arc(63, 61, 12, 0, 7);
    c.fill();
    c.fillStyle = "#fff9";
    c.beginPath();
    c.arc(60, 57, 4, 0, 7);
    c.fill();
  }),
);
const heads = skins.map((s) =>
  sprite(192, (c) => {
    const g = c.createRadialGradient(82, 48, 2, 98, 95, 89);
    g.addColorStop(0, "#fff9d6");
    g.addColorStop(0.25, s[1]);
    g.addColorStop(0.8, s[2]);
    g.addColorStop(1, "#233044");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(97, 96, 92, 76, 0, 0, 7);
    c.fill();
    c.strokeStyle = "#192239aa";
    c.lineWidth = 4;
    c.beginPath();
    c.arc(163, 95, 13, -0.3, 1.5);
    c.stroke();
  }),
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
) {
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.scale(r, r);
  c.drawImage(heads[skin], -1.18, -1.16, 2.55, 2.32);
  for (const sign of [-1, 1]) {
    c.fillStyle = "#293144";
    c.beginPath();
    c.ellipse(0.48, sign * 0.52, 0.42, 0.39, 0, 0, 7);
    c.fill();
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(0.48, sign * 0.52, 0.38, 0.35, 0, 0, 7);
    c.fill();
    c.fillStyle = "#182035";
    const py = sign * 0.52 + Math.sin(turn) * 0.12;
    c.beginPath();
    c.arc(0.62, py, 0.21, 0, 7);
    c.fill();
    c.fillStyle = "white";
    c.beginPath();
    c.arc(0.67, py - 0.08, 0.067, 0, 7);
    c.fill();
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
  let lastX = 0,
    lastY = 0;
  for (let i = 0; i <= 50; i++) {
    const u = i / 50,
      v = Math.sin(u * 6 + time) * 0.17;
    const x = vertical ? w * (0.5 + v) : w * (0.11 + 0.76 * u),
      y = vertical ? h * (0.09 + 0.79 * u) : h * (0.5 + v);
    const r = (vertical ? w * 0.205 : h * 0.24) * Math.min(1, 0.2 + u * 3.8);
    c.drawImage(beads[skin][Math.floor(i / 5) % 2], x - r, y - r, 2 * r, 2 * r);
    if (i === 50) face(c, x, y, Math.atan2(y - lastY, x - lastX), r, skin);
    lastX = x;
    lastY = y;
  }
  for (let i = 6; i < 44; i += 7) {
    const u = i / 50,
      phase = u * 6 + time,
      v = Math.sin(phase) * 0.17;
    const x = vertical ? w * (0.5 + v) : w * (0.11 + 0.76 * u),
      y = vertical ? h * (0.09 + 0.79 * u) : h * (0.5 + v);
    const angle = vertical
      ? Math.atan2(h * 0.79, w * 1.02 * Math.cos(phase))
      : Math.atan2(h * 1.02 * Math.cos(phase), w * 0.76);
    marking(
      c,
      skin,
      x,
      y,
      angle,
      (vertical ? w * 0.205 : h * 0.24) * Math.min(1, 0.2 + u * 3.8),
    );
  }
}
