# 01 — Complete User Flow & Mobile Landscape Lock

## End-to-End Screen Flow

1. **Launch / Orientation Check**
   - On desktop: loads directly into the live animated **Home Screen** (no static splash wall).
   - On mobile portrait (vertical): blocks gameplay with a full-screen **"Rotate your phone"** landscape prompt until the device is turned horizontally ([CrazyGames Technical Requirements](https://docs.crazygames.com/requirements/technical/), [CrazyGames Snake.io](https://www.crazygames.com/game/snake-io)).
2. **Home / Main Menu (Live Arena Backdrop)**
   - Player sees live AI snakes gliding across a hexagonal arena behind translucent floating UI.
   - Optional side detours: **Change Skins** (Skin Shop), **Settings** (Control Setup & Audio), or editing nickname.
3. **One-Click Play -> Live Match**
   - Clicking **PLAY** smoothly transitions the camera directly onto the player's newly spawned snake—zero full-page reload or black screen.
   - No traditional freeze-frame Pause menu during live play ([Snake.io Tutorials](https://snake.io/tutorials.php)).
4. **Mid-Match Events & Toasts**
   - Reaching #1 crowns the player and can trigger a **Boss / King Snake** hunt with the floor **Charging Bolt** circle ([Boss Snake Guide](https://snake.io/blog/how-to-defeat-the-boss-snake-in-snake-io/)).
   - Unlocking a skin triggers a sleek non-blocking `SKIN UNLOCKED` toast banner.
5. **Death -> Game Over Summary -> Lobby / Replay**
   - Brief death burst animation (snake turns into glowing orbs) -> translucent **Game Over** summary card (`This Game` vs. `All Time` for Score, Kills, Top Position) -> `NEXT` / `PLAY AGAIN` ([r/Snakeio Capture](https://www.reddit.com/r/Snakeio/comments/16pl4y0/i_have_an_obsession_with_this_game_im_old_school/)).

## Mobile Horizontal-Only (Landscape) Implementation Spec

Snake.io is strictly designed for **landscape (horizontal)** orientation on both mobile and web ([CrazyGames](https://www.crazygames.com/game/snake-io), [Official Party Guide](https://snake.io/blog/how-to-play-snake-io-with-friends-on-the-same-server/)).

For **pam.io** on mobile browsers:
- Detect portrait mode via CSS media query `@media (orientation: portrait) and (pointer: coarse)` (or `window.innerHeight > window.innerWidth` on touch devices).
- Display a clean full-screen dark navy hex-grid overlay with a rotating phone icon and bold white text: **"Rotate your phone to play in landscape"**.
- Pause simulation input while the portrait overlay is visible, and automatically resume the moment the user rotates horizontally.

## Control Setup Overlay (Mobile / Settings)

Accessible from the Settings gear icon ([How to Play Snake.io](https://snake.io/blog/how-to-play-snake-io-a-quick-guide-on-how-to-be-the-best-slither-master/)):
- **Title:** `Choose your control setup:`
- **Top Tabs:** `Left Handed` | `Right Handed` (mirrors steering pad and boost button).
- **3 Selectable Cards:** `Joystick` (virtual thumbstick + boost button), `Arrow` (directional arrow), `Follow` (finger follow).
- **Confirm Button:** Glossy blue rounded `OK` button.
