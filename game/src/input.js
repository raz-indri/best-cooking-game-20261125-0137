// input.js — one job: turn mouse clicks and key presses into kitchen actions.
// It owns the canvas coordinate mapping and the hit rectangles; it never draws
// and never changes game rules itself — every action goes through kitchen.js
// or state.js. The game loop hands it the live state and a hint callback.

const Input = (() => {
  let canvas = null;
  let state = null;
  let onHint = null;

  function inRect(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function toGameCoords(evt) {
    const rect = canvas.getBoundingClientRect();
    const sx = GAME_W / rect.width;
    const sy = GAME_H / rect.height;
    return { x: (evt.clientX - rect.left) * sx, y: (evt.clientY - rect.top) * sy };
  }

  function handleClick(x, y) {
    if (!state) return;
    SoundFX.unlock();
    if (state.screen === 'title') {
      startShift(state);
      return;
    }
    if (state.screen === 'over') {
      startShift(state);
      return;
    }

    // Serve / trash / clear buttons.
    if (inRect(x, y, LAYOUT.serveBtn)) {
      const res = servePlate(state);
      if (res === 'empty') onHint && onHint('Plate is empty — build a dish first!');
      return;
    }
    if (inRect(x, y, LAYOUT.trashBtn)) {
      onHint && onHint(trashPlate(state));
      return;
    }
    if (inRect(x, y, LAYOUT.clearBtn)) {
      // Clear-all: dump every station back to nothing (for a fresh start).
      state.grill = [null, null, null];
      state.chop = [null, null];
      state.fry = [null, null];
      onHint && onHint('Stations cleared');
      return;
    }

    // Grill slots.
    for (let i = 0; i < LAYOUT.grillSlots.length; i++) {
      if (inRect(x, y, LAYOUT.grillSlots[i])) {
        onHint && onHint(clickGrill(state, i));
        return;
      }
    }
    // Chopping boards.
    for (let i = 0; i < LAYOUT.chopSlots.length; i++) {
      if (inRect(x, y, LAYOUT.chopSlots[i])) {
        onHint && onHint(clickChop(state, i));
        return;
      }
    }
    // Fryer baskets.
    for (let i = 0; i < LAYOUT.frySlots.length; i++) {
      if (inRect(x, y, LAYOUT.frySlots[i])) {
        onHint && onHint(clickFry(state, i));
        return;
      }
    }
    // Ingredient bins.
    for (const bin of LAYOUT.bins) {
      if (inRect(x, y, bin)) {
        onHint && onHint(clickBin(state, bin.id));
        return;
      }
    }
  }

  function handleKey(evt) {
    if (!state) return;
    const k = evt.key.toLowerCase();
    if (k === 'm') {
      const muted = SoundFX.toggleMute();
      onHint && onHint(muted ? 'Sound off' : 'Sound on');
      return;
    }
    if (state.screen === 'title' && (k === 'enter' || k === ' ')) {
      SoundFX.unlock();
      startShift(state);
      return;
    }
    if (state.screen === 'over' && (k === 'r' || k === 'enter' || k === ' ')) {
      startShift(state);
      return;
    }
    if (state.screen !== 'play') return;
    if (k === ' ') {
      const res = servePlate(state);
      if (res === 'empty') onHint && onHint('Plate is empty — build a dish first!');
      evt.preventDefault();
      return;
    }
    if (k === 't') {
      onHint && onHint(trashPlate(state));
      return;
    }
    // Number keys pick an ingredient bin by its printed key.
    for (const bin of LAYOUT.bins) {
      if (INGREDIENTS[bin.id].key === k) {
        onHint && onHint(clickBin(state, bin.id));
        return;
      }
    }
  }

  return {
    attach(canvasEl, gameState, hintFn) {
      canvas = canvasEl;
      state = gameState;
      onHint = hintFn;
      canvas.addEventListener('click', (evt) => {
        const p = toGameCoords(evt);
        handleClick(p.x, p.y);
      });
      window.addEventListener('keydown', handleKey);
    },
  };
})();
