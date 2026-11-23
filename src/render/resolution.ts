// Start at display density and reduce arena pixels only under sustained load.
// The HTML interface stays at native density.
export class ArenaResolution {
  private width = 0;
  private height = 0;
  private native = 0;
  private scale = 1;
  private frames = 0;
  private late = 0;
  private fast = 0;
  private budget = 1 / 60;
  private windowSeconds = 0;
  private steadySeconds = 0;

  update(w: number, h: number, density: number, dt: number, live: boolean) {
    const native = Math.min(2, density || 1);
    if (w !== this.width || h !== this.height || native !== this.native) {
      this.width = w;
      this.height = h;
      this.native = native;
      this.scale = 1;
      this.budget = 1 / 60;
      this.resetWindow();
      this.steadySeconds = 0;
    }
    if (!live || document.hidden || dt <= 0 || dt > 0.5) {
      this.resetWindow();
      return native * this.scale;
    }
    const pixels = w * h * native * native;
    const floor = Math.min(1, Math.max(0.5, Math.sqrt((1280 * 720) / pixels)));
    if (floor === 1) return native;
    this.frames++;
    this.windowSeconds += dt;
    if (dt < 0.011) this.fast++;
    if (dt > this.budget * 1.45) this.late++;
    if (this.windowSeconds >= 1.5) {
      if (this.fast > this.frames * 0.6) this.budget = 1 / 120;
      if (this.late > this.frames * 0.15) {
        this.scale = Math.max(floor, this.scale - 0.125);
        this.steadySeconds = 0;
      } else if (this.late <= 1) {
        this.steadySeconds += this.windowSeconds;
        if (this.steadySeconds >= 25) {
          this.scale = Math.min(1, this.scale + 0.125);
          this.steadySeconds = 0;
        }
      } else this.steadySeconds = 0;
      this.resetWindow();
    }
    return native * this.scale;
  }

  private resetWindow() {
    this.frames = this.late = this.fast = this.windowSeconds = 0;
  }
}
