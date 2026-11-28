import type { SkinDef } from "../skins/roster";

// Art is centered on a 192 px plate. +X points toward the nose on a bead
// or head, and away from the body on a tail.
type Brush = CanvasRenderingContext2D;
type Paint = string | CanvasGradient;
const ink = "#393046",
  cream = "#fff4d9",
  gold = "#ffd778",
  peelRim = "#8e551c",
  shinobiRim = "#8298bd";
function shape(c: Brush, path: string, fill: Paint, edge?: Paint, width = 3) {
  const p = new Path2D(path);
  c.fillStyle = fill;
  c.fill(p);
  if (edge) {
    c.strokeStyle = edge;
    c.lineWidth = width;
    c.stroke(p);
  }
}
function line(c: Brush, path: string, color: Paint, width: number) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke(new Path2D(path));
}
function oval(
  c: Brush,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: Paint,
  tilt = 0,
) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, tilt, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}
function gradient(c: Brush, ...colors: string[]) {
  const g = c.createLinearGradient(0, -78, 0, 80);
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
  return g;
}
function glaze(c: Brush, light: string, middle: string, dark: string) {
  const g = c.createRadialGradient(-28, -36, 3, 0, 0, 85);
  g.addColorStop(0, light);
  g.addColorStop(0.62, middle);
  g.addColorStop(1, dark);
  return g;
}
function tapiocaPearl(c: Brush, x: number, y: number, r: number) {
  const shine = c.createRadialGradient(x - r * 0.29, y - r * 0.36, 0, x, y, r);
  shine.addColorStop(0, "#966857");
  shine.addColorStop(0.46, "#563332");
  shine.addColorStop(0.84, "#301c27");
  shine.addColorStop(1, "#21141c");
  oval(c, x, y, r, r, shine);
  oval(c, x - r * 0.26, y - r * 0.35, r * 0.29, r * 0.15, "#ffe4c8", -0.4);
}
function monarchRim(c: Brush) {
  return gradient(c, "#ffe9a9", "#bc8847", "#e6b964", "#8e6035", "#d8a85c");
}
function star(c: Brush, x: number, y: number, size: number, color: string) {
  c.save();
  c.translate(x, y);
  c.scale(size, size);
  shape(
    c,
    "M0 -1 Q.12 -.2 .85 0 Q.15 .16 0 1 Q-.15 .16 -.85 0 Q-.12 -.2 0 -1Z",
    color,
  );
  c.restore();
}
function plate(c: Brush) {
  c.translate(96, 96);
  c.lineJoin = c.lineCap = "round";
}
function silhouette(
  c: Brush,
  path: string,
  fill: Paint,
  rim: Paint = ink,
  weight = 3,
) {
  c.save();
  c.shadowColor = "#271c3559";
  c.shadowOffsetY = 3;
  c.shadowBlur = 3;
  shape(c, path, fill, rim, weight);
  c.restore();
}
const round =
  "M0 -78 C45 -78 78 -44 78 0 S43 78 0 78 S-78 43 -78 0 S-43 -78 0 -78Z";
const cushion =
  "M-45 -66 Q-4 -80 43 -68 Q76 -59 77 -16 L77 21 Q75 64 38 70 Q-12 80 -51 65 Q-78 55 -78 16 L-78 -24 Q-77 -53 -45 -66Z";
const puff =
  "M-66 -39 Q-63 -70 -34 -66 Q-13 -87 11 -73 Q44 -82 54 -61 Q84 -58 77 -29 Q94 -5 78 14 Q85 45 59 52 Q51 78 21 70 Q-5 87 -23 72 Q-56 81 -63 55 Q-89 48 -77 20 Q-95 -4 -76 -22Z";
const fur =
  "M-79 -31 Q-71 -36 -57 -33 Q-58 -47 -70 -53 Q-54 -58 -38 -52 Q-40 -65 -52 -70 Q0 -82 45 -64 Q81 -46 79 0 Q81 45 45 64 Q2 82 -52 69 Q-42 64 -39 51 Q-59 58 -74 55 Q-62 45 -61 33 Q-77 40 -87 34 Q-74 19 -80 9 Q-90 -9 -79 -31Z";
const flame =
  "M-90 -51 Q-59 -49 -71 -77 Q-35 -53 -9 -68 Q25 -87 55 -59 Q83 -40 79 4 Q75 62 24 68 Q-7 67 -36 79 Q-22 58 -56 55 L-86 64 Q-59 30 -77 22 L-91 26 Q-64 -3 -39 -8 Q-67 -6 -89 -22 Q-62 -23 -51 -36Z";
const armor =
  "M-64 -50 L-39 -72 34 -73 65 -50 79 -13 76 32 50 64 6 76 -44 66 -73 39 -84 4Z";
const pastel = [
  "#ff93ba",
  "#ffbc99",
  "#ffe991",
  "#9ae4bc",
  "#9fdaff",
  "#cbb0ef",
];

