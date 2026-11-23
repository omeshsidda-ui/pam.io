import { angleDiff, BOOST, SPEED, STEP } from "../config";
import type { Snake } from "../types";
import { BodyTrail } from "./bodyTrail";
const trails = new WeakMap<Snake, BodyTrail>();
export const width = (s: Snake) =>
  Math.min(38, 9 + 2.6 * Math.log1p(s.mass / 18));
// Keep the input target immediate, but cap heading changes so the body follows
// a broad, readable arc. Scaling by body width gives larger snakes proportionally
// wider turns without changing their forward speed.
export const turnRate = (s: Snake) => 84 / width(s);
export function move(s: Snake) {
  const w = width(s),
    n = Math.min(280, Math.floor(12 + s.mass / 5));
  let trail = trails.get(s);
  // The world and lobby lay out the initial body after its first move.
  if (!trail && s.body.length) {
    trail = new BodyTrail(s.body);
    trails.set(s, trail);
  }
  while (s.body.length < n) {
    const tail = s.body.at(-1) ?? s;
    s.body.push({ x: tail.x, y: tail.y });
    s.old.push({ x: tail.x, y: tail.y });
  }
  s.body.length = s.old.length = n;
  s.body.forEach((p, i) => {
    s.old[i].x = p.x;
    s.old[i].y = p.y;
  });
  s.prevA = s.a;
  const error = angleDiff(s.aim, s.a);
  const correction =
    1 + 0.25 * Math.max(0, 1 - Math.abs(error) / (Math.PI / 3));
  const maxTurn = STEP * turnRate(s) * correction;
  s.a += Math.max(-maxTurn, Math.min(maxTurn, error));
  if (s.mass < 35) s.boost = false;
  const d = SPEED * STEP * (s.boost ? BOOST : 1);
  s.x += Math.cos(s.a) * d;
  s.y += Math.sin(s.a) * d;
  s.body[0].x = s.x;
  s.body[0].y = s.y;
  if (trail) {
    trail.append(s);
    trail.sample(s.body, w * 0.64);
  }
}
