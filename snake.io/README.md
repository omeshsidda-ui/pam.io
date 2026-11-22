# Snake.io (by Kooapps) — Complete UI, Visual & User-Flow Documentation

This folder documents the exact screens, user flow, mobile orientation handling, high-DPI snake rendering style, HUD layout, and visual design system of **Snake.io** by [Kooapps](https://kooapps.com/) across its WebGL browser version ([CrazyGames](https://www.crazygames.com/game/snake-io), [snake.io](https://m.snake.io/)) and mobile apps ([Google Play](https://play.google.com/store/apps/details?id=com.amelosinteractive.snake&hl=en), [App Store](https://apps.apple.com/us/app/snake-io-fun-online-snake/id1104692136)).

Use this documentation as the visual & UX reference when rebuilding the frontend of **pam.io**.

## Folder Contents

- `01-user-flow-and-orientation.md` — End-to-end screen flow, mobile portrait-to-landscape lock ("Rotate your phone"), and control setup modal.
- `02-home-and-skin-shop.md` — Exact zone-by-zone layout of the Home / Main Menu (Web + Mobile) and the Skin Shop / Customization screen.
- `03-gameplay-hud-and-hd-visuals.md` — Exact live HUD layout, Boss Snake Charging Bolt UI, mobile vs. desktop controls, and why Kooapps snakes look crisp/HD.
- `04-gameover-popups-and-style.md` — Death -> Game Over summary card, unlock toasts, settings/no-pause behavior, and the complete color/typography/button design system.
- `wireframes/` — 5 clean SVG layout wireframes (`01` through `05`) showing exact screen geometry and proportions.
- `screenshots/SCREENSHOT_MANIFEST.md` — Verified direct URLs for official Kooapps screenshots of every key screen.
- `screenshots/download_screenshots.sh` & `download_screenshots.ps1` — One-command scripts to download every real official screenshot directly into `snake.io/screenshots/`.

## Quick Start: Download Real Official Screenshots

Because this archive was generated in an offline build environment, run one of the included scripts from inside `snake.io/screenshots/` to pull the real official Kooapps screenshots locally:

- **macOS / Linux:** `bash download_screenshots.sh`
- **Windows (PowerShell):** `powershell -ExecutionPolicy Bypass -File download_screenshots.ps1`
