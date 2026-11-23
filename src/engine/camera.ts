import { R } from "../config";

export function playZoom(mass: number, w: number, h: number) {
  // Preserve room outside the view even on very large monitors.
  return Math.max(
    0.53,
    Math.min(w, h) / (R * 0.65),
    (Math.min(w, h) < 600 ? 0.79 : 1.08) - Math.log1p(mass / 200) * 0.16,
  );
}

// Camera easing is expressed per second so it behaves the same at every
// display refresh rate. This preserves the former 0.035/frame response at
// 60 Hz.
export function cameraEase(dt: number) {
  return 1 - Math.exp(-2.135 * Math.max(0, Math.min(dt, 0.08)));
}

// A smooth, time-based shake avoids the frame-to-frame random jumps that are
// especially visible on high refresh rate displays.
export function cameraShake(time: number, amount: number) {
  return {
    x:
      amount *
      (0.58 * Math.sin(time * 31.7) + 0.27 * Math.sin(time * 47.3 + 1.9)),
    y:
      amount *
      (0.58 * Math.sin(time * 37.1 + 0.8) + 0.27 * Math.sin(time * 53.9 + 2.6)),
  };
}
