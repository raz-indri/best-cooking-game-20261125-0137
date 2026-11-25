// render.js — one job: paint every pixel of the game on the canvas.
// Title screen, kitchen, order board, plate, buttons and game-over screen.
// It reads state only; it never changes it. All food art is drawn shapes,
// no images, so the game needs no assets at all.

const Render = (() => {
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function panel(ctx, r, fill, stroke) {
    rr(ctx, r.x, r.y, r.w, r.h, 14);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke || 'rgba(60,30,10,0.25)';
    ctx.stroke();
  }

  function text(ctx, s, x, y, size, color, weight, align) {
    ctx.font = (weight || '700') + ' ' + size + 'px Verdana, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }

  // One ingredient drawn as a chunky, instantly readable icon.
  function drawIngredient(ctx, id, cx, cy, w, h) {
    const ing = INGREDIENTS[id];
    ctx.save();
    ctx.translate(cx, cy);
    if (id === 'bunBottom') {
      rr(ctx, -w / 2, -h * 0.18, w, h * 0.36, 6);
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.fillRect(-w / 2, h * 0.08, w, h * 0.1);
    } else if (id === 'bunTop') {
      ctx.beginPath();
      ctx.ellipse(0, h * 0.12, w / 2, h * 0.42, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (const sx of [-0.28, 0, 0.28]) {
        ctx.beginPath(); ctx.ellipse(sx * w, -h * 0.08, w * 0.045, h * 0.07, 0, 0, Math.PI * 2); ctx.fill();
      }
    } else if (id === 'patty') {
      rr(ctx, -w / 2, -h * 0.22, w, h * 0.44, 10);
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.fillStyle = ing.dark;
      for (const sx of [-0.3, 0.05, 0.32]) {
        ctx.beginPath(); ctx.arc(sx * w, 0, w * 0.05, 0, Math.PI * 2); ctx.fill();
      }
    } else if (id === 'tomato') {
      ctx.beginPath(); ctx.arc(0, 0, w * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.beginPath(); ctx.arc(0, 0, w * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#2f7d3f'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -h * 0.42); ctx.lineTo(0, -h * 0.2); ctx.stroke();
    } else if (id === 'lettuce') {
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.moveTo(-w / 2, h * 0.1);
      for (let i = 0; i <= 6; i++) {
        const px = -w / 2 + (w * i) / 6;
        ctx.quadraticCurveTo(px + w / 24, (i % 2 ? -h * 0.42 : h * 0.05), px + w / 12, h * 0.1);
      }
      ctx.lineTo(w / 2, h * 0.28);
      ctx.lineTo(-w / 2, h * 0.28);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.fillRect(-w / 2, h * 0.14, w, h * 0.12);
    } else if (id === 'cheese') {
      ctx.beginPath();
      ctx.moveTo(-w / 2, h * 0.28); ctx.lineTo(w / 2, h * 0.28); ctx.lineTo(w / 2, -h * 0.28); ctx.closePath();
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.beginPath(); ctx.arc(w * 0.18, h * 0.02, w * 0.07, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-w * 0.05, -h * 0.12, w * 0.05, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'onion') {
      ctx.strokeStyle = ing.color; ctx.lineWidth = 6;
      for (const r of [0.42, 0.3, 0.18]) {
        ctx.beginPath(); ctx.arc(0, 0, w * r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = ing.dark;
      ctx.beginPath(); ctx.arc(0, 0, w * 0.05, 0, Math.PI * 2); ctx.fill();
    } else if (id === 'fries') {
      ctx.fillStyle = '#d23b2e';
      rr(ctx, -w * 0.32, -h * 0.1, w * 0.64, h * 0.55, 4); ctx.fill();
      ctx.fillStyle = ing.color;
      for (const sx of [-0.22, -0.07, 0.08, 0.23]) {
        ctx.fillRect(sx * w - w * 0.05, -h * 0.48, w * 0.1, h * 0.5);
      }
      ctx.fillStyle = '#fff';
      ctx.font = '700 ' + Math.round(h * 0.22) + 'px Verdana, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('FRIES', 0, h * 0.22);
    }
    ctx.restore();
  }

  function progressRing(ctx, cx, cy, r, frac, color) {
    ctx.lineWidth = 7;
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
  }

  function drawTopBar(ctx, state) {
    const r = LAYOUT.topBar;
    ctx.fillStyle = '#3d2314';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = '#ff9f43';
    ctx.fillRect(r.x, r.y + r.h - 4, r.w, 4);
    text(ctx, '🔥 EMBER & THYME', 24, 38, 26, '#ffd166', '800');
    text(ctx, 'BISTRO RUSH', 268, 40, 13, '#ffb37a', '700');
    // Shift timer — big, turns red under 30 seconds.
    const mins = Math.floor(state.timeLeft / 60);
    const secs = Math.floor(state.timeLeft % 60);
    const clock = mins + ':' + String(secs).padStart(2, '0');
    const urgent = state.timeLeft <= 30;
    text(ctx, 'SHIFT  ' + clock, 640, 38, 30, urgent ? '#ff6b5e' : '#ffffff', '800', 'center');
    // Day progress bar under the clock.
    const pw = 220;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(640 - pw / 2, 58, pw, 6);
    ctx.fillStyle = '#ff9f43';
    ctx.fillRect(640 - pw / 2, 58, pw * (state.elapsed / DAY_SECONDS), 6);
    text(ctx, 'SCORE  ' + state.score, 1000, 30, 22, '#ffffff', '800');
    text(ctx, 'SERVED ' + state.served + '   •   COMBO x' + Math.min(3, 1 + 0.25 * Math.max(0, state.combo - 1)).toFixed(2), 1000, 56, 14, '#ffd166', '700');
    text(ctx, SoundFX.isMuted() ? 'M: SOUND OFF' : 'M: SOUND ON', 1240, 38, 12, '#c9a27a', '700', 'right');
  }

  function drawTicket(ctx, t, x, y, w, h) {
    const frac = Math.max(0, t.patience / t.maxPatience);
    const urgent = frac < 0.35;
    panel(ctx, { x, y, w, h }, urgent ? '#ffe3de' : '#fff8ec', urgent ? '#e5484d' : '#e8cfa8');
    text(ctx, '#' + t.id + '  ' + t.recipe.name.toUpperCase(), x + 12, y + 20, 15, '#3d2314', '800');
    text(ctx, '$' + t.recipe.pay, x + w - 12, y + 20, 15, '#2f9e44', '800', 'right');
    // Needed ingredients as a row of icons.
    const counts = {};
    for (const id of t.recipe.needs) counts[id] = (counts[id] || 0) + 1;
    let ix = x + 26;
    for (const id of Object.keys(counts)) {
      drawIngredient(ctx, id, ix, y + 52, 34, 26);
      if (counts[id] > 1) text(ctx, 'x' + counts[id], ix + 20, y + 58, 12, '#3d2314', '800');
      ix += 48;
    }
    // Patience bar.
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    rr(ctx, x + 12, y + h - 16, w - 24, 8, 4); ctx.fill();
    ctx.fillStyle = urgent ? '#e5484d' : frac < 0.65 ? '#f6a609' : '#2f9e44';
    rr(ctx, x + 12, y + h - 16, (w - 24) * frac, 8, 4); ctx.fill();
  }

  function drawBoard(ctx, state) {
    const r = LAYOUT.board;
    panel(ctx, r, '#5b3a1e', '#4a2d15');
    text(ctx, '📋 ORDER BOARD', r.x + 16, r.y + 24, 17, '#ffd166', '800');
    text(ctx, state.tickets.length + ' / ' + MAX_TICKETS, r.x + r.w - 16, r.y + 24, 14, '#ffb37a', '700', 'right');
    if (state.tickets.length === 0) {
      text(ctx, 'No orders yet…', r.x + r.w / 2, r.y + 90, 15, '#d9b48c', '700', 'center');
      text(ctx, 'Tickets arrive as the', r.x + r.w / 2, r.y + 116, 13, '#d9b48c', '400', 'center');
      text(ctx, 'lunch rush builds.', r.x + r.w / 2, r.y + 136, 13, '#d9b48c', '400', 'center');
    }
    state.tickets.forEach((t, i) => {
      drawTicket(ctx, t, r.x + 12, r.y + 48 + i * 122, r.w - 24, 112);
    });
    // Rush meter at the bottom of the board.
    const prog = Math.min(1, state.elapsed / DAY_SECONDS);
    text(ctx, prog < 0.33 ? 'Warm-up — steady pace' : prog < 0.66 ? 'LUNCH RUSH — tickets faster!' : 'DINNER PANIC — hold the line!', r.x + 16, r.y + r.h - 18, 13, '#ffd166', '800');
  }

  function drawGrillSlot(ctx, slot, r) {
    panel(ctx, r, '#2b2b2e', '#1c1c1f');
    text(ctx, 'GRILL', r.x + 12, r.y + 16, 12, '#ffb37a', '800');
    // Grill grate lines.
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 3;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(r.x + 10, r.y + 24 + i * 15);
      ctx.lineTo(r.x + r.w - 10, r.y + 24 + i * 15);
      ctx.stroke();
    }
    if (!slot) {
      text(ctx, 'empty — click Raw Patty', r.x + r.w / 2, r.y + r.h - 14, 11, '#8d8d94', '700', 'center');
      return;
    }
    const cx = r.x + r.w / 2, cy = r.y + 58;
    if (slot.stage === 'burnt') {
      ctx.fillStyle = '#1a1a1a';
      rr(ctx, cx - 46, cy - 16, 92, 32, 10); ctx.fill();
      text(ctx, 'BURNT! click to toss', cx, r.y + r.h - 14, 12, '#ff6b5e', '800', 'center');
      return;
    }
    drawIngredient(ctx, 'patty', cx, cy, 92, 40);
    if (slot.stage === 'cooking') {
      progressRing(ctx, cx + 62, cy, 16, Math.min(1, slot.t / GRILL_COOK_TIME), '#ff9f43');
      text(ctx, 'sizzling…', cx, r.y + r.h - 14, 12, '#ffb37a', '700', 'center');
    } else {
      progressRing(ctx, cx + 62, cy, 16, 1 - Math.min(1, slot.t / GRILL_BURN_TIME), '#2f9e44');
      text(ctx, 'COOKED — click to plate!', cx, r.y + r.h - 14, 12, '#7be495', '800', 'center');
    }
  }

  function drawChopSlot(ctx, slot, r) {
    panel(ctx, r, '#caa06a', '#a67c4a');
    text(ctx, 'CHOPPING BOARD', r.x + 12, r.y + 16, 12, '#5b3a1e', '800');
    if (!slot) {
      text(ctx, 'empty — click Tomato / Onion', r.x + r.w / 2, r.y + 56, 12, '#7a5a34', '700', 'center');
      return;
    }
    drawIngredient(ctx, slot.ing, r.x + 56, r.y + 46, 52, 36);
    text(ctx, 'click to chop!  ' + slot.hits + '/' + CHOP_HITS, r.x + r.w - 12, r.y + 46, 12, '#5b3a1e', '800', 'right');
    // Chop progress pips on their own row, clear of the text.
    for (let i = 0; i < CHOP_HITS; i++) {
      ctx.fillStyle = i < slot.hits ? '#2f9e44' : 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.arc(r.x + 40 + i * 26, r.y + 78, 8, 0, Math.PI * 2); ctx.fill();
    }
    text(ctx, slot.hits >= CHOP_HITS ? 'done!' : 'keep chopping…', r.x + r.w - 12, r.y + 78, 11, '#5b3a1e', '700', 'right');
  }

  function drawFrySlot(ctx, slot, r) {
    panel(ctx, r, '#31435c', '#223349');
    text(ctx, 'FRYER', r.x + 12, r.y + 16, 12, '#9fc2e8', '800');
    if (!slot) {
      text(ctx, 'empty — click Fries', r.x + r.w / 2, r.y + 56, 12, '#7d9bb8', '700', 'center');
      return;
    }
    drawIngredient(ctx, 'fries', r.x + 70, r.y + 58, 56, 44);
    if (slot.stage === 'frying') {
      progressRing(ctx, r.x + 150, r.y + 56, 16, Math.min(1, slot.t / FRY_TIME), '#f6c945');
      text(ctx, 'frying…', r.x + r.w - 12, r.y + 56, 12, '#ffd166', '700', 'right');
    } else {
      text(ctx, 'GOLDEN — click to plate!', r.x + r.w - 12, r.y + 56, 13, '#7be495', '800', 'right');
    }
  }

  function drawBin(ctx, bin) {
    const ing = INGREDIENTS[bin.id];
    panel(ctx, bin, '#fff8ec', '#d9b48c');
    drawIngredient(ctx, bin.id, bin.x + bin.w / 2, bin.y + 40, 52, 38);
    text(ctx, ing.name, bin.x + bin.w / 2, bin.y + 76, 10, '#3d2314', '800', 'center');
    // Key hint chip.
    ctx.fillStyle = '#3d2314';
    ctx.beginPath(); ctx.arc(bin.x + bin.w - 12, bin.y + 12, 10, 0, Math.PI * 2); ctx.fill();
    text(ctx, ing.key, bin.x + bin.w - 12, bin.y + 13, 11, '#ffd166', '800', 'center');
  }

  function drawKitchen(ctx, state, hint) {
    const r = LAYOUT.kitchen;
    panel(ctx, r, '#8a5a33', '#6f4525');
    text(ctx, '🍳 THE KITCHEN', r.x + 16, r.y + 22, 15, '#ffe1b0', '800');
    for (let i = 0; i < 3; i++) drawGrillSlot(ctx, state.grill[i], LAYOUT.grillSlots[i]);
    for (let i = 0; i < 2; i++) drawChopSlot(ctx, state.chop[i], LAYOUT.chopSlots[i]);
    for (let i = 0; i < 2; i++) drawFrySlot(ctx, state.fry[i], LAYOUT.frySlots[i]);
    for (const bin of LAYOUT.bins) drawBin(ctx, bin);
    // Hint line.
    text(ctx, hint || 'Click a bin, grill it, chop it, plate it, SERVE it!', r.x + 16, r.y + r.h - 14, 13, '#ffe1b0', '700');
  }

  // One plate layer: a flat band in the ingredient's own shape, squashed to
  // the layer's height so a tall stack stays a neat burger, not a pile of
  // full-size icons.
  function drawPlateLayer(ctx, id, cx, cy, w, h) {
    const ing = INGREDIENTS[id];
    const hw = w / 2, hh = h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    if (id === 'bunBottom') {
      rr(ctx, -hw, -hh, w, h, 6);
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.fillStyle = ing.dark;
      ctx.fillRect(-hw, hh * 0.3, w, hh * 0.6);
    } else if (id === 'bunTop') {
      ctx.beginPath();
      ctx.ellipse(0, hh, hw, h * 1.05, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (const sx of [-0.25, 0, 0.25]) {
        ctx.beginPath(); ctx.ellipse(sx * w, -hh * 0.1, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      }
    } else if (id === 'patty') {
      rr(ctx, -hw, -hh, w, h, 8);
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.fillStyle = ing.dark;
      for (const sx of [-0.3, 0, 0.3]) {
        ctx.beginPath(); ctx.arc(sx * w, 0, 3, 0, Math.PI * 2); ctx.fill();
      }
    } else if (id === 'tomato') {
      ctx.beginPath(); ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
      ctx.fillStyle = ing.color; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, hw * 0.25, hh * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = ing.dark; ctx.fill();
    } else if (id === 'lettuce') {
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.moveTo(-hw, hh * 0.3);
      for (let i = 0; i <= 6; i++) {
        const px = -hw + (w * i) / 6;
        ctx.quadraticCurveTo(px + w / 24, (i % 2 ? -hh * 0.9 : hh * 0.1), px + w / 12, hh * 0.3);
      }
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath(); ctx.fill();
    } else if (id === 'cheese') {
      ctx.beginPath();
      ctx.moveTo(-hw, hh); ctx.lineTo(hw, hh); ctx.lineTo(hw, -hh); ctx.closePath();
      ctx.fillStyle = ing.color; ctx.fill();
    } else if (id === 'onion') {
      ctx.strokeStyle = ing.color; ctx.lineWidth = 4;
      for (const f of [0.45, 0.3, 0.15]) {
        ctx.beginPath(); ctx.ellipse(0, 0, hw * f * 2, hh * f * 2, 0, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (id === 'fries') {
      ctx.fillStyle = ing.color;
      for (const sx of [-0.16, 0, 0.16]) ctx.fillRect(sx * w - 5, -hh * 2.1, 10, h * 1.4);
      ctx.fillStyle = '#d23b2e';
      rr(ctx, -hw * 0.42, -hh * 0.4, hw * 0.84, h * 1.2, 3); ctx.fill();
    }
    ctx.restore();
  }

  function drawPlateStack(ctx, state) {
    const r = LAYOUT.plate;
    panel(ctx, r, '#fdf6e9', '#e8cfa8');
    text(ctx, 'YOUR PLATE', r.x + 14, r.y + 20, 14, '#3d2314', '800');
    if (state.plate.length === 0) {
      text(ctx, 'Empty plate —', r.x + r.w / 2, r.y + 110, 15, '#a98a64', '700', 'center');
      text(ctx, 'start with a bun!', r.x + r.w / 2, r.y + 134, 15, '#a98a64', '700', 'center');
    } else {
      // Draw the stack bottom-up, each layer sitting on the last.
      const cx = r.x + r.w / 2;
      let top = r.y + r.h - 42;
      const layerH = Math.min(30, 150 / state.plate.length);
      for (const id of state.plate) {
        drawPlateLayer(ctx, id, cx, top - layerH / 2, 190, layerH);
        top -= layerH;
      }
      text(ctx, state.plate.length + ' layer' + (state.plate.length > 1 ? 's' : ''), r.x + r.w - 12, r.y + 20, 12, '#a98a64', '700', 'right');
    }
    // The plate itself.
    ctx.fillStyle = '#e9e2d5';
    ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + r.h - 18, 120, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9bda6'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + r.h - 18, 120, 14, 0, 0, Math.PI * 2); ctx.stroke();
  }

  function drawPlatePane(ctx, state) {
    const r = LAYOUT.platePane;
    panel(ctx, r, '#5b3a1e', '#4a2d15');
    drawPlateStack(ctx, state);
    // SERVE button.
    const s = LAYOUT.serveBtn;
    const ready = state.plate.length > 0;
    panel(ctx, s, ready ? '#2f9e44' : '#7a7a72', ready ? '#237a35' : '#5d5d57');
    text(ctx, '🍽  SERVE  (Space)', s.x + s.w / 2, s.y + s.h / 2, 22, '#ffffff', '800', 'center');
    // Trash / clear buttons.
    const t = LAYOUT.trashBtn, c = LAYOUT.clearBtn;
    panel(ctx, t, '#e5484d', '#b32a2e');
    text(ctx, '🗑 TRASH (T)', t.x + t.w / 2, t.y + t.h / 2, 14, '#ffffff', '800', 'center');
    panel(ctx, c, '#6c757d', '#4d545a');
    text(ctx, 'CLEAR STATIONS', c.x + c.w / 2, c.y + c.h / 2, 12, '#ffffff', '800', 'center');
    // Combo box.
    const cb = LAYOUT.comboBox;
    panel(ctx, cb, '#3d2314', '#2c1a0d');
    text(ctx, 'COMBO', cb.x + 14, cb.y + 20, 13, '#ffd166', '800');
    text(ctx, state.combo > 1 ? state.combo + ' in a row!' : 'Serve in a row to build a combo', cb.x + 14, cb.y + 46, 13, '#ffffff', '700');
    text(ctx, 'Best combo: ' + state.bestCombo + '   •   Served: ' + state.served, cb.x + 14, cb.y + 70, 12, '#c9a27a', '700');
  }

  function drawFlash(ctx, state) {
    if (!state.flash || state.elapsed > state.flash.until) return;
    const alpha = Math.min(1, (state.flash.until - state.elapsed) * 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    // Bottom strip, below the panels, on a dark pill so it never covers play.
    ctx.font = '800 26px Verdana, sans-serif';
    const w = ctx.measureText(state.flash.text).width + 36;
    rr(ctx, 640 - w / 2, 668, w, 40, 20);
    ctx.fillStyle = 'rgba(20,12,6,0.85)';
    ctx.fill();
    text(ctx, state.flash.text, 640, 689, 26, state.flash.color, '800', 'center');
    ctx.restore();
  }

  function drawTitle(ctx, state) {
    ctx.fillStyle = '#2a1a0e';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    // Warm bistro glow.
    const g = ctx.createRadialGradient(640, 240, 40, 640, 240, 520);
    g.addColorStop(0, 'rgba(255,159,67,0.35)');
    g.addColorStop(1, 'rgba(42,26,14,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    text(ctx, '🔥', 640, 130, 72, '#ffffff', '800', 'center');
    text(ctx, 'EMBER & THYME', 640, 220, 64, '#ffd166', '800', 'center');
    text(ctx, '— BISTRO RUSH —', 640, 272, 26, '#ffb37a', '700', 'center');
    text(ctx, 'Run the hottest little bistro in town. Grill patties, chop veg,', 640, 340, 18, '#ffffff', '400', 'center');
    text(ctx, 'stack burgers, and serve every ticket before patience runs out.', 640, 368, 18, '#ffffff', '400', 'center');
    text(ctx, '5 recipes  •  grill, chop & fry stations  •  combos pay more  •  3-minute shift', 640, 410, 15, '#ffd166', '700', 'center');
    // Start button.
    panel(ctx, { x: 490, y: 450, w: 300, h: 72 }, '#2f9e44', '#237a35');
    text(ctx, '▶  START SHIFT', 640, 487, 26, '#ffffff', '800', 'center');
    text(ctx, 'Click or press Enter  •  Keys 1-8 pick ingredients  •  Space serves  •  T trashes', 640, 570, 14, '#c9a27a', '700', 'center');
    text(ctx, 'A complete cooking game — no network, no downloads, just you and the lunch rush.', 640, 600, 13, '#8d6f52', '400', 'center');
  }

  function drawGameOver(ctx, state) {
    ctx.fillStyle = 'rgba(20,12,6,0.82)';
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    panel(ctx, { x: 340, y: 130, w: 600, h: 440 }, '#fff8ec', '#e8cfa8');
    text(ctx, '⏰ SHIFT OVER!', 640, 190, 40, '#3d2314', '800', 'center');
    const s = state.overStats || { score: 0, served: 0, lost: 0, bestCombo: 0 };
    text(ctx, 'FINAL SCORE', 640, 250, 16, '#a98a64', '800', 'center');
    text(ctx, String(s.score), 640, 300, 56, '#2f9e44', '800', 'center');
    text(ctx, 'Dishes served: ' + s.served + '     Customers lost: ' + s.lost, 640, 356, 18, '#3d2314', '700', 'center');
    text(ctx, 'Best combo: ' + s.bestCombo + ' in a row', 640, 388, 18, '#3d2314', '700', 'center');
    const verdict = s.served >= 12 ? 'Head chef material! The bistro sings your name.'
      : s.served >= 7 ? 'Solid service — the regulars will be back.'
      : 'A rough shift… the grill forgives. Try again!';
    text(ctx, verdict, 640, 428, 16, '#8a5a33', '700', 'center');
    panel(ctx, { x: 490, y: 470, w: 300, h: 60 }, '#2f9e44', '#237a35');
    text(ctx, '↻  PLAY AGAIN (R)', 640, 501, 20, '#ffffff', '800', 'center');
  }

  function draw(ctx, state, hint) {
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    if (state.screen === 'title') { drawTitle(ctx, state); return; }
    drawTopBar(ctx, state);
    drawBoard(ctx, state);
    drawKitchen(ctx, state, hint);
    drawPlatePane(ctx, state);
    drawFlash(ctx, state);
    if (state.screen === 'over') drawGameOver(ctx, state);
  }

  return { draw, drawIngredient };
})();
