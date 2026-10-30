import GameOfLife from './src/GameOfLife.js';
import { startAges, nextAges, lookOf } from './src/creatures.js';
import { addCreatureSymbols } from './sprites.js';

// The interface only draws the grid and calls the engine; the rules live in src/GameOfLife.js.

const MAX_CELLS = 24;
const MIN_CELL_PX = 24;

const gridEl = document.getElementById('grid');
const generationEl = document.getElementById('generation');
const playButton = document.getElementById('play');
const playLabel = document.getElementById('play-label');
const stepButton = document.getElementById('step');
const clearButton = document.getElementById('clear');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const patternSelect = document.getElementById('pattern');
const loadButton = document.getElementById('load');
const statusEl = document.getElementById('status');

// Chosen once on load: as many cells as fit at MIN_CELL_PX or larger, up to MAX_CELLS.
// Resizing the window afterwards does not reset a running game.
function pickGridSize() {
    const width = gridEl.parentElement.clientWidth;
    return Math.max(8, Math.min(MAX_CELLS, Math.floor((width - 1) / (MIN_CELL_PX + 1))));
}

const size = pickGridSize();
const game = new GameOfLife(size, size);
gridEl.style.setProperty('--cols', size);

// How long each cell has been alive, used to pick its creature (see src/creatures.js).
let ages = startAges(game.grid);

function resetAges() {
    ages = startAges(game.grid);
}

// A cell drawn or erased by hand starts over: newborn if alive, age 0 if dead.
function toggleByHand(row, col) {
    game.toggleCell(row, col);
    ages[row][col] = game.grid[row][col];
}

addCreatureSymbols();

// One button per cell; only the focused cell is in the tab order (roving tabindex).
const SVG_NS = 'http://www.w3.org/2000/svg';
const cells = [];
const creatures = [];
const drawn = [];
let focusRow = 0;
let focusCol = 0;

for (let r = 0; r < size; r++) {
    cells.push([]);
    creatures.push([]);
    drawn.push([]);
    for (let c = 0; c < size; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.tabIndex = -1;
        cell.dataset.row = r;
        cell.dataset.col = c;
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 12 12');
        svg.setAttribute('aria-hidden', 'true');
        svg.classList.add('creature');
        const use = document.createElementNS(SVG_NS, 'use');
        svg.append(use);
        cell.append(svg);
        gridEl.append(cell);
        cells[r].push(cell);
        creatures[r].push(use);
        drawn[r].push(undefined);
    }
}

