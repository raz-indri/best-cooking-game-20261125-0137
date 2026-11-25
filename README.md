[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/raz-indri/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/raz-indri/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Ember & Thyme — Bistro Rush

A complete, original cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). Run the hottest little bistro in town: grill patties, chop veg, fry
golden fries, stack burgers to match the order board, and serve every ticket
before patience runs out. One 3-minute shift, combos pay more, the rush never
lets up.

## How to play

Open `game/index.html` in a desktop browser — no server, no network, no
downloads. Click or press Enter to start the shift.

- **Order board (left):** tickets show the dish, its ingredients and a
  patience bar. Serve before it empties or the customer walks out.
- **Kitchen (middle):** click ingredient bins. Raw patties go on the grill
  (click again when the ding sounds — leave them and they burn). Tomato and
  onion go on the chopping board (3 clicks each). Fries go in the fryer.
- **Your plate (right):** every burger starts with a bun bottom and closes
  with a bun top. Fries are served on their own plate. Hit **SERVE** (or
  Space) when the plate matches a ticket; **TRASH** (T) clears a bad plate.
- **Keys:** 1–8 pick ingredients, Space serves, T trashes, M mutes, R restarts.

## What's inside

- 5 recipes: Classic Ember, Cheesy Melt, Garden Stack, Double Trouble,
  Golden Fries
- 3 grill slots, 2 chopping boards, 2 fryer baskets, 8 ingredient bins
- Score, coins, combo multiplier (up to x3), tip for fast service
- Warm-up → lunch rush → dinner panic: tickets arrive faster and patience
  shrinks as the shift goes on
- Title screen, shift-over screen with stats and restart
- Synthesized WebAudio sounds (sizzle, chop, ding, serve jingle) — no audio
  files
- All art drawn in code on canvas; zero external assets

## Layout

- `game/index.html` — the page
- `game/src/config.js` — ingredients, recipes, tuning, layout
- `game/src/audio.js` — synthesized sound effects
- `game/src/state.js` — tickets, timer, score, combo, shift flow
- `game/src/kitchen.js` — grill / chop / fry / plate rules
- `game/src/input.js` — mouse + keyboard
- `game/src/render.js` — all canvas drawing
- `game/src/main.js` — boot, frame loop, `?demo=` screenshot presets
- `main.ts` — hands the game, screenshots and dossier to the grader
- `screenshots/` — real renders of the game (cover first)

## License

MIT — see `LICENSE`.