export function paintBead(c: Brush, def: SkinDef, frame: number) {
  plate(c);
  const { id, primary, secondary } = def;
  function base(path: string, fill: Paint, rim: Paint = ink, weight = 3) {
    silhouette(c, path, fill, rim, weight);
    c.clip(new Path2D(path));
  }
  switch (id) {
    case "emerald":
      base(round, gradient(c, "#256745", primary, "#92dc69", secondary));
      for (let row = -3; row <= 3; row++) {
        for (let col = -3; col <= 3; col++) {
          c.save();
          c.translate(col * 40 + (row % 2) * 20 + frame * 14, row * 24);
          shape(
            c,
            "M-21 0 Q-9 -11 0 -14 L21 0 Q8 11 0 14Z",
            "#27836165",
            "#256a485c",
            2,
          );
          line(c, "M-16 -1 L0 -11 11 -5", "#dcffae95", 2.5);
          c.restore();
        }
      }
      line(c, "M-76 37 Q-47 75 3 66", "#d7fc7590", 8);
      break;
    case "cotton":
      base(
        puff,
        glaze(c, "#fffefa", frame ? "#fff9ef" : "#fbefeb", "#d8bcc8"),
        "#aa919c",
      );
      line(
        c,
        "M-71 -27 Q-48 -47 -34 -28 M-71 25 Q-45 10 -36 32 M-41 58 Q-20 41 -7 54",
        "#d9c4ce",
        3,
      );
      oval(c, -35, -38, 20, 9, "#fffdf7", -0.35);
      break;
    case "citrus": {
      const fruit = [
        ["#fff8ae", "#ffe134", "#d99a13", "#956019"],
        ["#ffdf74", "#ff9b39", "#d35020", "#9c4623"],
        ["#edff92", "#98e43b", "#49a22b", "#61712c"],
      ][frame];
      base(round, glaze(c, fruit[0], fruit[1], fruit[2]), fruit[3], 6);
      line(c, "M-68 -24 Q-57 -59 -20 -69", "#fff2a097", 4);
      oval(c, -38, -39, 22, 10, "#fffbd7d9", -0.7);
      line(c, "M-60 21 Q-52 49 -27 59", "#fff7ac9c", 4);
      for (let i = 0; i < 11; i++)
        star(
          c,
          ((i * 39 + 17 * frame) % 121) - 60,
          ((i * 57) % 119) - 59,
          3 + (i % 4),
          "#ffffe7",
        );
      break;
    }
    case "cobalt":
      base(
        armor,
        gradient(c, "#73cdeb", "#233858", "#172647", "#345586", "#1d2848"),
      );
      c.translate(frame * 6, 0);
      shape(c, "M-86 -62 L-49 -61 0 0 -50 62 -82 60 -29 0Z", "#197ba5");
      line(c, "M-69 -66 L-17 0 -68 65", "#72ebff", 9);
      line(c, "M-66 -68 L-15 0 -67 69", "#dcfbff", 2);
      break;
    case "kitsune":
      base(
        fur,
        gradient(c, "#a74b21", "#ffb35a", primary, "#ffcea0", "#fff2ce"),
        "#a76547",
      );
      c.translate(frame * 8, 0);
      shape(
        c,
        "M-94 25 Q-61 39 -23 27 Q-26 36 -38 41 Q-19 44 5 36 Q-19 70 -90 73Z",
        gradient(c, "#ffd096", "#ffcd9b", "#fff0cd"),
      );
      line(
        c,
        "M-73 -29 Q-46 -30 -28 -42 M-73 -7 L-44 -18 M-65 5 L-48 0",
        "#ffd38b",
        4,
      );
      break;
    case "mochi": {
      base(cushion, glaze(c, cream, "#ffeaca", "#d9af90"), "#9a7771");
      const [ginger, cocoa] = [
        ["M-94 -63 Q-61 -78 -34 -56 T-38 -15 Q-58 3 -91 -12Z",
         "M-61 35 Q-45 19 -29 30 Q-13 45 -35 60 Q-54 70 -64 55 Q-69 45 -61 35Z"],
        ["M-84 25 Q-67 9 -43 14 Q-16 22 -23 51 Q-27 69 -9 80 H-86Z",
         "M-63 -62 Q-44 -78 -22 -62 Q-7 -51 -16 -38 Q-28 -21 -50 -34 Q-68 -42 -63 -62Z"],
        ["M-76 -75 Q-40 -67 -49 -41 Q-58 -19 -44 -11 Q-25 -4 -13 -24 Q0 -49 -11 -77Z",
         "M-86 12 Q-64 5 -52 22 Q-41 38 -55 51 Q-68 63 -88 49Z"],
        ["M-69 69 Q-71 45 -50 40 Q-35 38 -27 23 Q-17 7 2 15 Q21 24 10 53 Q3 67 -2 78Z",
         "M-97 -53 Q-68 -63 -57 -47 Q-50 -37 -59 -27 Q-67 -19 -81 -22 L-96 -12Z"],
      ][frame];
      shape(c, ginger, gradient(c, "#e2a264", "#c98756", "#b67954"));
      shape(c, cocoa, gradient(c, "#9b7466", "#775149", "#684741"));
      break;
    }
    case "boba": {
      base(
        cushion,
        gradient(c, "#bd875d", "#fff0cf", frame ? "#edc69b" : "#f2d5ac", "#b17c57"),
        "#89583d",
        5,
      );
      line(c, "M-58 -37 Q-29 -55 29 -43", "#fff5d9b8", 5);
      const pearls = frame
        ? [[-46, -15, 15], [-47, 19, 13], [-18, 37, 15], [20, 15, 12]]
        : [[-49, 5, 16], [-24, -18, 12], [-18, 28, 15], [17, 39, 11]];
      for (const [x, y, radius] of pearls) tapiocaPearl(c, x, y, radius);
      break;
    }
    case "axolotl":
      base(round, glaze(c, "#defbf3", "#8ee6d8df", "#55bfb6e8"), "#eea2b3", 5);
      for (const [x, y, r] of [
        [-52, -13, 12],
        [-32, 35, 8],
        [15, -55, 7],
        [-46, -41, 5],
      ]) {
        const px = x + frame * 10;
        oval(c, px, y, r, r, "#dbfff680");
        oval(c, px - 2, y - 3, r * 0.36, r * 0.22, "#fffefa");
      }
      line(c, "M-65 34 Q-49 64 -16 68", "#ffd4d9", 5);
      break;
    case "peel": {
      // Feather only the trailing end. Adjacent links then share one continuous
      // cylindrical highlight without a transverse outline or repeated shadow.
      shape(
        c,
        cushion,
        gradient(
          c,
          "#b08c36",
          "#fff1a0",
          "#fff4aa",
          "#ffdf63",
          "#edbf40",
          "#b88b2d",
        ),
      );
      const rim = c.createLinearGradient(45, 0, 78, 0);
      rim.addColorStop(0, peelRim);
      rim.addColorStop(1, "#8e551c00");
      line(
        c,
        "M-78 -24 Q-77 -53 -45 -66 Q-4 -80 43 -68 Q76 -59 77 -16 M-78 16 Q-78 55 -51 65 Q-12 80 38 70 Q75 64 77 21",
        rim,
        5,
      );
      line(c, "M-73 34 Q-4 36 73 34", "#dfb741", 3);
      const blend = c.createLinearGradient(-80, 0, -28, 0);
      blend.addColorStop(0, "transparent");
      blend.addColorStop(1, "black");
      c.globalCompositeOperation = "destination-in";
      c.fillStyle = blend;
      c.fillRect(-96, -96, 192, 192);
      break;
    }
    case "matcha":
      base(
        cushion,
        gradient(c, "#b1d196", "#e1edc0", primary, "#f5e8be"),
        "#829174",
      );
      shape(c, "M-89 37 Q-42 52 -12 40 T81 37 V79 H-89Z", "#f6e8bf");
      for (let i = 0; i < 13; i++)
        oval(
          c,
          ((i * 53 + frame * 17) % 126) - 65,
          ((i * 37) % 82) - 50,
          5,
          2.4,
          i % 2 ? "#ad8152" : "#f9e1a2",
          i * 0.8,
        );
      break;
    case "espresso": {
      base(
        round,
        glaze(
          c,
          frame % 2 ? "#e3b58b" : "#cb9470",
          frame % 2 ? "#ad7049" : "#8c523b",
          "#4e302c",
        ),
      );
      c.translate(-9, 0);
      c.rotate((frame - 1.5) * 0.2);
      const foam = c.createRadialGradient(0, 0, 12, 0, 0, 62);
      foam.addColorStop(0, "#fff0cf");
      foam.addColorStop(0.65, "#f5d5ab");
      foam.addColorStop(1, "#f5d5ab00");
      line(
        c,
        "M-56 24 C-44 -15 -24 -39 9 -36 C44 -33 46 1 23 16 C2 32 -25 17 -15 0 Q-9 -11 3 -8",
        foam,
        11,
      );
      line(c, "M-46 32 Q-37 5 -24 -9", foam, 4);
      break;
    }
    case "candy":
      base(round, glaze(c, "#fff1ed", pastel[frame], "#b280ad"), "#ae82a4");
      shape(
        c,
        "M-90 -31 Q-38 -61 -9 -27 T83 -19 L83 10 Q41 32 1 0 T-86 7Z",
        pastel[(frame + 1) % 6],
      );
      line(c, "M-71 -35 Q-37 -55 -12 -29", "#fff9ed", 4);
      oval(c, -39, -47, 19, 7, "#fffdf1c9", -0.52);
      star(c, -55, 15, 9, "#fff8ed");
      break;
    case "shinobi":
      base(
        armor,
        gradient(c, "#677c9d", "#394d73", "#202a48", "#39476a", "#172039"),
        shinobiRim,
        6,
      );
      for (let i = -170; i < 170; i += 10) {
        line(c, `M${i} -80 l100 160`, "#9ba7bf38", 2);
        line(c, `M${i} 80 l100 -160`, "#131c3d80", 2);
      }
      c.translate(frame * 5, 0);
      line(c, "M-52 -69 Q-86 0 -52 69", "#8a632c", 11);
      line(c, "M-52 -69 Q-86 0 -52 69", gold, 5);
      break;
    case "blaze":
      base(
        flame,
        gradient(c, "#c83026", "#ff9b22", primary, "#d83326"),
        "#ad3924",
      );
      c.translate(frame * 4 - 5, 0);
      shape(
        c,
        "M-84 -51 Q-37 -25 -18 -52 Q16 -84 45 -49 Q71 -16 49 23 Q28 52 -9 46 Q-36 41 -64 55 Q-32 22 -63 24 L-37 0 Q-61 2 -77 -10 Q-42 -8 -32 -26Z",
        "#ffad26",
      );
      shape(
        c,
        "M-63 -35 Q-27 -11 -7 -37 Q26 -53 40 -23 Q52 6 16 20 Q-8 27 -40 38 Q-15 13 -38 12 Q-15 -8 -30 -9Z",
        "#fff19a",
      );
      break;
    case "astral":
      base(round, glaze(c, "#b19aee", "#664aab", "#242044"), "#49426b");
      c.translate(frame * 8 - 8, 0);
      line(c, "M-73 21 L-51 -27 -23 -12 5 -52 45 -36", "#dbc2ed", 2);
      for (const [x, y] of [
        [-72, 21],
        [-51, -27],
        [-23, -12],
        [5, -52],
      ])
        star(c, x, y, 6, gold);
      for (let i = 0; i < 27; i++)
        oval(c, ((i * 53) % 146) - 73, ((i * 37) % 140) - 70, 1.8, 1.8, cream);
      break;
    case "monarch":
      base(
        armor,
        gradient(c, "#7e748d", "#504960", "#302c3f", "#564c64", "#272330"),
        monarchRim(c),
        7,
      );
      c.translate(frame * 4, 0);
      line(c, "M-47 -60 L-65 -34 -72 0 -65 34 -47 58", "#dcb16d", 3);
      line(
        c,
        "M-62 -47 Q-31 -62 -26 -40 Q-26 -26 -40 -31 Q-50 -38 -40 -40 M-62 47 Q-31 62 -26 40 Q-26 26 -40 31 Q-50 38 -40 40",
        gold,
        3.5,
      );
      shape(
        c,
        "M-65 -22 L-48 -11 -36 -23 -38 -5 -25 0 -38 5 -36 23 -48 11 -65 22Z",
        "#c49a49",
      );
      break;
  }
}

