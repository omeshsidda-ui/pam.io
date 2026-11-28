export type SkinCategory = "Basic" | "Animals" | "Playful" | "Rare";

export const SKIN_CATEGORIES: readonly SkinCategory[] = [
  "Basic",
  "Animals",
  "Playful",
  "Rare",
];

export type EyeStyle =
  | "slit"
  | "chibi"
  | "wide"
  | "visor"
  | "starry"
  | "cozy"
  | "button"
  | "happy"
  | "jitter"
  | "fierce"
  | "hollow"
  | "luminous"
  | "regal";

export interface SkinDef {
  readonly id: string;
  readonly name: string;
  readonly category: SkinCategory;
  readonly primary: string;
  readonly secondary: string;
  readonly beadCount: number;
  readonly beadStride: number;
  readonly cycleHold: number;
  readonly orientedBeads: boolean;
  readonly beadScale: number;
  readonly eyeStyle: EyeStyle;
  readonly eyeX: number;
  readonly eyeY: number;
  readonly eyeSize: number;
  readonly tracksAim: boolean;
}

export const SKINS: readonly SkinDef[] = [
  // Basic (indices 0-3, unlocked from start)
  {
    id: "emerald",
    name: "Emerald",
    category: "Basic",
    primary: "#56d178",
    secondary: "#1d6f4b",
    beadCount: 2,
    beadStride: 1,
    cycleHold: 2,
    orientedBeads: true,
    beadScale: 1.18,
    eyeStyle: "slit",
    eyeX: 0.44,
    eyeY: 0.5,
    eyeSize: 0.78,
    tracksAim: true,
  },
  {
    id: "cotton",
    name: "Cotton",
    category: "Basic",
    primary: "#fffcf5",
    secondary: "#d8b4be",
    beadCount: 2,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.2,
    eyeStyle: "chibi",
    eyeX: 0.5,
    eyeY: 0.43,
    eyeSize: 0.64,
    tracksAim: true,
  },
  {
    id: "citrus",
    name: "Citrus",
    category: "Basic",
    primary: "#ffe14d",
    secondary: "#d96a1c",
    beadCount: 3,
    beadStride: 2,
    cycleHold: 1,
    orientedBeads: false,
    beadScale: 1.16,
    eyeStyle: "wide",
    eyeX: 0.46,
    eyeY: 0.46,
    eyeSize: 0.94,
    tracksAim: true,
  },
  {
    id: "cobalt",
    name: "Cobalt",
    category: "Basic",
    primary: "#22d3ee",
    secondary: "#1a2b56",
    beadCount: 3,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.18,
    eyeStyle: "visor",
    eyeX: 0.44,
    eyeY: 0.46,
    eyeSize: 0.84,
    tracksAim: true,
  },

  // Animals (indices 4-7)
  {
    id: "kitsune",
    name: "Kitsune",
    category: "Animals",
    primary: "#eb7a2d",
    secondary: "#9e3f18",
    beadCount: 2,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.22,
    eyeStyle: "slit",
    eyeX: 0.42,
    eyeY: 0.48,
    eyeSize: 0.74,
    tracksAim: true,
  },
  {
    id: "mochi",
    name: "Mochi",
    category: "Animals",
    primary: "#ffe8c6",
    secondary: "#b87042",
    beadCount: 4,
    beadStride: 1,
    cycleHold: 2,
    orientedBeads: true,
    beadScale: 1.18,
    eyeStyle: "starry",
    eyeX: 0.46,
    eyeY: 0.46,
    eyeSize: 0.76,
    tracksAim: true,
  },
  {
    id: "boba",
    name: "Boba",
    category: "Animals",
    primary: "#c89468",
    secondary: "#6e4228",
    beadCount: 2,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.2,
    eyeStyle: "cozy",
    eyeX: 0.46,
    eyeY: 0.45,
    eyeSize: 0.68,
    tracksAim: true,
  },
  {
    id: "axolotl",
    name: "Axolotl",
    category: "Animals",
    primary: "#6ee7d8",
    secondary: "#ff7a98",
    beadCount: 2,
    beadStride: 1,
    cycleHold: 2,
    orientedBeads: true,
    beadScale: 1.18,
    eyeStyle: "button",
    eyeX: 0.5,
    eyeY: 0.54,
    eyeSize: 0.62,
    tracksAim: true,
  },

  // Playful (indices 8-11)
  {
    id: "peel",
    name: "Peel",
    category: "Playful",
    primary: "#ffe047",
    secondary: "#b98614",
    beadCount: 1,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.18,
    eyeStyle: "chibi",
    eyeX: 0.48,
    eyeY: 0.4,
    eyeSize: 0.58,
    tracksAim: true,
  },
  {
    id: "matcha",
    name: "Matcha",
    category: "Playful",
    primary: "#8ccf7e",
    secondary: "#427c44",
    beadCount: 3,
    beadStride: 1,
    cycleHold: 2,
    orientedBeads: false,
    beadScale: 1.16,
    eyeStyle: "happy",
    eyeX: 0.46,
    eyeY: 0.46,
    eyeSize: 0.72,
    tracksAim: false,
  },
  {
    id: "espresso",
    name: "Espresso",
    category: "Playful",
    primary: "#b67242",
    secondary: "#4b2c20",
    beadCount: 4,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.17,
    eyeStyle: "jitter",
    eyeX: 0.44,
    eyeY: 0.48,
    eyeSize: 0.88,
    tracksAim: true,
  },
  {
    id: "candy",
    name: "Candy",
    category: "Playful",
    primary: "#ff8fb1",
    secondary: "#9b72cf",
    beadCount: 6,
    beadStride: 2,
    cycleHold: 1,
    orientedBeads: false,
    beadScale: 1.16,
    eyeStyle: "starry",
    eyeX: 0.46,
    eyeY: 0.48,
    eyeSize: 0.84,
    tracksAim: true,
  },

  // Rare (indices 12-15)
  {
    id: "shinobi",
    name: "Shinobi",
    category: "Rare",
    primary: "#2a385c",
    secondary: "#e8b84b",
    beadCount: 3,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.2,
    eyeStyle: "fierce",
    eyeX: 0.44,
    eyeY: 0.46,
    eyeSize: 0.78,
    tracksAim: true,
  },
  {
    id: "blaze",
    name: "Blaze",
    category: "Rare",
    primary: "#ff661f",
    secondary: "#9e1c1c",
    beadCount: 4,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.25,
    eyeStyle: "hollow",
    eyeX: 0.46,
    eyeY: 0.47,
    eyeSize: 0.9,
    tracksAim: false,
  },
  {
    id: "astral",
    name: "Astral",
    category: "Rare",
    primary: "#7b52d6",
    secondary: "#ffd978",
    beadCount: 3,
    beadStride: 1,
    cycleHold: 2,
    orientedBeads: true,
    beadScale: 1.2,
    eyeStyle: "luminous",
    eyeX: 0.44,
    eyeY: 0.48,
    eyeSize: 0.82,
    tracksAim: true,
  },
  {
    id: "monarch",
    name: "Monarch",
    category: "Rare",
    primary: "#ffd15c",
    secondary: "#241e30",
    beadCount: 3,
    beadStride: 1,
    cycleHold: 1,
    orientedBeads: true,
    beadScale: 1.22,
    eyeStyle: "regal",
    eyeX: 0.44,
    eyeY: 0.47,
    eyeSize: 0.8,
    tracksAim: true,
  },
];

export const BASIC_SKIN_COUNT = SKINS.filter(
  (s) => s.category === "Basic",
).length;
