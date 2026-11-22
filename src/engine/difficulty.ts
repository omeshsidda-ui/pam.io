import { STEP } from "../config";
import type { Snake } from "../types";

const unit = (n: number) => Math.max(0, Math.min(1, n));

// Sample slow trends. One loot pile or a brief change of rank shouldn't
// instantly change how every rival plays.
export class Difficulty {
  level: number;
  private recentForm = 0;
  private lastMass = 65;
  private lastKills = 0;
  private crownSeconds = 0;
  constructor(private baseline: number) {
    this.level = baseline * 0.78;
  }
  sample(player: Snake, tick: number, rank: number, population: number) {
    if (tick % 120 !== 0 || player.dead) return;
    const growth = unit((player.mass - this.lastMass) / 34);
    const kills = unit(player.kills - this.lastKills);
    this.lastKills = player.kills;
    this.lastMass = player.mass;
    this.recentForm =
      0.84 * this.recentForm + 0.16 * (growth * 0.65 + kills * 0.35);
    this.crownSeconds =
      rank === 1
        ? Math.min(20, this.crownSeconds + 2)
        : Math.max(0, this.crownSeconds - 2);
    const climb = unit(1 - (rank - 1) / Math.max(1, population - 1));
    const warmup = unit((tick * STEP - 8) / 30);
    const target =
      0.19 +
      0.28 * this.baseline +
      warmup *
        (0.32 * climb * climb +
          0.32 * this.recentForm +
          (0.18 * this.crownSeconds) / 20 +
          0.12 * unit(player.kills / 4));
    this.level += Math.max(
      -0.035,
      Math.min(0.027, (Math.min(0.94, target) - this.level) * 0.24),
    );
  }
  nextRound(tick: number, bestRank: number, kills: number) {
    const survival = unit((tick * STEP - 10) / 80);
    const placement = unit(1 - (bestRank - 1) / 12);
    const performance =
      0.16 + 0.29 * survival + 0.33 * placement + 0.22 * unit(kills / 4);
    return Math.max(
      0.18,
      Math.min(0.85, this.baseline * 0.7 + performance * 0.3),
    );
  }
}
