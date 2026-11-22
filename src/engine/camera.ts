import { R } from "../config";

export function playZoom(mass: number, w: number, h: number) {
  // Preserve room outside the view even on very large monitors.
  return Math.max(
    0.53,
    Math.min(w, h) / (R * 0.65),
    (Math.min(w, h) < 600 ? 0.79 : 1.08) - Math.log1p(mass / 200) * 0.16,
  );
}
