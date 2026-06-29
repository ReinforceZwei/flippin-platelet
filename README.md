# Flippin Platelet

A modern TypeScript reimplementation of the rescued `flippin_platelet.js` bookmarklet animation.

Original website: https://anohito.tw/thisUnitIsAFlippinPlatelet/ (no longer available).

It injects a full-screen canvas overlay and animates platelet sprites that flip when touched by mouse or touch input.

## Tech stack

- TypeScript
- Vite (library build)
- Canvas 2D API
- Vitest

## Project structure

- `src/flippin_platelet.ts` — typed runtime implementation (global `window.FlippinPlatelet` API + auto-run)
- `src/flippin_platelet.test.ts` — unit tests for deterministic logic
- `flippin_platelet.js` — built distributable used by bookmarklet/script tag
- `res/` — frame assets
- `scripts/sync-build.mjs` — copies build output to root for compatibility

## Development

```bash
npm install
npm run test
npm run build
```

Build output is produced via Vite and synchronized to `./flippin_platelet.js`.

## Usage (bookmarklet)

```javascript
javascript:d=document;s=d.createElement('script');s.src='https://reinforcezwei.github.io/flippin-platelet/flippin_platelet.js';b=d.getElementsByTagName('body')[0];b.appendChild(s);void(0);
```

You can also use the bookmarklet link from `index.html`.

## Deploy

GitHub Pages deployment is handled by `.github/workflows/pages.yml`:

1. Install dependencies (`npm ci`)
2. Build (`npm run build`)
3. Publish repository content to Pages
