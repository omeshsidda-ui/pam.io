// Painted once into the sprite cache. Coordinates use a 192-pixel artboard.
type Brush = CanvasRenderingContext2D;
function shape(c: Brush, d: string, fill: string, edge?: string, weight = 2) {
  const p = new Path2D(d);
  c.fillStyle = fill;
  c.fill(p);
  if (edge) {
    c.lineWidth = weight;
    c.strokeStyle = edge;
    c.stroke(p);
  }
}
function line(c: Brush, d: string, color: string, weight: number) {
  c.lineWidth = weight;
  c.strokeStyle = color;
  c.stroke(new Path2D(d));
}
function dot(c: Brush, x: number, y: number, r: number, color: string) {
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}
export function material(c: Brush, id: string, band: number) {
  c.save();
  c.beginPath();
  c.arc(96, 96, 91, 0, 7);
  c.clip();
  c.lineJoin = c.lineCap = "round";
  if (id === "fang" || id === "antler" || id === "frill") {
    const dragon = id === "antler",
      pitch = dragon ? 37 : 27;
    for (let row = -1; row < 9; row++)
      for (let col = -1; col < 9; col++) {
        c.save();
        c.translate(col * pitch + ((row % 2) * pitch) / 2, row * pitch * 0.68);
        c.scale(pitch / 30, pitch / 30);
        shape(
          c,
          "M0 0 Q14 -8 29 0 Q26 13 14 20 Q3 14 0 0Z",
          dragon ? "#17463545" : "#22564720",
          "#193b302b",
          1.8,
        );
        line(c, "M3 2 Q11 0 22 0", dragon ? "#fff3ac91" : "#f2ffd26b", 2.2);
        c.restore();
      }
  } else if (id === "spike" || id === "horn") {
    const seam =
      "M-4 38 L42 65 65 52 88 93 74 122 105 149 109 202 M86 92 L129 83 149 39 198 48 M74 122 L30 136 14 162";
    line(c, seam, "#622d2b", 12);
    line(c, seam, "#ffae3f", 7);
    line(c, seam, "#fff0a7", 2.4);
    shape(
      c,
      "M100 1 L162 17 144 35 124 75 99 76 80 42Z",
      id === "spike" ? "#352a3ebb" : "#932e222f",
    );
  } else if (id === "star" || id === "crest") {
    const nebula = c.createRadialGradient(123, 65, 3, 112, 80, 105);
    nebula.addColorStop(0, "#bba0f587");
    nebula.addColorStop(0.5, "#7154b76b");
    nebula.addColorStop(1, "#1e214c99");
    c.fillStyle = nebula;
    c.fillRect(0, 0, 192, 192);
    line(c, "M24 108 L64 61 98 79 137 37 173 66", "#e3c7ff95", 2);
    for (let i = 0; i < 25; i++) {
      const x = (i * 61 + band * 18) % 185,
        y = (i * i * 11 + 23) % 190;
      dot(c, x, y, i % 4 === 0 ? 3 : 1.5, "#fff2da");
    }
    shape(
      c,
      "M137 23 L140 33 151 37 140 40 137 51 134 41 124 37 134 33Z",
      "#fff7d9",
    );
  } else if (id === "fin" || id === "prism" || id === "mask") {
    const facets = [
      "M0 19 L68 4 48 70 0 117Z",
      "M68 4 L145 8 109 39 48 70Z",
      "M48 70 L109 39 92 116Z",
      "M109 39 L191 52 145 102 92 116Z",
      "M92 116 L145 102 158 176Z",
      "M0 117 L48 70 92 116 34 171Z",
    ];
    const colors =
      id === "prism"
        ? [
            "#688fc19c",
            "#b5fbdeaa",
            "#ffd78c99",
            "#a186ccaa",
            "#ffb8beab",
            "#80cadb99",
          ]
        : [
            "#417b9860",
            "#edffffac",
            "#b5f8ff88",
            "#488cb466",
            "#f5ffff99",
            "#7ac3d98a",
          ];
    facets.forEach((d, i) => shape(c, d, colors[i], "#f2ffff50", 1.4));
    line(c, "M20 148 L47 72 108 39 M145 102 L92 116", "#f4ffffa6", 2);
  } else if (id === "bubble") {
    for (const [x, y, r] of [
      [49, 54, 24],
      [120, 94, 29],
      [64, 146, 15],
      [153, 49, 11],
    ]) {
      const pearl = c.createRadialGradient(
        x - r * 0.4,
        y - r * 0.5,
        1,
        x,
        y,
        r,
      );
      pearl.addColorStop(0, "#fff7e6");
      pearl.addColorStop(0.35, "#f7bce5");
      pearl.addColorStop(0.75, "#d782b0");
      pearl.addColorStop(1, "#aa659a");
      c.fillStyle = pearl;
      c.beginPath();
      c.arc(x, y, r, 0, 7);
      c.fill();
      dot(c, x - r * 0.3, y - r * 0.4, r * 0.16, "#fff9eb");
    }
  } else if (id === "antenna") {
    for (let i = 0; i < 54; i++) {
      const x = (i * 37) % 192,
        y = (i * 67) % 192;
      line(c, `M${x} ${y}q5 -6 11 -5`, band ? "#e9ba7b40" : "#fff1a169", 2.4);
    }
  }
  c.restore();
}

