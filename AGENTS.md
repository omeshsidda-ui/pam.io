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

## Agent skills

### Issue tracker

Specs and tickets live in GitHub Issues. See [issue tracker conventions](docs/agents/issue-tracker.md).

### Triage labels

Use the [five triage labels](docs/agents/triage-labels.md) when a skill calls for a triage role.

### Domain docs

Use a single context for the game. See [domain docs](docs/agents/domain.md).

### Development workflow

- For unclear gameplay or UI changes, use `$grill-with-docs` to agree on the player-visible behavior and edge cases before implementation.
- For a feature that spans sessions, use `$to-spec` and `$to-tickets` to define independently verifiable slices.
- Use `$tdd` for behavior that benefits from automated coverage and `$diagnosing-bugs` for hard-to-reproduce failures. Verify simulation changes through the affected gameplay behavior. For controls and rendering, also check the browser as described above.
- Use `$code-review` before opening a PR. Review against the issue or agreed behavior and the conventions in this file. Record the build result and the player flow you checked.
