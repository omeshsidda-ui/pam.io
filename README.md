# pam.io

A student-built, single-player snake arena for desktop and mobile. Collect orbs, boost across a rival’s path, and work your way up to the crown. Your opponents are bots. Scores, skins, and settings stay in your browser.

**[Play pam.io](https://pam-io.vercel.app)**

## How to play

| Action | Desktop | Mobile (landscape) |
| --- | --- | --- |
| Steer | Move the mouse, or use WASD or the arrow keys | Drag the joystick or choose a steering mode in Settings |
| Boost | Hold the left mouse button, Space, or Shift | Hold the bolt button |

Boost spends length. You can cross your own tail safely. To cut off a rival, get your body across its path before its head reaches you. Watch the red arena wall on the minimap. When King Cobra appears, follow the bolt to the charging circle and stay inside until it fires.

## Run locally

With a current Node.js LTS release and npm installed, clone this repository and run these commands from its root.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`. Run `npm run preview` to try that build locally, or deploy the contents of `dist/` to a static host.

## Contribute

The game uses strict TypeScript, Vite, HTML5 Canvas, and the Web Audio API. Movement and bot behavior live in `src/engine/`, drawing lives in `src/render/`, and the menus and input handling start in `src/ui.ts` and `src/main.ts`.

Ideas, bug reports, and pull requests are welcome. [Contributor guide](CONTRIBUTING.md) · [Agent guide](agents.md) · [Issues](https://github.com/omeshsidda-ui/pam.io/issues)

## License and credits

The original pam.io code is available under the MIT License. You can use, modify, and redistribute it, including commercially, while keeping the copyright and license notice. [MIT License](LICENSE)

pam.io is an independent project inspired by Kooapps’ Snake.io. The bundled Rubik fonts and third-party reference materials have their own terms. [Third-party notices](THIRD_PARTY_NOTICES.md)