export function paintTail(c: Brush, def: SkinDef) {
  plate(c);
  const { primary, secondary } = def;
  switch (def.id) {
    case "emerald":
      silhouette(
        c,
        "M-78 -23 Q-34 -35 -11 -23 L4 -34 67 -10 87 0 13 31 -6 22 Q-36 37 -78 23Z",
        gradient(c, cream, primary, secondary),
      );
      line(c, "M-24 -25 Q-8 0 -24 25 M-4 -22 Q10 0 -4 22", "#d4f19d", 6);
      shape(c, "M5 -20 L82 0 12 2Z", "#d5edab");
      break;
    case "cotton":
      c.scale(0.79, 0.79);
      silhouette(c, puff, glaze(c, "#ffffff", "#fff7ec", "#d8c3cd"), "#ab929e");
      line(c, "M-3 -29 Q16 -45 27 -27 M20 33 Q40 40 45 19", "#e2cfd5", 4);
      break;
    case "citrus":
      shape(c, "M-83 -23 Q-44 -18 -16 -43 V43 Q-44 18 -83 23Z", "#edaa45", "#95521d", 4);
      silhouette(
        c,
        "M-20 -61 A61 61 0 0 1 -20 61Z",
        gradient(c, "#fff18d", "#f8af37", "#d6701e"),
        "#95521d",
        5,
      );
      shape(c, "M-13 -51 A51 51 0 0 1 -13 51Z", gradient(c, "#ffcd62", "#f58f2e", "#e47523"), "#ffe8ad", 5);
      line(c, "M-13 0 L22 -36 M-13 0 H37 M-13 0 L22 36", "#fff0bb", 4);
      oval(c, 14, -19, 3, 6, "#fff8d4", 0.58);
      break;
    case "cobalt":
      for (const side of [-1, 1]) {
        c.save();
        c.scale(1, side);
        silhouette(
          c,
          "M-73 0 L-37 3 31 14 39 38 -48 39Z",
          gradient(c, primary, "#33577b", "#18273f"),
        );
        shape(c, "M30 16 Q60 12 84 43 Q57 34 35 37Z", "#8aeaf5", "#33728e");
        line(c, "M20 14 L26 36", "#e1fdff", 5);
        c.restore();
      }
      break;
    case "kitsune":
      silhouette(
        c,
        "M-82 17 Q-43 9 -35 -16 Q-16 -64 34 -56 L25 -46 Q53 -54 87 -43 Q67 -30 72 -9 L60 -14 Q56 46 1 49 Q-49 49 -82 30Z",
        gradient(c, "#ffcc7d", primary, secondary),
      );
      shape(
        c,
        "M10 -49 Q43 -57 83 -43 Q64 -25 69 -12 L58 -17 Q52 18 29 32 L38 8 18 18 28 -8 6 1 21 -25 3 -20Z",
        cream,
      );
      break;
    case "mochi":
      line(
        c,
        "M-77 0 Q-35 34 10 30 C84 24 81 -50 37 -48 Q15 -47 20 -24",
        "#8d695f",
        37,
      );
      line(
        c,
        "M-77 0 Q-35 34 10 30 C84 24 81 -50 37 -48 Q15 -47 20 -24",
        "#e9b277",
        30,
      );
      line(c, "M-2 16 L3 44 M39 3 L57 17 M45 -35 L48 -61", "#946143", 9);
      oval(c, 21, -26, 13, 16, cream);
      break;
    case "boba":
      shape(c, "M-84 -29 Q-39 -36 5 -29 V29 Q-39 36 -84 29Z", gradient(c, "#fff0cf", "#e4b487", "#966343"), "#89583d", 4);
      shape(c, "M-15 -35 Q-13 -49 6 -49 H22 Q36 -48 36 -34 V34 Q36 48 22 49 H6 Q-13 49 -15 35Z", gradient(c, "#fff9df", "#dfb98f", "#b58662"), "#795342", 5);
      line(c, "M-5 -34 V34", "#fff1d4", 4);
      tapiocaPearl(c, 32, 0, 33);
      break;
    case "axolotl":
      silhouette(
        c,
        "M-81 1 Q-15 -9 14 -55 Q50 -77 49 -39 Q47 -23 84 -13 Q65 9 45 17 Q42 50 11 47 Q-24 27 -79 20Z",
        gradient(c, "#ffd0d7", "#a5eee3", "#60cabe"),
        "#ce91aa",
      );
      line(c, "M-60 10 Q5 0 45 -29 M4 0 Q30 9 50 0", "#e6fff3", 4);
      break;
    case "peel":
      shape(
        c,
        "M-82 -40 Q-23 -47 6 -26 Q26 -15 49 -23 L65 -42 85 -36 81 -13 Q53 12 0 24 Q-35 47 -80 42Z",
        gradient(c, "#fff2a0", primary, "#c59724"),
        peelRim,
        5,
      );
      shape(
        c,
        "M47 -22 L65 -42 85 -36 81 -13 58 -1Z",
        "#784528",
        "#4d2b1c",
        4,
      );
      shape(c, "M65 -42 L85 -36 77 -28 58 -33Z", "#b6804d", "#4d2b1c", 3);
      line(c, "M65 -22 L74 -14", "#9d6038", 3);
      break;
    case "matcha":
      line(c, "M-80 0 Q-7 10 33 -10", "#72834c", 15);
      silhouette(c, "M-10 8 Q-7 -47 75 -60 Q68 0 -10 8Z", "#92c785", "#58774e");
      silhouette(c, "M-10 8 Q28 -12 67 37 Q14 51 -10 8Z", "#b6d791", "#58774e");
      line(c, "M-5 4 Q39 -30 58 -43 M0 12 L49 31", "#e0ebb0", 3);
      break;
    case "espresso":
      line(c, "M-78 0 L-25 0", "#754833", 22);
      oval(c, 13, 0, 61, 41, glaze(c, "#cd9164", "#895638", "#4b302b"), -0.38);
      line(c, "M-34 21 C-3 -14 22 16 59 -23", "#442a27", 7);
      line(c, "M-27 17 C-1 -7 23 17 50 -15", "#daa474", 2);
      break;
    case "candy":
      line(c, "M-81 0 H20", "#bd906d", 14);
      line(c, "M-81 -2 H20", cream, 8);
      oval(c, 22, 0, 53, 53, glaze(c, "#fff2e3", "#ffacc6", "#c97faa"));
      line(
        c,
        "M25 0 C32 -7 17 -16 11 -3 C2 18 38 25 44 0 C53 -37 1 -43 -10 -10 C-27 37 46 58 66 9",
        "#fff2c3",
        8,
      );
      break;
    case "shinobi":
      line(c, "M-78 0 H0", gold, 18);
      silhouette(c, "M-19 0 L8 -30 87 0 8 30Z", "#74829a");
      shape(c, "M-16 0 L8 -28 81 0Z", "#d6deea");
      line(c, "M-18 -20 V20", gold, 6);
      break;
    case "blaze":
      silhouette(
        c,
        "M-80 -35 Q-35 -38 -4 -64 Q-8 -37 23 -37 Q54 -41 82 -61 Q72 -22 40 -8 Q59 -10 87 -17 Q58 27 19 34 Q27 40 41 44 Q-21 70 -78 35Z",
        "#e95122",
        "#ac3721",
      );
      shape(
        c,
        "M-78 -14 Q-41 -12 -11 -42 Q-13 -20 13 -22 L60 -40 Q48 -12 11 2 L50 -2 Q14 36 -64 36Z",
        "#ffae2e",
      );
      shape(
        c,
        "M-76 3 Q-48 4 -23 -14 L-32 -1 13 -9 Q-18 18 -74 21Z",
        "#fff49e",
      );
      break;
    case "astral":
      line(c, "M-82 0 L13 0", "#c8a9e6", 11);
      silhouette(
        c,
        "M-25 -6 L4 -19 13 -56 31 -22 65 -30 53 -5 84 6 43 19 30 48 12 22 -19 26 -5 9Z",
        gradient(c, cream, gold, "#b598dc"),
        "#736189",
      );
      shape(c, "M13 -53 L24 2 63 -28 42 -6 80 6 24 7 30 44 13 20Z", "#fff5c6");
      break;
    case "monarch":
      line(c, "M-81 0 L14 0", "#ac834a", 20);
      line(c, "M-79 -4 L14 -4", gold, 6);
      silhouette(
        c,
        "M-9 -18 Q10 -38 34 -26 L78 0 Q49 9 33 27 Q11 39 -9 18 L0 5 -18 10 -18 -10 0 -5Z",
        gradient(c, gold, "#9c743b", gold),
        "#554235",
      );
      shape(c, "M4 0 Q9 -30 35 -17 L63 0 34 17 Q9 28 4 0Z", "#373044");
      star(c, 23, 0, 10, gold);
      break;
  }
}

