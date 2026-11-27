# Bot hazard avoidance research

Research and baseline benchmark for [GitHub issue #1](https://github.com/omeshsidda-ui/pam.io/issues/1): bots dying casually near non-hunting players and colliding in dense foraging/loot situations.

## Root causes in pam.io

Inspecting [`src/engine/botAI.ts`](../src/engine/botAI.ts), [`src/engine/physics.ts`](../src/engine/physics.ts), [`src/engine/difficulty.ts`](../src/engine/difficulty.ts), and [`src/engine/world.ts`](../src/engine/world.ts) identifies five interacting causes:

1. **Blind `s.think` reaction gap.** `World.update()` only calls `decide()` when `(s.think -= STEP) <= 0`, and `decide()` resets `s.think = rand(0.18, 0.28) * (1 - 0.4 * skill)`. At `skill = 0`, a bot goes `0.18–0.28 s` (11–17 ticks at 60 Hz) without re-evaluating obstacles. While boosting (`SPEED * BOOST = 198 * 1.75 = 346.5 px/s`), `0.28 s` corresponds to ~97 px of blind travel.
2. **Soft obstacle penalty overridden by food and prey scores.** In `decide()`, sector scoring uses `Math.min(0, clear - margin) * 0.14` for obstacle clearance, while food density (`Math.min(value[i], 0.7) * 8`) adds up to `+5.6` and `prey || drop` alignment adds up to `+3.5`. An ordinary foraging bot only triggers `abort` if `s.boost || prey || drop || best < -3`, so moderate clearance violations are routinely outbid by nearby pellets or drops.
3. **Static segment treatment.** The `open[i]` sector array records `Math.min(open[i], d)` across all non-self `body.near(...)` segments, treating moving snake heads (`p.i === 0`) identically to stationary body segments with no velocity or heading projection.
4. **No turning-radius awareness.** Snake turn rate is `turnRate(s) = 84 / width(s)` (`src/engine/physics.ts`), giving an effective turning radius `R_turn = speed / turnRate(s)`. `safeSteps()` probes only 5 coarse steps (`dt = 0.075 s`, `0.375 s` total) along `s.aim`, and `abort` only checks `[-Math.PI / 2, Math.PI / 2]` (`±90°`) rather than evaluating left/right turning-circle clearance or selecting the widest safe escape angle.
5. **Over-eager cutoffs, loot pileups, and difficulty coupling.** Aggressive `flank` cutoffs (`skill > 0.48 && s.role === 0 && lateral > 85 && lateral > d * 0.55`) and `callScavengers()` rushing up to `2 + Math.round(skill * 4)` bots into a single death drop with `s.boost = s.mass >= 35` create multi-bot pileups. Meanwhile, `Difficulty.level` starts at `baseline * 0.78` (`0.351` for `baseline = 0.45`), shrinking `vision`, `margin`, and reaction speed for basic survival early in a round.

## Open-source algorithmic patterns (clean-room reference)

The following open-source snake AI implementations were studied for **algorithmic concepts only**. No third-party code was copied into `pam.io`; `pam.io` remains MIT-licensed.

- **[`j-c-m/Slither.io-bot`](https://github.com/j-c-m/Slither.io-bot) (MIT):** Models head-proximity danger zones scaled by snake width and boost state, merging nearby threats into angular collision sectors rather than treating individual points independently.
- **[`jfbarras/slimy-snake`](https://github.com/jfbarras/slimy-snake):** Models left and right turning-circle exclusion zones (`speed / turnRate`) alongside the head, and selects the widest-gap escape bearing when forward clearance is blocked.
- **[`dzaczek/slbot`](https://github.com/dzaczek/slbot):** Separates moving enemy heads (weighted by closing direction / `enemy_approach`) from static body segments and arena walls so bots react earlier to converging heads than to parallel tails.
- **[`ermiyaeskandary/Slither.io-bot`](https://github.com/ermiyaeskandary/Slither.io-bot) (MPL-2.0, algorithmic concept reference only — zero code reuse):** Enforces a hard priority override that suppresses low-value food chasing whenever an active collision sector threatens the forward arc.

## Design requirements and invariants

1. **Decouple per-tick hazard reflex from `s.think` and `Difficulty`.** Basic self-preservation (emergency wall, body, and converging-head avoidance) must run every tick at all difficulty levels. `Difficulty` should scale tactical aggression, hunting, and spacing—not whether bots steer out of obvious obstacles.
2. **Hard-veto safety over food, loot, and prey greed.** When forward or turning-circle clearance drops below the safe envelope, drop `boost` immediately and override foraging/hunting targets with the safest escape heading.
3. **Turning-circle, moving-head projection, and widest-gap escape.** Account for `R_turn = speed / turnRate(s)`, project nearby heads slightly forward along their current headings, and search multiple escape angles rather than only `±90°`.
4. **Preserve fair combat and unchanged physics.** Do **not** modify `width`, `turnRate`, or `move` in [`src/engine/physics.ts`](../src/engine/physics.ts) or collision hitboxes in `World.resolveHits()` ([`src/engine/world.ts`](../src/engine/world.ts)). Bots must remain killable by intentional boost cutoffs, flanks, and coils.

## Baseline vs. after

Measured with `BOT_SURVIVAL_REPORT=1 node --test tests/bot-survival.mjs` across 5 deterministic seeds (`[11, 23, 37, 53, 71]`, 60 simulated seconds each, starting `recentDifficulty = 0.45`):

| Metric | Baseline (unpatched) | After |
| --- | --- | --- |
| Accidental bot deaths into passive cruising player (5 min total) | 11 | Pending implementation |
| Mean accidental bot deaths per minute | 2.20 | Pending implementation |
| Bot wall deaths (5 min total / mean per min) | 5 / 1.00 | Pending implementation |
| Bot-vs-bot + wall deaths per minute | 154.60 | Pending implementation |
| Mean bot mass (sampled every 1 s) | 500.8 | Pending implementation |
| Mean bot survival time (s) | 10.07 | Pending implementation |
| Intentional player boost-cutoff sanity test | Pass (1 kill) | Pending implementation |
