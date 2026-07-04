# Polymerge

A 2048-style slide-and-merge puzzle where the tiles are regular polygons: a tile's
value is its number of sides. Merge two matching shapes and they become the next
polygon (+1 side). It's **endless** — the point is to build the biggest polygon
you can.

Built with **Phaser 3 + TypeScript + Vite**, wrapped for iOS with **Capacitor**.
Portrait only, fully offline, no backend, no external art — every visual is drawn
in code.

## Rules

- 4×4 grid. Swipe (or arrows / WASD) to slide all tiles.
- Two identical shapes collide → one shape with one more side
  (▲ + ▲ → ■, ■ + ■ → pentagon, …).
- After every move that changes the board, one tile spawns: 90% triangle, 10% square.
- Score += side-count of each newly created shape. Best score persists locally.
- No win state — the game ends only when no move is possible. Making a new
  biggest-ever polygon is celebrated with a brief banner; your best shape and
  score persist locally.
- The board's max polygon only ever grows, so a compact ladder shows your
  progress and reveals the next shape to chase. Shapes are defined up to
  `MAX_SIDES` in [src/game/constants.ts](src/game/constants.ts) (a 4×4 board can
  realistically reach ~18–19 sides).

## Development

```sh
npm install
npm run dev      # play at http://localhost:5173
npm test         # unit tests for the game logic
npm run build    # typecheck + production build to dist/
```

Game logic ([src/game/](src/game/)) is pure TypeScript with zero Phaser imports and an
injectable RNG — the engine returns per-tile `from → to` move events, which is what
the renderer ([src/render/](src/render/)) animates. UI chrome ([src/ui/](src/ui/)) is DOM;
platform services ([src/services/](src/services/)) wrap Capacitor Preferences and Haptics
(both have web fallbacks, so the browser build behaves identically).

## iOS

> The Capacitor CLI requires **Node ≥ 22** (`nvm use 22`). The web toolchain runs on
> Node 18+.

The `ios/` project is committed and ready:

```sh
npm run ios:sync   # build web assets + copy them into ios/
npm run ios:open   # open ios/App in Xcode
```

Then in Xcode:

1. Select the **App** target → *Signing & Capabilities* → pick your Team
   (bundle id is already `com.noqyris.polymerge`).
2. Choose an iPhone simulator (or your device) in the run-destination dropdown.
3. **⌘R**. That's it — the game runs fullscreen, portrait-locked, with haptics
   on device.

For a physical device: plug it in, enable Developer Mode on the phone
(Settings → Privacy & Security → Developer Mode), select it as destination, run,
then trust the developer certificate (Settings → General → VPN & Device Management).

After changing web code, re-run `npm run ios:sync` and press ⌘R again.

Android later: `npx cap add android` — the codebase has no iOS-specific logic.