// Paired appendages sit behind the face so the ear roots and paw joints
// disappear under the cheek. Each path describes the positive-Y side.
export function paintOrnaments(c: Brush, def: SkinDef) {
  plate(c);
  for (const side of [-1, 1]) {
    c.save();
    c.scale(1, side);
    const { id, primary, secondary } = def;
    switch (id) {
      case "cotton":
        silhouette(
          c,
          "M-37 27 C-59 38 -89 64 -78 79 C-66 93 -24 64 -9 34Z",
          "#fff7f1",
          "#917987",
        );
        line(c, "M-69 72 Q-50 59 -33 45", "#f0b5bd", 9);
        break;
      case "mochi":
      case "kitsune":
        silhouette(
          c,
          "M-45 24 Q-59 43 -58 78 Q-27 71 -5 38Z",
          id === "mochi" ? "#e5b385" : primary,
          "#835947",
        );
        shape(
          c,
          "M-49 66 L-45 38 -20 44Z",
          id === "mochi" ? "#edaaa4" : "#68423e",
        );
        if (id === "kitsune")
          shape(
            c,
            "M-29 34 L8 46 1 58 16 55 6 68 -32 55 -26 63 -44 56Z",
            cream,
            "#97694d",
          );
        break;
      case "boba":
        oval(c, -32, 48, 25, 23, "#765647");
        oval(c, -32, 48, 21, 19, "#d5a179");
        oval(c, -30, 47, 11, 10, "#a97766");
        break;
      case "axolotl":
        for (let j = 0; j < 3; j++) {
          c.save();
          c.translate(-40 + j * 23, 32);
          c.rotate((1 - j) * 0.35);
          silhouette(
            c,
            "M-6 0 Q-11 14 -8 24 L-14 19 -10 31 -15 28 Q-14 39 -2 48 Q9 42 10 30 L5 32 11 18 5 22 Q11 9 5 0Z",
            "#f497ac",
            "#b56786",
            2,
          );
          line(c, "M0 4 Q-3 25 -2 40", "#ffd3ca", 3);
          c.restore();
        }
        break;
      case "peel":
        silhouette(
          c,
          "M-46 19 Q-50 47 -68 64 Q-60 77 -38 70 Q-12 57 11 32Z",
          gradient(c, "#fff3a5", "#ffdc54", "#e5a62f"),
          peelRim,
          5,
        );
        line(c, "M-54 64 Q-27 51 -14 35", "#fff4b0", 5);
        break;
      case "cobalt":
        silhouette(
          c,
          "M-44 24 L-75 66 -36 58 -42 69 -3 51 13 30Z",
          gradient(c, primary, "#478da9", "#203e62"),
        );
        line(c, "M-63 58 L-32 45 -37 54 -13 42", "#95f6fa", 4);
        break;
      case "shinobi":
        silhouette(
          c,
          "M-31 26 Q-46 43 -65 44 L-85 61 -64 60 -68 70 Q-31 67 -12 34Z",
          primary,
        );
        line(c, "M-65 55 L-32 38", gold, 3);
        break;
      case "blaze":
        silhouette(
          c,
          "M-25 27 Q-48 38 -64 35 Q-51 52 -66 60 Q-79 68 -84 80 Q-62 71 -45 74 Q-19 71 -2 40Z",
          "#ff9229",
          "#ab3a28",
        );
        shape(c, "M-23 39 Q-37 59 -57 66 Q-46 54 -50 48Z", "#fff399");
        break;
      case "astral":
        silhouette(
          c,
          "M-35 29 Q-65 41 -70 79 Q-54 61 -41 64 Q-22 65 -8 37Z",
          gradient(c, gold, "#ac8adb", "#52428b"),
        );
        line(c, "M-53 53 L-41 58 M-43 44 L-30 52", gold, 3);
        break;
      case "monarch":
        silhouette(
          c,
          "M-44 25 L-61 62 -39 54 -44 73 -18 55 -5 58 9 33Z",
          secondary,
          "#b89751",
        );
        line(c, "M-48 53 L-30 43 -33 55 -11 40", gold, 3);
        break;
      case "candy":
        silhouette(
          c,
          "M-41 28 L-58 59 -45 55 -42 67 -33 59 -22 64 -17 36Z",
          "#c4b8ee",
          "#a586b5",
        );
        line(c, "M-32 38 L-43 54", "#fff0da", 3);
        break;
    }
    if (["cotton", "mochi", "boba"].includes(id)) {
      oval(c, 13, 55, 16, 13, "#a78482", -0.4);
      oval(c, 14, 53, 15, 12, id === "boba" ? "#e4b58e" : cream, -0.4);
      line(c, "M15 61 l2 -5 M21 59 l2 -4", "#c99f91", 2);
    }
    c.restore();
  }
}

