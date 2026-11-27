# ADR 0001: Decouple bot hazard avoidance from difficulty and foraging greed

- **Status:** Accepted
- **Issue:** [omeshsidda-ui/pam.io#1](https://github.com/omeshsidda-ui/pam.io/issues/1)

## Context

In the current simulation, bots frequently steer into non-hunting players, rival bodies, and arena walls. Three design couplings cause this:

1. Obstacle checks only run when a bot's `s.think` timer expires (`0.18–0.28 s` scaled by `Difficulty.level`).
2. Obstacle clearance uses a soft linear penalty (`* 0.14`) that is outscored by nearby food (`+5.6`) and prey/loot goals (`+3.5`), while `abort` is skipped for ordinary foraging bots unless `best < -3`.
3. `Difficulty.level` scales basic survival margins and reaction speed down early in a round, making bots needlessly self-destructive rather than merely less aggressive.

## Decision

1. **Decouple per-tick emergency hazard reflex from `s.think` and `Difficulty.level`.** Every bot runs a lightweight spatial-grid hazard check each 60 Hz tick so basic obstacle avoidance works at all skill levels, while `Difficulty.level` continues to govern hunting, flanking, loot-rush size, and reaction cadence for tactical decisions.
2. **Enforce a hard safety veto over food, loot, and prey goals.** When forward or turning-circle (`speed / turnRate`) clearance is threatened—including projected positions of nearby moving heads—bots drop `boost` immediately and steer toward the widest safe escape gap.
3. **Keep physics and hitboxes untouched.** `src/engine/physics.ts` (`width`, `turnRate`, `move`) and `World.resolveHits()` remain unchanged so bots stay vulnerable to intentional player boost cutoffs, flanks, and coils.

## Consequences

- **Safer, more believable bots:** Casual deaths near passive players and multi-bot loot pileups drop sharply without making bots unkillable.
- **Fair difficulty curve:** Lower difficulty means less aggressive hunting and looser spacing, not bots driving blindly into visible walls or bodies.
- **Minimal 60 Hz CPU overhead:** Hazard checks reuse the existing `World.bg` spatial grid (`Grid<Segment>`) with local queries around each bot head.
