# 04 — Game Over Flow, Popups & Visual Design System

## Death -> Game Over Summary Screen

When the player dies, the snake bursts into glowing orbs with a brief 0.8s camera linger so the player sees what happened, then smoothly fades in the **Game Over** summary overlay ([r/Snakeio Capture](https://www.reddit.com/r/Snakeio/comments/16pl4y0/i_have_an_obsession_with_this_game_im_old_school/), [App Store](https://apps.apple.com/us/app/snake-io-fun-online-snake/id1104692136)):

- **Header:** Bold white `GAME OVER` (or `NEW BEST!` badge in gold if a record was broken).
- **2-Column Comparison Table (`This Game` vs. `All Time`):**
  - **Score** (current run vs. personal best)
  - **Kills** (current run vs. best kills)
  - **Top Position** (best rank reached, e.g., `#1`, `#3`)
- **Action Buttons:**
  - Primary vibrant **PLAY AGAIN** button (instant respawn in 1 click—an upgrade over Kooapps' extra `NEXT` lobby hop)
  - Secondary **HOME** / **SKINS** button to switch skins or nickname.

## Non-Blocking Progression Popups

- **Skin Unlocked Toast:** Compact dark translucent card sliding in from top-left/top-right with golden `SKIN UNLOCKED` title and mini snake icon—never interrupts steering.
- **Kill Streak Callout:** Brief centered punchy text (`DOUBLE KILL!`, `RAMPAGE!`) that pops in and fades out in 1.2s above the player's snake.

## Kooapps-Inspired Visual Design System Tokens

| Token | Recommended Value | Usage |
| :--- | :--- | :--- |
| **Arena Themes** | Dark Navy Hex (`#0E1726` / `#162238`) or Sky Teal Hex (`#4BA3C7` / `#5BB2D6`) | Subtle low-contrast hex tiles so bright snakes & glowing orbs pop effortlessly |
| **Glass Panel Fill** | `rgba(12, 22, 40, 0.76)` + `backdrop-filter: blur(8px)` | Home center card, Leaderboard, Skin Shop, Game Over card |
| **Panel Border** | `1.5px solid rgba(110, 220, 255, 0.35)` | Crisp arcade sci-fi framing without harsh white boxes |
| **Primary CTA (`PLAY`)** | Glossy green (`#2ECC71` -> `#22A85A`) or gold (`#FFC82C` -> `#F39C12`) | Rounded pill with subtle bottom 3D lip shadow (`0 4px 0 #1A7F44`) |
| **Secondary Buttons** | Glossy arcade blue (`#2D8CFF` -> `#1A6AD4`) | Circular icon buttons (Skins, Settings, Sound) |
| **Player Highlight** | Bright warm yellow (`#FFE047`) | Player row on Leaderboard, selected skin glow, crown accents |
| **Typography** | Bold rounded geometric sans (`Fredoka`, `Rubik`, or `Nunito` 700/800) | Pure white `#FFFFFF` with crisp dark text-shadow (`0 2px 4px rgba(0,0,0,0.65)`) |
