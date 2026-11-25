// kitchen.js — one job: what happens when the cook clicks a station.
// Bins feed the grill, the chopping boards, the fryer or the plate directly;
// stations hand their finished food to the plate. Pure logic, no drawing.

function freeSlot(slots) {
  for (let i = 0; i < slots.length; i++) if (!slots[i]) return i;
  return -1;
}

// Click an ingredient bin. Returns a short label of what happened (for hints).
function clickBin(state, ingId) {
  const ing = INGREDIENTS[ingId];
  if (!ing) return '';
  if (ing.prep === 'grill') {
    const i = freeSlot(state.grill);
    if (i < 0) return 'Grill is full!';
    state.grill[i] = { ing: ingId, stage: 'cooking', t: 0 };
    SoundFX.sizzle();
    return 'Patty on the grill…';
  }
  if (ing.prep === 'chop') {
    const i = freeSlot(state.chop);
    if (i < 0) return 'Boards are full!';
    state.chop[i] = { ing: ingId, hits: 0 };
    SoundFX.click();
    return ing.name + ' on the board — chop it!';
  }
  if (ing.prep === 'fry') {
    const i = freeSlot(state.fry);
    if (i < 0) return 'Fryer is full!';
    state.fry[i] = { ing: ingId, stage: 'frying', t: 0 };
    SoundFX.sizzle();
    return 'Fries in the fryer…';
  }
  if (!addToPlate(state, ingId)) return plateHint(state, ingId);
  SoundFX.click();
  return ing.name + ' on the plate';
}

// Adds an ingredient to the plate when the stack rules allow it.
// Returns false (and leaves the plate untouched) when it does not fit.
function addToPlate(state, ingId) {
  if (!plateAccepts(state, ingId)) return false;
  state.plate.push(ingId);
  return true;
}

function plateHint(state, ingId) {
  if (ingId === 'bunTop') return 'Close the burger with a bun top last';
  if (ingId === 'fries') return 'Fries are served on their own plate';
  if (state.plate.length === 0) return 'Start every burger with a bun bottom!';
  return 'That does not fit this plate';
}

// Click a grill slot: cooked patty jumps to the plate, burnt one is tossed.
function clickGrill(state, i) {
  const slot = state.grill[i];
  if (!slot) return 'Empty grill — add a raw patty';
  if (slot.stage === 'cooking') return 'Still sizzling… wait for the ding!';
  if (slot.stage === 'burnt') {
    state.grill[i] = null;
    SoundFX.burn();
    return 'Burnt! Tossed it.';
  }
  if (!addToPlate(state, 'patty')) {
    SoundFX.serveBad();
    return plateHint(state, 'patty');
  }
  state.grill[i] = null;
  SoundFX.click();
  return 'Cooked patty on the plate';
}

// Click a chopping board: one chop. Finished pieces jump to the plate.
function clickChop(state, i) {
  const slot = state.chop[i];
  if (!slot) return 'Empty board — add tomato or onion';
  slot.hits += 1;
  SoundFX.chop();
  if (slot.hits >= CHOP_HITS) {
    if (!addToPlate(state, slot.ing)) {
      slot.hits = CHOP_HITS - 1;
      SoundFX.serveBad();
      return plateHint(state, slot.ing);
    }
    state.chop[i] = null;
    return INGREDIENTS[slot.ing].name + ' chopped, on the plate!';
  }
  return 'Chop… ' + slot.hits + '/' + CHOP_HITS;
}

// Click a fryer basket: golden fries jump to the plate.
function clickFry(state, i) {
  const slot = state.fry[i];
  if (!slot) return 'Empty basket — add fries';
  if (slot.stage === 'frying') return 'Still frying… wait for the ding!';
  if (!addToPlate(state, 'fries')) {
    SoundFX.serveBad();
    return plateHint(state, 'fries');
  }
  state.fry[i] = null;
  SoundFX.click();
  return 'Golden fries on the plate!';
}

function trashPlate(state) {
  if (state.plate.length === 0) return 'Plate is already empty';
  state.plate = [];
  SoundFX.click();
  return 'Plate cleared';
}

// The plate may hold at most one bun bottom and it must be first; a bun top
// only closes a burger that started with one; fries are served solo.
// Returns true when the ingredient may go on the plate as it stands.
function plateAccepts(state, ingId) {
  if (state.plate.includes('bunTop')) return false;
  if (ingId === 'bunBottom') return state.plate.length === 0;
  if (ingId === 'bunTop') return state.plate.length > 0 && state.plate[0] === 'bunBottom';
  if (ingId === 'fries') return state.plate.length === 0;
  return state.plate.length > 0 && state.plate[0] === 'bunBottom';
}
