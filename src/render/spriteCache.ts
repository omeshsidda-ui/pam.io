import { material, facePaint, headSilhouette } from "./skinArt";
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
// Each pair is the crest and underside color of the alternate body band.
const bands = [
  ["#c6d894", "#52764c"],
  ["#ffc6c7", "#b36085"],
  ["#d8f7f0", "#5ea8b9"],
  ["#ffd46b", "#c15c2c"],
  ["#947ab9", "#473b74"],
  ["#675143", "#302932"],
  ["#9ee3c8", "#3e998c"],
  ["#60558e", "#373359"],
  ["#d0bc6f", "#557548"],
  ["#683e48", "#362b38"],
  ["#eff8ff", "#8da4ba"],
  ["#9cd9d2", "#688daf"],
];
export const beads = skins.map((s, i) =>
  [0, 1].map((band) =>
    sprite(192, (c) => {
      const g = c.createLinearGradient(0, 3, 0, 189);
      const [light, dark] = band ? bands[i] : [s[1], s[2]];
      g.addColorStop(0, dark);
      g.addColorStop(0.18, light);
      g.addColorStop(band ? 0.46 : 0.65, light);
      g.addColorStop(1, dark);
      c.fillStyle = g;
      c.beginPath();
      c.arc(96, 96, 92, 0, Math.PI * 2);
      c.fill();
      material(c, s[3], band);
      const rim = c.createRadialGradient(82, 74, 32, 96, 96, 92);
      rim.addColorStop(0, "#ffffff13");
      rim.addColorStop(0.72, "#15112300");
      rim.addColorStop(1, "#15112334");
      c.fillStyle = rim;
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
// Hand-drawn dorsal motifs are matched to each creature's head silhouette.
const motifs: Record<string, (c: CanvasRenderingContext2D) => void> = {
  fang: (c) => {
    c.moveTo(18, 18);
    c.lineTo(68, 48);
    c.lineTo(18, 78);
    c.lineTo(36, 49);
    c.closePath();
  },
  bubble: (c) => {
    c.arc(37, 35, 11, 0, 7);
    c.moveTo(69, 65);
    c.arc(60, 65, 8, 0, 7);
    c.moveTo(34, 78);
    c.arc(28, 78, 5, 0, 7);
  },
  fin: (c) => {
    c.moveTo(18, 22);
    c.quadraticCurveTo(50, 31, 72, 48);
    c.quadraticCurveTo(44, 54, 18, 76);
    c.quadraticCurveTo(33, 51, 18, 22);
    c.closePath();
  },
  horn: (c) => {
    c.moveTo(22, 18);
    c.lineTo(47, 42);
    c.lineTo(29, 42);
    c.lineTo(70, 77);
    c.lineTo(51, 53);
    c.lineTo(68, 53);
    c.closePath();
  },
  crest: (c) => {
    c.moveTo(20, 70);
    c.lineTo(34, 28);
    c.lineTo(45, 59);
    c.lineTo(57, 20);
    c.lineTo(76, 70);
    c.closePath();
  },
  antenna: (c) => {
    c.moveTo(23, 68);
    c.quadraticCurveTo(43, 48, 36, 23);
    c.moveTo(51, 70);
    c.quadraticCurveTo(71, 47, 60, 25);
  },
  frill: (c) => {
    c.moveTo(22, 18);
    c.quadraticCurveTo(57, 32, 22, 48);
    c.quadraticCurveTo(57, 63, 22, 78);
  },
  star: (c) => {
    c.moveTo(48, 14);
    c.lineTo(56, 39);
    c.lineTo(82, 39);
    c.lineTo(61, 54);
    c.lineTo(69, 80);
    c.lineTo(48, 64);
    c.lineTo(27, 80);
    c.lineTo(35, 54);
    c.lineTo(14, 39);
    c.lineTo(40, 39);
    c.closePath();
  },
  antler: (c) => {
    c.moveTo(22, 78);
    c.lineTo(40, 49);
    c.lineTo(32, 25);
    c.moveTo(40, 49);
    c.lineTo(61, 20);
    c.moveTo(40, 49);
    c.lineTo(73, 55);
  },
  spike: (c) => {
    c.moveTo(18, 24);
    c.lineTo(42, 42);
    c.lineTo(31, 17);
    c.lineTo(58, 43);
    c.lineTo(52, 17);
    c.lineTo(77, 49);
    c.lineTo(48, 76);
    c.closePath();
  },
  mask: (c) => {
    c.moveTo(17, 29);
    c.quadraticCurveTo(48, 16, 79, 29);
    c.lineTo(70, 62);
    c.lineTo(48, 78);
    c.lineTo(26, 62);
    c.closePath();
  },
  prism: (c) => {
    c.moveTo(48, 13);
    c.lineTo(78, 48);
    c.lineTo(48, 82);
    c.lineTo(18, 48);
    c.closePath();
    c.moveTo(48, 13);
    c.lineTo(48, 82);
    c.moveTo(18, 48);
    c.lineTo(78, 48);
  },
};
const markings = skins.map((s) =>
  sprite(96, (c) => {
    c.fillStyle = s[2] + "c9";
    c.strokeStyle = s[2] + "e6";
    c.lineWidth = 7;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    motifs[s[3]](c);
    c.fill();
    c.stroke();
    c.fillStyle = "#ffffff55";
    c.beginPath();
    c.ellipse(45, 40, 10, 4, -0.5, 0, Math.PI * 2);
    c.fill();
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
// Twin tapered strokes sit outside the neck, leaving the head outline visible.
export const boostWake = skins.map((s) =>
  sprite(192, (c) => {
    for (const sign of [-1, 1]) {
      c.save();
      c.translate(0, 96);
      c.scale(1, sign);
      const ink = c.createLinearGradient(6, 0, 164, 0);
      ink.addColorStop(0, s[1] + "00");
      ink.addColorStop(0.55, s[1] + "aa");
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
    const dark = s[2],
      light = s[1];
    c.lineJoin = "round";
    // Extensions are intentionally compact so the head remains easy to read in play.
    c.fillStyle = dark;
    c.strokeStyle = "#172338";
    c.lineWidth = 4;
    c.beginPath();
    switch (s[3]) {
      case "fang":
        c.moveTo(51, 58);
        c.lineTo(31, 27);
        c.lineTo(61, 44);
        c.lineTo(74, 18);
        c.lineTo(82, 52);
        break;
      case "bubble":
        c.moveTo(56, 51);
        c.quadraticCurveTo(24, 15, 44, 14);
        c.quadraticCurveTo(69, 18, 73, 51);
        break;
      case "fin":
        c.moveTo(40, 66);
        c.lineTo(8, 31);
        c.quadraticCurveTo(43, 34, 68, 57);
        c.closePath();
        break;
      case "horn":
        c.moveTo(49, 56);
        c.lineTo(27, 19);
        c.lineTo(65, 43);
        c.lineTo(88, 20);
        c.lineTo(79, 61);
        break;
      case "crest":
        c.moveTo(48, 51);
        c.lineTo(38, 23);
        c.lineTo(58, 40);
        c.lineTo(72, 11);
        c.lineTo(77, 52);
        break;
      case "antenna":
        c.moveTo(52, 53);
        c.quadraticCurveTo(34, 8, 48, 13);
        c.quadraticCurveTo(66, 18, 68, 53);
        break;
      case "frill":
        c.moveTo(53, 60);
        c.quadraticCurveTo(22, 40, 42, 31);
        c.quadraticCurveTo(18, 13, 49, 20);
        c.lineTo(77, 55);
        break;
      case "star":
        c.moveTo(51, 52);
        c.lineTo(43, 27);
        c.lineTo(63, 40);
        c.lineTo(82, 18);
        c.lineTo(77, 51);
        break;
      case "antler":
        c.moveTo(43, 58);
        c.lineTo(29, 33);
        c.lineTo(12, 27);
        c.lineTo(31, 22);
        c.lineTo(35, 10);
        c.lineTo(50, 48);
        c.lineTo(66, 15);
        c.lineTo(72, 28);
        c.lineTo(90, 30);
        c.lineTo(71, 39);
        c.lineTo(77, 57);
        break;
      case "spike":
        c.moveTo(49, 59);
        c.lineTo(26, 28);
        c.lineTo(52, 41);
        c.lineTo(61, 13);
        c.lineTo(72, 42);
        c.lineTo(88, 26);
        c.lineTo(80, 62);
        break;
      case "mask":
        c.moveTo(37, 48);
        c.lineTo(48, 18);
        c.lineTo(59, 48);
        c.lineTo(75, 35);
        c.lineTo(72, 65);
        c.lineTo(51, 75);
        c.lineTo(30, 64);
        break;
      case "prism":
        c.moveTo(47, 53);
        c.lineTo(48, 13);
        c.lineTo(70, 45);
        c.lineTo(88, 51);
        c.lineTo(66, 63);
        break;
    }
    c.closePath();
    c.fill();
    c.stroke();
    const g = c.createRadialGradient(82, 48, 2, 98, 95, 89);
    g.addColorStop(0, "#fff9e6");
    g.addColorStop(0.25, light);
    g.addColorStop(0.8, dark);
    g.addColorStop(1, "#233044");
    c.fillStyle = g;
    c.beginPath();
    if (["fang", "antler", "spike", "horn"].includes(s[3])) {
      c.moveTo(9, 96);
      c.bezierCurveTo(8, 38, 57, 12, 101, 24);
      c.bezierCurveTo(138, 34, 153, 59, 177, 70);
      c.bezierCurveTo(197, 80, 192, 110, 175, 121);
      c.bezierCurveTo(148, 132, 133, 163, 87, 167);
      c.bezierCurveTo(38, 172, 9, 146, 9, 96);
    } else if (["mask", "prism", "fin"].includes(s[3])) {
      c.moveTo(7, 96);
      c.quadraticCurveTo(9, 42, 68, 22);
      c.quadraticCurveTo(129, 14, 180, 77);
      c.quadraticCurveTo(201, 98, 178, 119);
      c.quadraticCurveTo(125, 178, 68, 170);
      c.quadraticCurveTo(9, 150, 7, 96);
    } else c.ellipse(97, 96, 92, 76, 0, 0, Math.PI * 2);
    c.closePath();
    c.fill();
    facePaint(c, s[3]);
    // Snout and nostrils break up the face at both portrait and arena scale.
    const plush = s[3] === "mask" || s[3] === "bubble";
    c.fillStyle = plush ? "#fff4df" : "#fff3d431";
    c.beginPath();
    c.ellipse(160, 96, 25, 16, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = plush ? "#593849" : "#3c313b";
    if (plush) {
      c.beginPath();
      c.moveTo(176, 89);
      c.quadraticCurveTo(190, 94, 180, 102);
      c.quadraticCurveTo(168, 105, 171, 96);
      c.closePath();
      c.fill();
    } else {
      for (const side of [-1, 1]) {
        c.beginPath();
        c.ellipse(172, 96 + side * 9, 4, 2.5, side * 0.45, 0, 7);
        c.fill();
      }
    }
    // A bright cheek slash gives the face a recognizable, skin-specific badge.
    c.fillStyle = s[2] + "d9";
    c.beginPath();
    switch (s[3]) {
      case "fang":
        c.moveTo(118, 120);
        c.lineTo(151, 132);
        c.lineTo(123, 139);
        break;
      case "bubble":
        c.arc(126, 130, 11, 0, Math.PI * 2);
        c.arc(151, 119, 6, 0, Math.PI * 2);
        break;
      case "fin":
        c.moveTo(118, 124);
        c.quadraticCurveTo(144, 114, 159, 132);
        c.quadraticCurveTo(137, 128, 118, 139);
        break;
      case "horn":
        c.moveTo(120, 117);
        c.lineTo(157, 133);
        c.lineTo(126, 137);
        break;
      case "crest":
        c.moveTo(121, 122);
        c.lineTo(151, 122);
        c.lineTo(137, 140);
        break;
      case "antenna":
        c.arc(132, 130, 9, 0, Math.PI * 2);
        c.arc(154, 121, 5, 0, Math.PI * 2);
        break;
      case "frill":
        c.moveTo(119, 128);
        c.quadraticCurveTo(140, 112, 160, 130);
        c.quadraticCurveTo(140, 124, 119, 140);
        break;
      case "star":
        c.moveTo(136, 115);
        c.lineTo(142, 126);
        c.lineTo(155, 130);
        c.lineTo(142, 135);
        c.lineTo(136, 145);
        c.lineTo(130, 135);
        c.lineTo(117, 130);
        c.lineTo(130, 126);
        break;
      case "antler":
        c.moveTo(119, 128);
        c.lineTo(154, 128);
        c.lineTo(140, 140);
        break;
      case "spike":
        c.moveTo(118, 122);
        c.lineTo(132, 127);
        c.lineTo(126, 118);
        c.lineTo(151, 136);
        c.lineTo(127, 138);
        break;
      case "mask":
        c.moveTo(116, 124);
        c.quadraticCurveTo(137, 114, 160, 124);
        c.lineTo(148, 136);
        c.lineTo(126, 136);
        break;
      case "prism":
        c.moveTo(138, 114);
        c.lineTo(156, 130);
        c.lineTo(138, 144);
        c.lineTo(120, 130);
        c.closePath();
        break;
    }
    c.fill();
    c.strokeStyle = "#ffffff63";
    c.lineWidth = 4;
    c.beginPath();
    c.ellipse(78, 48, 29, 9, -0.4, 0, Math.PI * 2);
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
// Mirrored side details read as a silhouette even when the snake is small.
const ornaments = skins.map((s) =>
  sprite(192, (c) => {
    headSilhouette(c, s[3], s[1], s[2]);
  }),
);
const eyes = skins.map((s) =>
  sprite(128, (c) => {
    const angular = ["fang", "antler", "horn", "spike"].includes(s[3]);
    c.fillStyle = "#293144";
    c.beginPath();
    c.ellipse(64, 64, 61, angular ? 45 : 56, 0, 0, 7);
    c.fill();
    c.fillStyle = "#fffdf7";
    c.beginPath();
    c.ellipse(64, 64, 55, angular ? 39 : 50, 0, 0, 7);
    c.fill();
  }),
);
const pupils = skins.map((s) =>
  sprite(96, (c) => {
    c.fillStyle = s[2];
    c.beginPath();
    c.arc(48, 48, 44, 0, 7);
    c.fill();
    c.fillStyle = "#211e24";
    c.beginPath();
    c.ellipse(
      50,
      48,
      s[3] === "antler" || s[3] === "fang" ? 14 : 30,
      36,
      0,
      0,
      7,
    );
    c.fill();
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(58, 32, 10, 0, 7);
    c.fill();
  }),
);
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
  c.save();
  c.translate(x, y);
  c.rotate(a);
  c.scale(r, r);
  c.drawImage(
    atSize(ornaments[skin], r * pixelScale * 3.64),
    -1.82,
    -1.82,
    3.64,
    3.64,
  );
  c.drawImage(
    atSize(heads[skin], r * pixelScale * 2.55),
    -1.18,
    -1.16,
    2.55,
    2.32,
  );
  for (const sign of [-1, 1]) {
    const yEye = sign * 0.52;
    c.drawImage(
      atSize(eyes[skin], r * pixelScale * 0.88),
      0.04,
      yEye - 0.44,
      0.88,
      0.88,
    );
    c.drawImage(
      atSize(pupils[skin], r * pixelScale * 0.46),
      0.39,
      yEye - 0.23 + Math.sin(turn) * 0.12,
      0.46,
      0.46,
    );
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
  const r = vertical ? w * 0.205 : h * 0.24;
  let lastX = 0,
    lastY = 0;
  for (let i = 0; i <= 50; i++) {
    const u = i / 50,
      v = Math.sin(u * 6 + time) * 0.17;
    const x = vertical ? w * (0.5 + v) : w * (0.11 + 0.76 * u),
      y = vertical ? h * (0.09 + 0.79 * u) : h * (0.5 + v);
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
    marking(c, skin, x, y, angle, r);
  }
}