const cheek =
  "M-83 0 C-83 -44 -51 -67 -12 -67 Q28 -72 60 -52 Q86 -36 84 -8 Q90 28 69 48 Q41 72 -6 68 Q-79 73 -83 0Z";
const snout =
  "M-84 0 Q-88 -64 -39 -68 Q3 -78 33 -52 L65 -34 Q88 -27 87 0 Q89 25 65 34 L33 52 Q-9 79 -46 65 Q-85 58 -84 0Z";
function smile(c: Brush, width: number, depth: number, color = "#674550") {
  line(c, `M51 ${-width} q${depth} ${width} 0 ${width * 2}`, color, 4);
}
function muzzle(c: Brush, nose: string) {
  oval(c, 49, 0, 21, 25, "#fff1d5");
  shape(c, "M40 -7 Q37 -11 37 0 T40 7 L46 2 Q49 0 46 -2Z", nose);
  line(c, "M46 0 Q62 -9 49 -16 M46 0 Q62 9 49 16", "#67424a", 4);
}
export function paintHead(c: Brush, def: SkinDef) {
  plate(c);
  const { id, primary, secondary } = def;
  const angular = ["emerald", "kitsune", "cobalt", "blaze", "monarch"].includes(
    id,
  );
  const tones: Record<string, string[]> = {
    cotton: ["#ffffff", "#fffaf1", "#e8cdd1"],
    mochi: [cream, "#ffe5be", "#d6aa8c"],
    axolotl: ["#dafff1", "#9feade", "#69bfb7"],
    peel: [cream, "#fff3cc", "#f1d58b"],
    shinobi: ["#516487", "#293757", "#192339"],
    astral: ["#a48ee6", "#7054ae", "#3a2c62"],
    monarch: ["#736881", "#484154", "#282530"],
    candy: ["#fff0d7", "#ffb8cb", "#df91b8"],
  };
  const rim = id === "monarch" ? monarchRim(c) : id === "shinobi" ? shinobiRim : ink;
  silhouette(
    c,
    angular ? snout : cheek,
    gradient(c, ...(tones[id] ?? [primary, primary, secondary])),
    rim,
    id === "monarch" || id === "shinobi" ? 5 : 3,
  );
  switch (id) {
    case "emerald":
      shape(c, "M-72 0 L-49 -23 -24 0 -49 23Z", "#89d770", "#367e50");
      for (const side of [-1, 1]) {
        c.save();
        c.scale(1, side);
        shape(c, "M29 27 Q57 24 67 36 L56 51 48 35Z", cream, "#52724b");
        oval(c, 62, 12, 4, 3, "#30593e");
        c.restore();
      }
      break;
    case "cotton":
    case "mochi":
    case "peel":
    case "kitsune":
      if (id === "mochi") {
        shape(
          c,
          "M-67 -39 Q-53 -68 -12 -63 Q9 -53 -9 -30 Q-21 -17 -42 -24Z",
          "#ca8757",
        );
        shape(
          c,
          "M-61 28 Q-53 10 -32 17 Q-16 30 -25 51 Q-44 66 -58 48Z",
          "#79605a",
        );
      }
      if (id === "peel") {
        shape(
          c,
          "M-78 17 L-83 -12 -63 -50 -51 -31 Q-62 -4 -51 22 L-61 48Z",
          "#ffe06c",
          peelRim,
          4,
        );
        shape(c, "M-49 -34 L-60 -60 -25 -54Z", cream, "#be9b70");
        shape(c, "M-49 34 L-60 60 -25 54Z", cream, "#be9b70");
      }
      if (id === "kitsune") {
        shape(
          c,
          "M-53 -49 Q-4 -45 20 -18 L51 0 20 18 Q-3 46 -53 49 Q-15 69 22 47 L70 18 Q87 0 70 -18 L22 -47 Q-15 -69 -53 -49Z",
          cream,
        );
      }
      for (const side of [-1, 1]) {
        c.save();
        c.scale(1, side);
        oval(c, 41, 42, 7, 12, id === "kitsune" ? "#edb48a" : "#f3bcc0", 0.3);
        line(c, "M42 48 l-2 13 M48 46 l4 12", "#a88379", 2.4);
        c.restore();
      }
      muzzle(c, id === "kitsune" ? "#48343c" : "#c7828b");
      if (id === "cotton") {
        shape(
          c,
          "M52 -5 L65 -5 Q68 -2 65 0 Q68 3 65 5 L52 5Z",
          "#fffdf2",
          "#ab8a8c",
          2,
        );
      }
      break;
    case "boba":
      muzzle(c, "#513737");
      oval(c, -33, -14, 10, 4, "#e4bc94", -0.4);
      oval(c, -30, 8, 8, 3, "#e4bc94", 0.2);
      break;
    case "axolotl":
      oval(c, 36, -48, 9, 12, "#f6b1b6");
      oval(c, 36, 48, 9, 12, "#f6b1b6");
      shape(c, "M47 -19 Q55 0 47 19 Q74 12 64 -5 Q59 -15 47 -19Z", "#79505f");
      oval(c, 59, 4, 4, 8, "#eba4ab");
      for (const y of [-16, 0, 16]) oval(c, -38, y, 3, 4, "#83cabe");
      break;
    case "citrus": {
      oval(c, -47, 6, 23, 25, "#a9602855", 0.45);
      const leaf = c.createLinearGradient(-64, -22, -43, 24);
      leaf.addColorStop(0, "#c1dd71");
      leaf.addColorStop(0.48, "#80ad45");
      leaf.addColorStop(1, "#527c36");
      shape(c, "M-36 -16 Q-70 -31 -73 21 Q-38 33 -36 -16Z", leaf, "#52682c", 3);
      line(c, "M-42 -13 Q-51 5 -66 17 M-54 4 L-63 2", "#ddec95", 2.5);
      smile(c, 13, 17);
      star(c, -30, -36, 9, cream);
      break;
    }
    case "cobalt":
      shape(
        c,
        "M-79 -6 L-42 -42 -11 -33 8 0 -11 33 -42 42 -79 6Z",
        "#233653",
        "#8bd9ea",
      );
      line(c, "M-57 -19 L-33 0 -57 19 M-37 -20 L-12 0 -37 20", "#79eaff", 5);
      shape(c, "M56 -20 L77 -11 84 0 77 11 56 20 65 0Z", "#d5f3f1");
      break;
    case "matcha":
      shape(
        c,
        "M-27 -2 Q-70 -29 -62 -43 Q-21 -45 -22 -12 Q-4 -44 9 -36 Q11 -9 -27 -2Z",
        "#609455",
      );
      oval(c, 37, -45, 6, 10, "#e6c4a0");
      oval(c, 37, 45, 6, 10, "#e6c4a0");
      smile(c, 13, 15);
      break;
    case "espresso":
      oval(c, -40, 0, 27, 34, "#e4b384");
      line(
        c,
        "M-50 23 Q-78 -17 -45 -26 Q-17 -29 -21 -1 Q-24 15 -39 6 Q-47 1 -40 -6",
        cream,
        5,
      );
      oval(c, 55, 0, 9, 7, "#563a36");
      break;
    case "candy":
      shape(
        c,
        "M-77 -8 Q-47 -67 -21 -52 Q-12 -30 -41 -15 Q-18 -26 -7 -14 Q-10 10 -44 19 Q-21 19 -21 31 Q-41 51 -66 37Z",
        "#fff0c3",
      );
      star(c, -33, -29, 11, "#ffffff");
      smile(c, 12, 16);
      break;
    case "shinobi":
      shape(
        c,
        "M2 -60 Q34 -65 42 -49 Q27 -23 32 0 Q27 23 42 49 Q34 65 2 60 Q8 24 3 0 Q8 -24 2 -60Z",
        "#bd9673",
      );
      shape(
        c,
        "M-62 -51 Q-44 -67 -20 -66 Q-2 0 -20 66 Q-46 68 -62 51 Q-40 0 -62 -51Z",
        "#202b49",
      );
      shape(
        c,
        "M-49 -29 Q-35 -35 -23 -27 Q-15 0 -23 27 Q-39 35 -49 27Z",
        gradient(c, cream, gold, "#b58b49"),
        "#705a38",
      );
      line(c, "M-38 -14 L-28 0 -38 14", "#77603d", 4);
      line(c, "M56 -31 Q69 0 56 31", "#54617c", 3);
      break;
    case "blaze":
      shape(
        c,
        "M-76 -3 L-55 -32 -54 -18 Q-30 -23 -27 -45 Q-7 -17 -19 0 Q-7 17 -27 45 Q-30 23 -54 18 L-57 31Z",
        "#ffcf51",
      );
      shape(
        c,
        "M49 -25 Q59 -8 51 0 Q59 8 49 25 Q87 17 77 0 Q87 -17 49 -25Z",
        "#783329",
      );
      shape(c, "M52 -23 L67 -16 57 -11Z M52 23 L67 16 57 11Z", cream);
      break;
    case "astral":
      shape(
        c,
        "M-53 -24 Q-20 -32 -18 -3 Q-29 -17 -42 -8 Q-54 5 -38 18 Q-69 9 -53 -24Z",
        gold,
      );
      star(c, -28, 25, 8, cream);
      line(c, "M52 -16 Q62 0 52 16", "#d6b9ed", 3);
      break;
    case "monarch":
      shape(
        c,
        "M-61 -41 L-37 -24 -53 -10 -31 0 -53 10 -37 24 -61 41 -17 31 Q-8 0 -17 -31Z",
        gradient(c, "#fff0ae", gold, "#b38947"),
        "#946d38",
      );
      shape(c, "M-31 0 L-23 -9 -16 0 -23 9Z", "#b86774");
      line(c, "M53 -21 L70 -9 75 0 70 9 53 21", gold, 4);
      break;
  }
}

