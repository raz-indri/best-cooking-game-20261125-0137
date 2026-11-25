// state.js — one job: the game's mutable state and the rules that change it
// (tickets, timer, score, combo, day flow). It knows nothing about drawing or
// input; kitchen.js and main.js call into it.

function createGameState() {
  return {
    screen: 'title',        // 'title' | 'play' | 'over'
    timeLeft: DAY_SECONDS,  // seconds left in the shift
    elapsed: 0,
    score: 0,
    coins: 0,
    served: 0,
    lost: 0,                // tickets that walked out
    combo: 0,
    bestCombo: 0,
    tickets: [],            // { id, recipe, patience, maxPatience, bornAt }
    nextTicketId: 1,
    spawnIn: FIRST_TICKET_DELAY,
    plate: [],              // ingredient ids currently on the plate, bottom first
    grill: [null, null, null],   // { ing, stage: 'cooking'|'cooked'|'burnt', t }
    chop: [null, null],          // { ing, hits }
    fry: [null, null],           // { ing, stage: 'frying'|'golden', t }
    flash: null,            // { text, color, until } floating feedback
    overStats: null,
    lastTickSecond: -1,
  };
}

// How fast new tickets arrive: starts relaxed, tightens as the shift goes on.
function spawnInterval(elapsed) {
  const progress = Math.min(1, elapsed / DAY_SECONDS);
  return 9.5 - 5.0 * progress;
}

// Patience shrinks a little as the rush builds.
function ticketPatience(elapsed) {
  const progress = Math.min(1, elapsed / DAY_SECONDS);
  return TICKET_PATIENCE - 12 * progress;
}

function pickRecipe(rng) {
  // Fries-only tickets are rarer so the board stays mostly burgers.
  const roll = rng();
  if (roll < 0.12) return RECIPES[4];
  return RECIPES[Math.floor(rng() * 4)];
}

function spawnTicket(state, rng) {
  const recipe = pickRecipe(rng || Math.random);
  const patience = ticketPatience(state.elapsed);
  state.tickets.push({
    id: state.nextTicketId++,
    recipe,
    patience,
    maxPatience: patience,
    bornAt: state.elapsed,
  });
  SoundFX.newOrder();
}

function multisetEquals(a, b) {
  if (a.length !== b.length) return false;
  const count = {};
  for (const x of a) count[x] = (count[x] || 0) + 1;
  for (const x of b) {
    if (!count[x]) return false;
    count[x]--;
  }
  return true;
}

// Try to serve the current plate. Returns 'served' | 'wrong' | 'empty'.
function servePlate(state) {
  if (state.plate.length === 0) return 'empty';
  const match = state.tickets.find((t) => multisetEquals(state.plate, t.recipe.needs));
  if (!match) {
    state.combo = 0;
    state.score = Math.max(0, state.score - 25);
    state.plate = [];
    state.flash = { text: 'WRONG ORDER! -25', color: '#e5484d', until: state.elapsed + 1.4 };
    SoundFX.serveBad();
    return 'wrong';
  }
  const patienceLeft = Math.max(0, match.patience / match.maxPatience);
  const tip = Math.round(50 * patienceLeft);
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const mult = Math.min(3, 1 + 0.25 * (state.combo - 1));
  const earned = Math.round((match.recipe.pay + tip) * mult);
  state.score += earned;
  state.coins += earned;
  state.served += 1;
  state.tickets = state.tickets.filter((t) => t.id !== match.id);
  state.plate = [];
  state.flash = {
    text: '+' + earned + '  ' + match.recipe.name.toUpperCase() + (state.combo > 1 ? '  x' + mult.toFixed(2) : ''),
    color: '#2f9e44',
    until: state.elapsed + 1.6,
  };
  SoundFX.serveGood();
  return 'served';
}

// Advance timers by dt seconds. Returns true when the shift just ended.
function advanceState(state, dt) {
  if (state.screen !== 'play') return false;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, DAY_SECONDS - state.elapsed);

  // Last-10-seconds tick.
  const sec = Math.ceil(state.timeLeft);
  if (state.timeLeft <= 10 && sec !== state.lastTickSecond) {
    state.lastTickSecond = sec;
    SoundFX.tick();
  }

  // Ticket patience drains; expired tickets walk out.
  for (const t of state.tickets) t.patience -= dt;
  const before = state.tickets.length;
  state.tickets = state.tickets.filter((t) => t.patience > 0);
  state.lost += before - state.tickets.length;
  if (before !== state.tickets.length) {
    state.combo = 0;
    state.flash = { text: 'CUSTOMER WALKED OUT!', color: '#e5484d', until: state.elapsed + 1.4 };
  }

  // New tickets.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.tickets.length < MAX_TICKETS) {
    spawnTicket(state);
    state.spawnIn = spawnInterval(state.elapsed);
  }

  // Grill: cooking -> cooked -> burnt.
  for (const slot of state.grill) {
    if (!slot) continue;
    slot.t += dt;
    if (slot.stage === 'cooking' && slot.t >= GRILL_COOK_TIME) {
      slot.stage = 'cooked';
      slot.t = 0;
      SoundFX.ding();
    } else if (slot.stage === 'cooked' && slot.t >= GRILL_BURN_TIME) {
      slot.stage = 'burnt';
      SoundFX.burn();
    }
  }
  // Fryer: frying -> golden (stays golden, never burns — fries are forgiving).
  for (const slot of state.fry) {
    if (!slot) continue;
    slot.t += dt;
    if (slot.stage === 'frying' && slot.t >= FRY_TIME) {
      slot.stage = 'golden';
      SoundFX.ding();
    }
  }

  if (state.timeLeft <= 0) {
    state.screen = 'over';
    state.overStats = {
      score: state.score,
      served: state.served,
      lost: state.lost,
      bestCombo: state.bestCombo,
    };
    SoundFX.gameOver();
    return true;
  }
  return false;
}

function startShift(state) {
  const fresh = createGameState();
  fresh.screen = 'play';
  Object.assign(state, fresh);
  spawnTicket(state);
  state.spawnIn = spawnInterval(0);
}