// Lay large facial markings first. Fine lines follow their contours so the
// design still reads at arena size and reveals more detail in the shop.
export function facePaint(c: Brush, id: string) {
  c.save();
  c.lineJoin = c.lineCap = "round";
  for (const side of [-1, 1]) {
    c.save();
    c.translate(0, 96);
    c.scale(1, side);
    switch (id) {
      case "antler":
        shape(
          c,
          "M20 5 Q49 10 58 42 L85 27 109 47 158 29 141 12 98 5 65 -2Z",
          "#23604f",
          "#253f37",
          3,
        );
        line(c, "M29 9 L57 34 83 20 106 36 139 26", "#ffe196", 5);
        dot(c, 163, 13, 3.6, "#173b30");
        break;
      case "fang":
        shape(c, "M18 13 L69 20 92 44 147 33 120 54 83 53 61 31Z", "#466c32");
        line(c, "M45 17 L70 24 91 40", "#edff9a", 4);
        shape(c, "M159 18 L175 23 163 40Z", "#ffefcb", "#596635", 2);
        break;
      case "bubble":
        shape(
          c,
          "M10 9 Q51 -18 79 12 Q91 35 120 17 Q141 5 175 13 Q154 40 126 46 Q100 44 79 29 Q43 3 10 17Z",
          "#ffe0da",
        );
        dot(c, 143, 29, 8, "#ee8e9c");
        dot(c, 141, 26, 2, "#fff8ec");
        break;
      case "fin":
      case "prism":
        shape(
          c,
          "M16 5 L59 8 89 49 52 38Z",
          id === "fin" ? "#428fa8" : "#9373ad",
        );
        shape(
          c,
          "M59 8 L87 3 114 27 89 49Z",
          id === "fin" ? "#ddffff" : "#ffe0ae",
        );
        line(c, "M19 6 L58 10 88 46 111 28", "#f7fffb", 3);
        break;
      case "horn":
      case "spike":
        shape(
          c,
          "M18 8 L62 5 77 25 99 15 149 33 112 47 75 42 51 20Z",
          id === "horn" ? "#913c39" : "#483143",
          "#562e39",
          2,
        );
        line(c, "M27 9 L60 13 75 30 98 23 133 32", "#ffb549", 5);
        line(c, "M61 13 L76 30 97 23", "#fff4a8", 2);
        break;
      case "crest":
      case "star":
        shape(c, "M17 4 Q57 3 86 18 Q124 50 164 20 Q134 66 86 42Z", "#413463");
        line(c, "M29 8 Q56 6 87 23 Q125 54 155 28", "#c78de5", 4);
        for (const [x, y] of [
          [46, 13],
          [73, 21],
          [96, 35],
          [147, 35],
        ])
          dot(c, x, y, 2.5, "#fff3ce");
        break;
      case "antenna":
        shape(c, "M23 8 Q61 4 81 28 L108 42 89 50 58 30Z", "#4c3631");
        line(c, "M29 13 Q61 10 81 31", "#ffe3a4", 3);
        break;
      case "frill":
        shape(
          c,
          "M22 8 Q44 13 72 43 Q91 38 105 20 Q81 34 70 23 Q46 2 22 8Z",
          "#f8abb1",
          "#aa687f",
          2,
        );
        line(c, "M29 9 Q50 15 72 34", "#ffddd2", 3);
        break;
      case "mask":
        shape(
          c,
          "M12 14 Q53 19 80 41 L111 24 Q141 1 181 13 Q161 47 121 44 L87 66 81 51 46 45 55 37Z",
          "#fff7eb",
          "#a8bec2",
          2,
        );
        break;
    }
    c.restore();
  }
  c.restore();
}