// Eye plates and independently movable irises share a normalized 96 px tile.
export function paintEye(c: Brush, def: SkinDef, pupil: boolean) {
  c.translate(48, 48);
  const dark = "#372d3b";
  const { id, eyeStyle: style } = def;
  if (id === "kitsune") {
    if (pupil) {
      shape(c, "M0 -27 Q17 0 0 27 Q-17 0 0 -27Z", "#45282a");
      oval(c, -5, -8, 7, 5, "#fff0c6");
    } else {
      const amber = c.createLinearGradient(0, -30, 0, 31);
      amber.addColorStop(0, "#fff1af");
      amber.addColorStop(0.55, "#efab48");
      amber.addColorStop(1, "#b56029");
      shape(c, "M-33 26 Q-28 -10 -6 -24 Q13 -31 29 -12 Q26 20 -33 26Z", amber, "#67382c", 6);
      line(c, "M-33 26 Q-27 -11 -7 -23", "#542d29", 8);
    }
    return;
  }
  if (pupil) {
    switch (style) {
      case "happy":
      case "hollow":
        return;
      case "slit":
        oval(c, 0, 0, 17, 39, dark);
        break;
      case "visor":
        line(c, "M-14 -25 L12 22", "#bbffff", 11);
        return;
      case "starry":
        star(c, 0, 0, 38, "#fff1b7");
        return;
      case "luminous":
        star(c, 0, 0, 41, "#fffeda");
        return;
      case "regal":
        shape(c, "M0 -37 L26 0 0 37 -26 0Z", dark);
        break;
      case "jitter":
        oval(c, 0, 0, 20, 21, dark);
        break;
      case "fierce":
        oval(c, 0, 0, 22, 26, dark);
        break;
      default:
        oval(c, 0, 0, 36, 38, dark);
    }
    oval(c, -9, -9, 8, 7, "#fffaf1");
    return;
  }
  switch (style) {
    case "happy":
      line(c, "M15 -31 Q-27 0 15 31", dark, 12);
      break;
    case "hollow":
      shape(c, "M-32 -38 Q-41 9 20 39 Q45 4 21 -23Z", "#fff5a4", "#a84725", 5);
      break;
    case "visor":
      shape(
        c,
        "M-32 -41 Q-42 1 -30 41 L24 34 32 -30Z",
        "#49c4df",
        "#172e4c",
        8,
      );
      line(c, "M-24 -28 L-22 30", "#9cf6fe", 5);
      break;
    case "fierce":
      shape(c, "M-32 -38 L-6 41 Q47 20 26 -22Z", "#ffdc81", dark, 5);
      break;
    case "slit":
      oval(c, 0, 0, 34, 45, dark);
      oval(c, 0, 0, 28, 39, "#e3f29d");
      break;
    case "cozy":
      oval(c, 0, 0, 33, 35, "#785749");
      oval(c, 3, 0, 28, 31, "#f9e4c4");
      line(c, "M-23 -21 Q-34 0 -22 19", "#654b48", 5);
      break;
    case "chibi":
    case "starry":
    case "button":
      oval(
        c,
        0,
        0,
        style === "button" ? 32 : 37,
        style === "button" ? 33 : 42,
        dark,
      );
      oval(c, 12, 4, 13, 20, style === "starry" ? "#9a74a5" : "#7d5761");
      oval(c, -13, -12, 10, 11, "#fffdf6");
      oval(c, 11, 14, 4, 4, "#ffe1d1");
      break;
    case "luminous":
      oval(c, 0, 0, 38, 43, "#514271");
      oval(c, 0, 0, 31, 36, "#a6e2f2");
      break;
    case "regal":
      shape(c, "M-30 -37 Q-47 6 0 43 Q46 21 32 -18Z", "#f8d683", "#957748", 5);
      break;
    case "jitter":
      oval(c, 0, 0, 37, 40, "#624235");
      oval(c, 2, 0, 32, 35, "#e7c29c");
      line(c, "M-30 -23 Q-39 -1 -31 18", "#805947", 3);
      break;
    case "wide":
      oval(c, 0, 0, 43, 46, dark);
      oval(c, 0, 0, 38, 41, "#fffdf0");
      break;
  }
}

