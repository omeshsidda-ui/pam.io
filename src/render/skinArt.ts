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

// Tail fins occupy the taper, behind the last segment. The point at (147,96)
// joins the body; the rest of the silhouette points away from the head.
export function tailPaint(c: Brush, id: string, light: string, dark: string) {
  const silhouettes: Record<string, string> = {
    fang: "M156 95 Q112 66 74 82 Q40 94 17 63 Q32 114 77 112 Q116 104 156 95Z",
    bubble:
      "M153 96 Q116 56 91 86 Q44 49 27 78 Q9 100 39 117 Q69 138 94 107 Q118 129 153 96Z",
    fin: "M153 95 L66 34 72 75 24 62 62 95 25 133 74 119 66 158Z",
    horn: "M159 96 Q98 107 54 145 Q60 113 81 98 Q36 111 16 73 Q52 90 78 72 L66 43 Q108 76 159 96Z",
    crest: "M153 94 L41 36 65 84 27 98 65 110 39 153Z",
    antenna: "M155 96 Q115 64 90 77 L15 98 92 116 Q123 130 155 96Z",
    frill:
      "M155 97 Q117 78 64 36 Q24 19 37 62 Q41 82 73 96 Q34 118 36 145 Q41 172 77 146Z",
    star: "M151 96 L86 80 72 44 63 77 26 91 58 104 60 139 86 112Z",
    antler:
      "M155 96 Q119 63 87 58 L94 81 47 56 57 83 19 76 63 107 81 131 86 111 110 132 109 110Z",
    spike:
      "M157 96 L91 58 93 76 53 48 63 80 17 77 52 103 36 110 84 117 111 139 107 113Z",
    mask: "M155 96 Q115 72 103 59 L102 75 Q68 41 31 65 L44 79 14 89 Q26 111 51 115 L40 123 Q86 145 109 116Z",
    prism: "M156 96 L84 62 63 43 18 96 72 144 89 127Z",
  };
  shape(c, silhouettes[id], light, dark, 4);
  if (id === "fin" || id === "frill" || id === "prism" || id === "crest") {
    line(
      c,
      "M142 96 Q101 92 63 62 M143 97 Q100 97 50 98 M142 98 Q99 108 62 132",
      dark,
      3,
    );
    line(c, "M132 94 Q97 86 71 67", "#fff9ecb0", 2);
  } else if (id === "spike" || id === "horn") {
    shape(c, "M139 96 L96 85 98 94 57 77 75 98 59 99 105 108Z", "#ffd770");
  } else if (id === "mask" || id === "antler") {
    line(c, "M136 97 Q93 103 57 83 M117 99 L88 111", "#fff8d1", 4);
  } else line(c, "M128 92 Q91 78 63 87", "#fff8dfb8", 4);
}