// Side pieces share an anchor behind the cheeks. A dark rim keeps the outer
// contour legible against both arena floors at the smallest playing size.
export function headSilhouette(
  c: Brush,
  id: string,
  light: string,
  dark: string,
) {
  c.lineJoin = c.lineCap = "round";
  for (const side of [-1, 1]) {
    c.save();
    c.translate(96, 96);
    c.scale(1, side);
    switch (id) {
      case "mask": // Frost fox, with a folded ear and snow-white tips.
        shape(
          c,
          "M-48 17 Q-64 40 -54 79 Q-29 74 -5 37Z",
          "#e4f2ee",
          "#344d5c",
          4,
        );
        shape(c, "M-48 37 L-50 66 Q-33 59 -19 41Z", "#b08b9c");
        break;
      case "bubble": // Rounded rabbit ears with a dipped candy stripe.
        shape(
          c,
          "M-49 24 C-68 49 -77 78 -60 80 C-43 83 -22 53 -13 33Z",
          light,
          dark,
          4,
        );
        line(c, "M-56 68 Q-46 55 -35 42", "#ffddd8", 8);
        break;
      case "antler":
        shape(
          c,
          "M-16 24 Q-42 34 -54 49 L-78 54 -63 60 -73 78 -54 71 -37 52 -34 66 -24 56 -18 41 0 32Z",
          "#dfb77a",
          "#594433",
          4,
        );
        line(c, "M-51 55 L-34 42 -17 34", "#fff0bb", 4);
        break;
      case "antenna": // A forewing and a small amber feeler.
        shape(
          c,
          "M-28 21 C-48 31 -83 63 -60 70 Q-37 76 -13 36Z",
          "#ebeece",
          "#71594a",
          4,
        );
        line(c, "M-57 62 L-28 36 M-47 53 L-49 42", "#a6ada1", 3);
        line(c, "M5 29 Q9 54 31 60", "#563b36", 5);
        dot(c, 31, 60, 7, "#ffc558");
        break;
      case "frill":
        shape(
          c,
          "M-46 25 Q-62 33 -71 57 Q-57 61 -40 47 Q-54 70 -40 74 Q-26 71 -17 48 Q-17 62 -8 64 Q2 58 -4 34Z",
          "#ec9da7",
          "#805466",
          3,
        );
        line(c, "M-49 42 L-61 52 M-31 51 L-39 64", "#ffd8bf", 4);
        break;
      case "fin":
      case "prism": {
        const ice = id === "fin";
        shape(
          c,
          "M-50 22 L-72 55 -49 51 -47 73 -24 60 -12 40 3 33Z",
          ice ? "#abf0ed" : "#f7b9ba",
          dark,
          4,
        );
        shape(c, "M-47 69 L-40 49 -14 36 -27 55Z", ice ? "#558eb1" : "#a174b0");
        line(c, "M-63 51 L-40 44 -46 66", "#fffaeb", 3);
        break;
      }
      case "crest":
      case "star":
        if (id === "star") {
          shape(
            c,
            "M-35 29 Q-54 35 -60 58 L-45 51 -45 69 -28 54 -12 55 -18 44 1 34Z",
            "#8176bb",
            "#413761",
            3,
          );
          dot(c, -42, 48, 4, "#fff2ad");
        } else {
          shape(
            c,
            "M-52 20 L-79 52 -46 46 -55 68 -23 52 2 32Z",
            "#454276",
            dark,
            4,
          );
          line(c, "M-61 44 L-34 37 -41 51 -16 39", "#95ffe5", 5);
        }
        break;
      case "horn":
      case "spike":
        shape(
          c,
          "M-36 23 Q-52 29 -62 45 Q-73 57 -74 76 Q-52 61 -38 60 Q-20 56 -9 36Z",
          id === "horn" ? "#e1ba8f" : "#545063",
          "#533a42",
          4,
        );
        line(
          c,
          "M-51 42 L-42 51 M-59 50 L-52 56",
          id === "horn" ? "#986849" : "#ffab62",
          4,
        );
        break;
      case "fang":
        shape(
          c,
          "M-41 20 Q-59 33 -59 58 Q-38 60 -16 45 L2 32Z",
          light,
          dark,
          4,
        );
        shape(c, "M-47 35 L-50 49 -28 42Z", "#415e38");
        break;
    }
    c.restore();
  }
}
