export function playZoom(mass: number, w: number, h: number) {
  // Frame the same stretch of arena on a large monitor as on a laptop.
  // Compact phones need a wider field relative to their shorter edge.
  const base = Math.max(0.78, Math.min(w, h) / 760);
  const growth = Math.log1p(Math.max(0, mass - 65) / 360);
  return base * Math.max(0.73, 1 / (1 + 0.15 * growth));
}

export function framingMass(previous: number, mass: number) {
  // Ignore small pickups and short boosts. Move the framing reference only
  // by the amount outside the band, so crossing it introduces no zoom step.
  const band = Math.max(12, mass * 0.045);
  return Math.max(mass - band, Math.min(previous, mass + band));
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
