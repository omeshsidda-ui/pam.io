export const CHARGE_SECONDS = 2.5;
export const R = 2300,
  FOOD = 1100,
  BOTS = 32,
  STEP = 1 / 60,
  SPEED = 198,
  BOOST = 1.75,
  SECTORS = 20;
export const skins = [
  ["Viper", "#cddf6c", "#547e46", "fang"],
  ["Bubblegum", "#ed8099", "#a24b6f", "bubble"],
  ["Glacier", "#91d7d5", "#357d89", "fin"],
  ["Inferno", "#f79669", "#ad5035", "horn"],
  ["Ultraviolet", "#b094db", "#705187", "crest"],
  ["Bumble", "#f9ca57", "#8b672b", "antenna"],
  ["Lagoon", "#73d5b0", "#237c6b", "frill"],
  ["Galaxy", "#c397cc", "#65527f", "star"],
  ["Dragon", "#92bb77", "#396957", "antler"],
  ["Lava", "#f5a254", "#a94439", "spike"],
  ["Frost", "#d1e4e0", "#628e9c", "mask"],
  ["Prism", "#f3a6a1", "#97729b", "prism"],
];
export const names =
  "PixelPilot NeonNoodle Mochi GhostByte Zippy LimeTime Orbit HexKid Nova Slippy ByteMe NoodleKing DotDash Vortex Ripple Slinky NightOwl Echo JellyBean Blaze Toast Glitch Nimbus ZigZag Hydra Spark Drift Koji Loopz Kiki Rook Mango".split(
    " ",
  );
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const angleDiff = (a: number, b: number) =>
  Math.atan2(Math.sin(a - b), Math.cos(a - b));