// Small dorsal accents occupy the exposed back of a link. Peel's seam
// is continuous and already painted directly into its body.
const accents: Record<string, string> = {
  emerald: "M-13 0 L0 -10 14 0 0 10Z",
  cotton: "M-15 4 Q-9 -9 -1 -3 Q7 -13 15 -3",
  citrus: "M-10 0 L-2 -2 0 -11 3 -2 11 0 3 3 0 11 -2 3Z",
  cobalt: "M-10 -13 L3 0 -10 13",
  kitsune: "M-12 -8 Q0 -9 12 -15 M-13 2 L8 -2",
  mochi: "M-8 -9 l10 4 M-11 0 l12 4",
  axolotl: "M-8 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0",
  matcha: "M-7 -6 l5 2 M1 5 l5 -2",
  candy: "M-13 3 Q-7 -6 3 -6",
  shinobi: "M-10 -6 l9 8 10 -9",
  blaze: "M-13 6 Q-7 1 -5 -8 Q0 -4 1 -9 Q13 5 -13 6Z",
  astral: "M-13 5 L-4 -4 3 2 13 -8",
  monarch: "M-10 -10 L-4 -4 4 -11 2 0 4 11 -4 4 -10 10Z",
};
export function paintMark(c: Brush, def: SkinDef) {
  c.translate(48, 48);
  const path = accents[def.id];
  if (!path) return;
  c.scale(2, 2);
  c.lineJoin = c.lineCap = "round";
  line(c, path, def.secondary + "88", 3);
  line(c, path, def.id === "monarch" ? gold : "#fff2cfad", 1.7);
}
