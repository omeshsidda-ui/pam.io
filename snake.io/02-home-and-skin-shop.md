# 02 — Home Screen & Skin Shop UI Specification

## Home / Main Menu Layout

The signature feel of Kooapps' Home Screen is **zero dead space and instant life**: a full-viewport animated hexagonal arena with AI snakes slithering behind floating, clean, translucent controls—never a dull boxed webpage ([Can You Play Snake.io on PC?](https://snake.io/blog/can-you-play-snake-io-on-pc-short-answer-yes/), [Official Blog](https://snake.io/blog/5-reasons-why-snake-io-is-the-best-offline-and-online-game/)).

### Zone-by-Zone Layout (Web Browser Version — Best Template for `pam.io`)

| Screen Zone | Exact Element | Visual Style |
| :--- | :--- | :--- |
| **Background (Full-bleed)** | Live animated hex-grid arena with roaming AI snakes | Crisp dark navy or teal-blue hex tiles; 60 FPS live motion |
| **Top-Left** | Circular **Change Skins** button (paintbrush / snake-head icon) + **Settings** gear button | Glossy bright-blue circles with crisp white icons & subtle shadow |
| **Top-Center** | Bold uppercase **`PAM.IO`** wordmark logo | Heavy rounded display font, pure white with soft cyan/dark drop shadow |
| **Top-Right** | **`BEST SCORE`** badge + numeric readout | Compact uppercase label + bold white tabular digits |
| **Center Stage** | Compact translucent dark control card (chamfered/rounded corners, thin cyan border) | Contains: Nickname pill input (with pencil icon) + large vibrant **green or gold `PLAY` button** (and optional skin quick-preview) |
| **Bottom-Right** | Audio mute toggle + Share / Fullscreen icons | Clean circular icon buttons, never crowding the center |

*(Reference: On mobile, Kooapps also places a mode pill toggle `UNRANKED` / `RANKED` and `Start Big` beside the golden-yellow `PLAY` button in the bottom-right, with a Live Event hero card in the center—for `pam.io`, keeping the cleaner web-style center stage is much sharper and faster to navigate.)*

## Skin Shop / Customization Screen Layout

Opens as a clean full-screen translucent overlay over the live hex arena ([r/Snakeio Skin Shop Capture](https://www.reddit.com/r/Snakeio/comments/16xgp7p/how_do_i_get_these_2_skins/), [Skins Wiki](https://snakeio.fandom.com/wiki/Skins)):

- **Top-Left:** Minimal white left-arrow (`◀`) Back button returning straight to the Home Screen.
- **Left Category Sidebar:** Scrollable translucent dark-teal column with category tabs (`All`, `Basic`, `Neon`, `Animals`, `Rare`) showing `unlocked/total` counters in yellow-green (plus a small white crown icon when a category is 100% completed).
- **Center-Right Horizontal Skin Carousel:** Tall vertical dark translucent cards, each rendering a **live high-resolution vertical preview** of that snake (head facing downward, segmented body extending upward):
  - **Unlocked:** Full-color glossy preview, clickable to equip.
  - **Locked:** Circular periwinkle-blue badge with a crisp white padlock icon centered over the snake.
  - **Selected:** Bright glowing yellow-green outline framing the card.
- **Bottom-Right Detail & Milestone Bar:** Translucent dark bar showing:
  - **Skin Name** in bold yellow-gold
  - **Unlock Condition** in crisp white (e.g., `Score 1,500 in one game` or `Get 10 kills`)
  - **Progress Bar:** Rounded dark-blue track with centered fraction (e.g., `7/10`)
  - **Action Button:** Right-aligned `USE` button (vibrant green/gold when unlocked, muted grey when locked).
