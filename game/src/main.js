// main.js — one job: boot the game, run the frame loop, and wire the pieces
// together. It also understands ?demo= presets, which stage a real in-game
// moment (menu, mid-cook, ready-to-serve, shift over) for screenshots —
// every preset is reached by playing the same code the player uses.

const Game = (() => {
  const state = createGameState();
  let canvas = null;
  let ctx = null;
  let hint = '';
  let hintUntil = 0;
  let lastTime = 0;

  function showHint(msg) {
    hint = msg;
    hintUntil = state.elapsed + 3;
  }

  function currentHint() {
    return state.elapsed < hintUntil ? hint : '';
  }

  function frame(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000 || 0);
    lastTime = now;
    if (state.screen === 'play') advanceState(state, dt);
    Render.draw(ctx, state, currentHint());
    requestAnimationFrame(frame);
  }

  // Stage a genuine mid-shift moment: three tickets on the board, a patty
  // sizzling, tomato half-chopped, fries frying, and a burger mid-assembly.
  function demoPlay() {
    startShift(state);
    state.elapsed = 89;
    state.timeLeft = DAY_SECONDS - 89;
    state.score = 740;
    state.served = 6;
    state.combo = 3;
    state.bestCombo = 4;
    state.tickets = [];
    const mk = (id, recipe, patience) => ({
      id, recipe, patience, maxPatience: TICKET_PATIENCE, bornAt: state.elapsed,
    });
    state.tickets.push(mk(3, RECIPES[0], 41));
    state.tickets.push(mk(4, RECIPES[1], 26));
    state.tickets.push(mk(5, RECIPES[4], 12));
    state.nextTicketId = 6;
    state.spawnIn = 6;
    state.grill[0] = { ing: 'patty', stage: 'cooking', t: 4.2 };
    state.grill[1] = { ing: 'patty', stage: 'cooked', t: 1.5 };
    state.chop[0] = { ing: 'tomato', hits: 2 };
    state.fry[0] = { ing: 'fries', stage: 'frying', t: 3.1 };
    state.plate = ['bunBottom', 'patty', 'lettuce'];
    state.flash = { text: '+210  CLASSIC EMBER  x1.50', color: '#2f9e44', until: state.elapsed + 1.4 };
    state.lastTickSecond = -1;
  }

  // Stage a plate that exactly matches the top ticket, ready to serve.
  function demoServe() {
    demoPlay();
    state.plate = ['bunBottom', 'patty', 'lettuce', 'tomato', 'bunTop'];
    state.flash = null;
    hint = 'Plate matches ticket #3 — hit SERVE!';
    hintUntil = 99999;
  }

  function demoEnd() {
    demoPlay();
    state.screen = 'over';
    state.overStats = { score: 1420, served: 13, lost: 2, bestCombo: 5 };
  }

  function applyDemo() {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('demo');
    if (demo === 'play') demoPlay();
    else if (demo === 'serve') demoServe();
    else if (demo === 'end') demoEnd();
    // 'menu' or anything else: plain title screen.
  }

  function boot() {
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    Input.attach(canvas, state, showHint);
    applyDemo();
    requestAnimationFrame((t) => { lastTime = t; requestAnimationFrame(frame); });
  }

  return { boot, state };
})();

window.addEventListener('DOMContentLoaded', Game.boot);
