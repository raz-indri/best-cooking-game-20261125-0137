// Ember & Thyme — Bistro Rush
// config.js — one job: every tunable number, ingredient, recipe and layout
// rectangle the game uses. Nothing here draws or listens; other files read it.

const GAME_W = 1280;
const GAME_H = 720;
const DAY_SECONDS = 180;
const MAX_TICKETS = 4;

// Ingredient ids. Each ingredient knows how it is prepared before it can join
// a plate: "direct" goes straight on, "grill" must be cooked, "chop" must be
// chopped, "fry" must be fried.
const INGREDIENTS = {
  bunBottom: { name: 'Bun Bottom', key: '1', prep: 'direct', color: '#e8a34c', dark: '#b97a2e', price: 0 },
  bunTop:    { name: 'Bun Top',    key: '2', prep: 'direct', color: '#f0b45c', dark: '#c98a35', price: 0 },
  patty:     { name: 'Raw Patty',  key: '3', prep: 'grill',  color: '#a85a4a', dark: '#7c3a2e', price: 0 },
  tomato:    { name: 'Tomato',     key: '4', prep: 'chop',   color: '#e5484d', dark: '#b32a2e', price: 0 },
  lettuce:   { name: 'Lettuce',    key: '5', prep: 'direct', color: '#58b368', dark: '#2f7d3f', price: 0 },
  cheese:    { name: 'Cheese',     key: '6', prep: 'direct', color: '#f6c945', dark: '#d99e1f', price: 0 },
  onion:     { name: 'Onion',      key: '7', prep: 'chop',   color: '#c9a7e8', dark: '#8a63b8', price: 0 },
  fries:     { name: 'Fries',      key: '8', prep: 'fry',    color: '#f7d774', dark: '#d9a92f', price: 0 },
};

// A recipe is the exact multiset of prepared ingredients a ticket asks for.
// The plate must match it exactly (order on the plate does not matter).
const RECIPES = [
  { id: 'classic', name: 'Classic Ember', pay: 100, needs: ['bunBottom', 'patty', 'lettuce', 'tomato', 'bunTop'] },
  { id: 'melt',    name: 'Cheesy Melt',   pay: 120, needs: ['bunBottom', 'patty', 'cheese', 'cheese', 'bunTop'] },
  { id: 'garden',  name: 'Garden Stack',  pay: 110, needs: ['bunBottom', 'lettuce', 'tomato', 'onion', 'cheese', 'bunTop'] },
  { id: 'double',  name: 'Double Trouble',pay: 160, needs: ['bunBottom', 'patty', 'patty', 'cheese', 'bunTop'] },
  { id: 'fries',   name: 'Golden Fries',  pay: 60,  needs: ['fries'] },
];

// Station tuning (seconds).
const GRILL_COOK_TIME = 6;    // raw patty -> cooked
const GRILL_BURN_TIME = 5;    // cooked patty left alone -> burnt
const FRY_TIME = 5;            // fries basket -> golden
const CHOP_HITS = 3;           // clicks to finish chopping one item
const TICKET_PATIENCE = 50;    // seconds before a ticket walks out
const FIRST_TICKET_DELAY = 1.5;

// Layout rectangles (canvas space, 1280x720).
const LAYOUT = {
  topBar:    { x: 0,   y: 0,   w: 1280, h: 72 },
  board:     { x: 16,  y: 88,  w: 284,  h: 556 },
  kitchen:   { x: 316, y: 88,  w: 620,  h: 556 },
  platePane: { x: 952, y: 88,  w: 312,  h: 556 },
  // Grill: three slots inside the kitchen panel.
  grillSlots: [
    { x: 340, y: 118, w: 176, h: 104 },
    { x: 536, y: 118, w: 176, h: 104 },
    { x: 732, y: 118, w: 176, h: 104 },
  ],
  // Chopping boards: two slots.
  chopSlots: [
    { x: 340, y: 246, w: 270, h: 96 },
    { x: 630, y: 246, w: 270, h: 96 },
  ],
  // Fryer: two baskets.
  frySlots: [
    { x: 340, y: 366, w: 270, h: 96 },
    { x: 630, y: 366, w: 270, h: 96 },
  ],
  // Ingredient bins along the bottom of the kitchen panel.
  bins: [
    { id: 'bunBottom', x: 332, y: 496, w: 66, h: 108 },
    { id: 'patty',     x: 406, y: 496, w: 66, h: 108 },
    { id: 'tomato',    x: 480, y: 496, w: 66, h: 108 },
    { id: 'lettuce',   x: 554, y: 496, w: 66, h: 108 },
    { id: 'cheese',    x: 628, y: 496, w: 66, h: 108 },
    { id: 'onion',     x: 702, y: 496, w: 66, h: 108 },
    { id: 'fries',     x: 776, y: 496, w: 66, h: 108 },
    { id: 'bunTop',    x: 850, y: 496, w: 66, h: 108 },
  ],
  plate:     { x: 968, y: 118, w: 280, h: 250 },
  serveBtn:  { x: 968, y: 396, w: 280, h: 64 },
  trashBtn:  { x: 968, y: 472, w: 134, h: 48 },
  clearBtn:  { x: 1114, y: 472, w: 134, h: 48 },
  comboBox:  { x: 968, y: 536, w: 280, h: 92 },
};
