# Copilot Instructions for Me-vs-Brain

## Run & Verify Quickly
- Static ES modules served directly from `index.html`; no bundler.
- Install deps once, then run a local server (otherwise video autoplay policies break when opening the file scheme):
```bash
npm install
npm run dev
```
- `npm run dev` starts `http-server` on port 8000 with caching disabled so live edits show up instantly. Stop/resume via Ctrl+C; no hot reload tooling exists.

## Mental Model of the Game
- `js/main.js` wires the app: gather DOM via `DOM_IDS`, initialize managers, then bind `buttonHandlers` plus auto-pause and video error handling.
- `js/state/gameState.js` is the single source of truth. Always mutate through its setters/helpers (`incrementProgress`, `adjustFocus`, etc.) and call `updateUI()` right after to keep meters/thoughts/task box synced.
- UI rendering flows through `ui/uiManager.js`, which caches DOM refs, exposes toggle helpers (start/game/end/pause), and delegates to `ui/meters.js`, `ui/thoughts.js`, and `ui/taskBox.js`.
- Gameplay ticks happen in `game/gameLoop.js` (1 Hz `setInterval`). It decrements `timeLeft`, applies focus decay/recovery, may trigger `events.js` or `phoneDistraction.js`, and ends the run via `endGame.js`.
- Video playback is centralized in `utils/videoManager.js`; always swap clips with `switchVideo` so autoplay + pause state stay consistent.

## Core Systems & Files
- `controllers/buttonHandlers.js` owns CTA logic (start/work/restart/pause). Win checks happen here after progress pushes.
- `controllers/pauseManager.js` manages manual pause plus tab-visibility auto-pause. Respect `setPause` instead of toggling UI manually.
- Random events (`game/events.js`) and phone distractions (`game/phoneDistraction.js`) both set `state.isEventActive` and temporarily disable the work button; reuse their patterns when adding new blockers.
- End states render through `game/endGame.js`, which also stops the loop and hides the pause button.
- Shared utilities live under `js/utils/` (`helpers.js` for RNG/clamp/formatting). Prefer extending these over inlining helpers.

## Conventions & Gotchas
- Text copy is Ukrainian; keep tone consistent and update both UI strings and related README prose when introducing new features.
- Asset paths assume `assets/videos/` and `assets/images/`. When adding media, update the constants map (`config/constants.js`) instead of hardcoding paths.
- DOM access should go through `DOM_IDS` and cached references inside `uiManager`; avoid repeated `document.getElementById` calls elsewhere.
- New gameplay rules should surface via the task box/thought bubbles so players receive guidance; see `ui/taskBox.js` for priority order of messages.
- Always guard user interactions with current state flags (`isPaused`, `isEventActive`, `isPhoneDistracted`) to avoid overlapping animations.
- Prefer `toggleStartScreen/toggleGameShell/toggleEndScreen` helpers instead of editing classes inline, so the presentation stays consistent.

## When Extending
- Add new timed mechanics inside `gameLoop` or via their own intervals, but ensure `stopGameLoop()` cleans them up during `endGame`.
- For new buttons or UI widgets, wire listeners in `main.js` alongside existing ones and expose DOM refs through the element map so `uiManager` can access them.
- If a feature requires persistent UI state, add fields to `gameState` with clear getters/setters and reset them inside `resetState()` to avoid leaking data between runs.
