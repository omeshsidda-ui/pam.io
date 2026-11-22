# 03 — Gameplay HUD & High-Resolution Snake Visuals

## Why Kooapps Snakes Look Crisp & High-Res (Fixing Low-Res Canvas Blur)

Kooapps builds Snake.io in Unity 2D with Spine-animated rigs and clean high-DPI rendering ([Levi Perez — Kooapps](https://leviperez.dev/projects/2022-kooapps/)). When AI coding models build HTML5 Canvas clones, snakes often look **blurry or low-resolution** for three preventable reasons—fix all three in `pam.io`:

1. **Missing `devicePixelRatio` (Retina/HD Scaling):**
   - Never set `canvas.width = window.innerWidth` without multiplying by `dpr = Math.min(window.devicePixelRatio || 1, 2)`.
   - Scale the canvas backing store by `dpr` and call `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` every resize so every edge, font, and snake curve is razor-sharp on laptops and phones.
2. **Low-Res Offscreen Sprite Caching:**
   - Pre-render each snake segment sprite onto an offscreen canvas at **2x–3x native size** (e.g., `128x128` px per segment sprite), then draw it scaled down cleanly with `imageSmoothingQuality = 'high'`. Never draw tiny `24x24` sprites stretched up!
3. **Flat Circles Instead of Layered Glossy Anatomy:**
   - Each snake segment needs: (a) a soft dark drop shadow underneath the snake body, (b) overlapping circular segments spaced tightly (`~0.35–0.45 * radius`) so the body looks like a continuous smooth tube rather than separated beads, (c) radial glossy highlight + subtle rim shading per segment, (d) smooth tail tapering on the last 6–8 segments, and (e) a **distinct illustrated head** with expressive white eyes + pupils that track the turn angle (plus a subtle glowing aura & trailing sparkles when boosting).

## Exact Live Gameplay HUD Layout

Official [Kooapps gameplay screenshots](https://snake.io/blog/how-to-play-snake-io-a-quick-guide-on-how-to-be-the-best-slither-master/) show a **minimal, ultra-clean HUD** that keeps 90% of the screen clear for gameplay:

- **Top-Center:** Huge bold white **Score / Length** number with a crisp dark drop shadow (e.g., `2879`).
  - During a Boss fight, a **3-segment red Boss HP bar** sits cleanly directly underneath the score ([Boss Snake Guide](https://snake.io/blog/how-to-defeat-the-boss-snake-in-snake-io/)).
- **Top-Right:** Compact translucent dark **Top-10 Leaderboard** (`#1` has a golden crown icon; current player's row is highlighted in bright yellow; collapsible chevron on smaller screens).
  - **Offscreen Leader Arrow:** When `#1` is off-screen, a floating white crown + directional arrow hugs the screen edge pointing toward the leader.
  - *Cleanliness note:* Kooapps intentionally **omits** a noisy circular minimap and kills counter during normal play so the arena stays uncluttered. (If you want a minimap in `pam.io`, keep it tiny, low-opacity, and toggleable.)
- **In-World Boss Charging Bolt Circle:** When the Boss Snake spawns, a large crisp white crosshair circle appears on the arena floor; staying inside it fills the circle clockwise in red until it blasts the Boss Snake ([Boss Snake Guide](https://snake.io/blog/how-to-defeat-the-boss-snake-in-snake-io/)).
- **Controls Overlay:**
  - **Desktop:** Zero on-screen buttons—100% clean viewport (mouse/WASD to steer, hold click/Space to boost).
  - **Mobile (Landscape only):** Translucent circular thumbstick at **Bottom-Left** + translucent hexagonal boost button (lightning/arrow icon) at **Bottom-Right** (swapped if Left-Handed is enabled).
