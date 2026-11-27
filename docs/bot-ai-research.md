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
| Accidental bot deaths into passive cruising player (5 min total) | 11 | 2 |
| Mean accidental bot deaths per minute | 2.20 | 0.40 |
| Bot wall deaths (5 min total / mean per min) | 5 / 1.00 | 3 / 0.60 |
| Bot-vs-bot + wall deaths per minute | 154.60 | 6.00 |
| Mean bot mass (sampled every 1 s) | 500.8 | 511.3 |
| Mean bot survival time (s) | 10.07 | 49.98 |
| Intentional player boost-cutoff sanity test | Pass (1 kill) | Pass (1 kill) |

### Verification

- **Unseen seeds (`[101, 202, 303, 404, 505]`):** Across five additional 60-second passive cruising player runs (18,000 ticks total, starting `recentDifficulty = 0.45`), bots recorded 4 accidental deaths into the player (0.80/min), 2 wall deaths (0.40/min), 46 bot-vs-bot deaths (9.60/min bot-vs-bot + wall combined), mean bot mass 496.2, and mean bot survival time 45.25 s.
- **60 Hz simulation CPU cost:** Across the 17,648 ticks in those runs with all 32 bots active, `World.update()` took a mean of 0.75 ms, 95th percentile 1.12 ms, and max 11.04 ms (overall across all 18,000 ticks: mean 0.75 ms, p95 1.13 ms, max 11.04 ms), well within the 16.67 ms 60 Hz frame budget.
- **King Cobra (`s.boss`) and large-snake wall clearance:** In focused SSR probes, King Cobra bypassed `avoidHazards()`, kept `s.boost = true`, and tracked the leader past flanking snakes with at most 11.19° aim offset from the leader lead point while closing distance from 996.7 px to 799.2 px over 36 ticks before colliding with a flanker. At mass 800,000 (`width` 36.83 px, walking turn radius 86.80 px), both walking (`SPEED`) and boosting (`SPEED * BOOST`, dropping boost on tick 0) bots cleared a head-on wall approach from 100 px inside the lethal boundary (`R - width - 100 = 2163.17` px) with 11.02–12.10 px to spare (starting at `R - 100 = 2200` px leaves only 63.17 px before the lethal rim, below a walking 90° turn arc).
- **Headless Chromium frame pacing:** Serving the production build (`npm run build` via `vite preview`) at 1280 × 720, clicking `#play`, and steering with mouse and keyboard produced zero console or page errors. Across 240 `requestAnimationFrame` intervals during active play, callback pacing averaged 16.67 ms (median 16.7 ms, 95th percentile 16.7 ms, max 16.8 ms, zero intervals over 25 ms).