function render() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const alive = game.grid[r][c];
            const look = alive ? lookOf(alive, ages[r][c], GameOfLife.countLiveNeighbors(game.grid, r, c)) : null;
            if (drawn[r][c] === look) continue;
            drawn[r][c] = look;
            const cell = cells[r][c];
            cell.classList.toggle('live', look !== null);
            if (look) creatures[r][c].setAttribute('href', `#creature-${look}`);
            cell.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}, ${look ? `alive, ${look}` : 'dead'}`);
        }
    }
    generationEl.textContent = game.generation;
}

// Polite announcements for manual actions only, never while playing.
function announce(message) {
    statusEl.textContent = message;
}

function moveFocus(row, col, { focus = true } = {}) {
    cells[focusRow][focusCol].tabIndex = -1;
    focusRow = Math.max(0, Math.min(size - 1, row));
    focusCol = Math.max(0, Math.min(size - 1, col));
    const cell = cells[focusRow][focusCol];
    cell.tabIndex = 0;
    if (focus) cell.focus();
}

// Playing

let timer = null;

function speed() {
    return Number(speedInput.value);
}

function isPlaying() {
    return timer !== null;
}

function tick() {
    const previous = game.grid;
    game.step();
    ages = nextAges(previous, game.grid, ages);
    render();
}

function startTimer() {
    timer = setInterval(tick, 1000 / speed());
}

function play() {
    if (isPlaying()) return;
    startTimer();
    updateControls();
}

function pause() {
    if (!isPlaying()) return;
    clearInterval(timer);
    timer = null;
    updateControls();
}

function updateControls() {
    const playing = isPlaying();
    playButton.classList.toggle('playing', playing);
    playLabel.textContent = playing ? 'Pause' : 'Play';
    stepButton.disabled = playing;
}

// Events

// Drawing with a mouse, pen or finger: press on a cell and drag across others.
// Starting on a dead cell brings cells to life; starting on a live one erases.
let paintAlive = null;
let lastRow = 0;
let lastCol = 0;

function setCell(row, col) {
    if ((game.grid[row][col] === 1) !== paintAlive) toggleByHand(row, col);
}

// A fast drag can jump several cells between pointer events, so fill in the cells along the way.
function paintTo(row, col) {
    const steps = Math.max(Math.abs(row - lastRow), Math.abs(col - lastCol));
    for (let i = 1; i <= steps; i++) {
        setCell(Math.round(lastRow + (row - lastRow) * i / steps), Math.round(lastCol + (col - lastCol) * i / steps));
    }
    lastRow = row;
    lastCol = col;
    moveFocus(row, col, { focus: false });
    render();
}

gridEl.addEventListener('pointerdown', event => {
    const cell = event.target.closest('.cell');
    if (!cell || event.button !== 0) return;
    lastRow = Number(cell.dataset.row);
    lastCol = Number(cell.dataset.col);
    paintAlive = game.grid[lastRow][lastCol] === 0;
    setCell(lastRow, lastCol);
    paintTo(lastRow, lastCol);
});

// A touch pointer stays tied to the cell it started on, so find the cell under it instead.
gridEl.addEventListener('pointermove', event => {
    if (paintAlive === null) return;
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest('.cell');
    if (cell) paintTo(Number(cell.dataset.row), Number(cell.dataset.col));
});

window.addEventListener('pointerup', () => { paintAlive = null; });
window.addEventListener('pointercancel', () => { paintAlive = null; });

// Space and Enter on a focused cell arrive as a click with no pointer (detail 0).
gridEl.addEventListener('click', event => {
    const cell = event.target.closest('.cell');
    if (!cell || event.detail !== 0) return;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    toggleByHand(row, col);
    moveFocus(row, col, { focus: false });
    render();
});

const KEY_MOVES = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
};

gridEl.addEventListener('keydown', event => {
    if (KEY_MOVES[event.key]) {
        const [dr, dc] = KEY_MOVES[event.key];
        moveFocus(focusRow + dr, focusCol + dc);
    } else if (event.key === 'Home') {
        moveFocus(focusRow, 0);
    } else if (event.key === 'End') {
        moveFocus(focusRow, size - 1);
    } else {
        return; // Space and Enter reach the button as a click.
    }
    event.preventDefault();
});

playButton.addEventListener('click', () => {
    if (isPlaying()) pause();
    else play();
});

stepButton.addEventListener('click', () => {
    tick();
    announce(`Generation ${game.generation}`);
});

clearButton.addEventListener('click', () => {
    pause();
    game.clear();
    resetAges();
    render();
    announce('Grid cleared. Generation 0');
});

// The readout shows "5 / s"; screen readers hear the unit spelled out.
function showSpeed() {
    speedValue.textContent = `${speed()} / s`;
    speedInput.setAttribute('aria-valuetext', `${speed()} generations per second`);
}

speedInput.addEventListener('input', () => {
    showSpeed();
    if (isPlaying()) {
        clearInterval(timer);
        startTimer();
    }
});

loadButton.addEventListener('click', () => {
    pause();
    const name = patternSelect.value;
    game.loadPattern(name);
    resetAges();
    render();
    announce(`${patternSelect.selectedOptions[0].text} loaded. Generation 0`);
});

// Light and dark mode. The page follows the system until the visitor picks one,
// and the choice is remembered on this device (index.html applies it before the first paint).
// styles.css shows the right icon and label for each mode; this only switches and saves.
const themeButton = document.getElementById('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
    return document.documentElement.dataset.theme ?? (systemDark.matches ? 'dark' : 'light');
}

// The ?. covers a browser briefly pairing an older cached page with this script.
themeButton?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    announce(`${next === 'dark' ? 'Dark' : 'Light'} mode on`);
});

// First view: a glider at generation 0, so Play does something straight away.
game.loadPattern('glider');
resetAges();
moveFocus(Math.floor((size - 3) / 2), Math.floor((size - 3) / 2), { focus: false });
render();
updateControls();
showSpeed();
