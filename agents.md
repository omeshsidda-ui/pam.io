# Working on pam.io

pam.io runs entirely in the browser. Install the locked dependencies with `npm ci` and start Vite with `npm run dev`.

## Where to make changes

- Edit `src/engine/` for simulation rules. Movement and collisions advance at a fixed 60 Hz. Use the spatial grid for nearby snakes and food. Resolve collisions after all snakes have moved.
- Edit `src/render/` for canvas drawing. Interpolate the simulation positions, reuse cached sprites, and draw at the active display scale with the existing 2× cap.
- Edit `index.html`, `src/style.css`, `src/ui.ts`, and `src/theme.ts` for screens and themes. Input and round transitions live in `src/main.ts`.
- Keep existing browser profiles usable when changing `src/storage.ts`. Supply defaults for new settings.

## Check a change

Run `npm run build` to type-check and bundle the game. Exercise the affected flow in the browser. For input or layout changes, check desktop and mobile landscape. For a theme change, check the canvas and menus in both appearances.

Keep reference screenshots in `snake.io/` separate from shipped artwork. See [third-party notices](THIRD_PARTY_NOTICES.md) before reusing assets.
