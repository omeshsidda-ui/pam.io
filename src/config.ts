export const CHARGE_SECONDS = 2.5;
export const R = 2300,
  FOOD = 1100,
  BOTS = 32,
  STEP = 1 / 60,
  SPEED = 198,
  BOOST = 1.75,
  SECTORS = 20;
export {
  SKINS as skins,
  SKIN_CATEGORIES,
  BASIC_SKIN_COUNT,
  type SkinDef,
  type SkinCategory,
  type EyeStyle,
} from "./skins/roster";
export const names =
  "PixelPilot NeonNoodle Mochi GhostByte Zippy LimeTime Orbit HexKid Nova Slippy ByteMe NoodleKing DotDash Vortex Ripple Slinky NightOwl Echo JellyBean Blaze Toast Glitch Nimbus ZigZag Hydra Spark Drift Koji Loopz Kiki Rook Mango".split(
    " ",
  );
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const angleDiff = (a: number, b: number) =>
  Math.atan2(Math.sin(a - b), Math.cos(a - b));
