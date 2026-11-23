import type { Point } from "../types";
import { SPEED, STEP } from "../config";

// Keep enough head history for a 280-link snake at maximum width, even
// at cruising speed. Each fixed tick adds exactly one sample.
const capacity = Math.ceil((280 * 38 * 0.64) / (SPEED * STEP)) + 282;
export class BodyTrail {
  private x = new Float64Array(capacity);
  private y = new Float64Array(capacity);
  private distance = new Float64Array(capacity);
  private count = 0;
  private head = capacity - 1;

  constructor(body: Point[]) {
    for (let i = body.length - 1; i >= 0; i--) this.append(body[i]);
  }

  append(p: Point) {
    const last = this.head;
    const step = this.count
      ? Math.hypot(p.x - this.x[last], p.y - this.y[last])
      : 0;
    if (this.count && !step) return;
    this.head = (last + 1) % capacity;
    this.x[this.head] = p.x;
    this.y[this.head] = p.y;
    this.distance[this.head] = this.distance[last] + step;
    this.count = Math.min(this.count + 1, capacity);
  }

  sample(body: Point[], spacing: number) {
    let newer = this.head;
    let remaining = this.count - 1;
    for (let i = 1; i < body.length; i++) {
      const target = this.distance[this.head] - i * spacing;
      let older = (newer + capacity - 1) % capacity;
      while (remaining && this.distance[older] > target) {
        newer = older;
        older = (newer + capacity - 1) % capacity;
        remaining--;
      }
      if (!remaining) older = newer;
      const t = remaining
        ? (this.distance[newer] - target) /
          (this.distance[newer] - this.distance[older])
        : 0;
      body[i].x = this.x[newer] + (this.x[older] - this.x[newer]) * t;
      body[i].y = this.y[newer] + (this.y[older] - this.y[newer]) * t;
    }
  }
}
