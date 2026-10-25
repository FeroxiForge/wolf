# Wheel Of Lost Fortune (WOLF)

Static HTML entry point for the browser game. Open `index.html` or publish this repository with GitHub Pages.

## File locations

- `index.html` — game markup and entry point
- `css/feroxi.css` — existing Feroxi Forge stylesheet
- `js/feroxi_wolf.js` — WOLF game logic
- `avhub/audio/` — sound effects referenced by the JavaScript
- `htm/font/` and `img/` — asset paths referenced by the stylesheet

Keep the referenced assets at these paths so the relative URLs continue to resolve. Add the existing site assets to `htm/font/`, `img/icons/`, `img/marks/`, and `img/bkgd/`, and add `wheel-spin-click-slow-down.mp3` to `avhub/audio/`.
