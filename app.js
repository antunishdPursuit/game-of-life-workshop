import GameOfLife from './src/GameOfLife.js';

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

// One button per cell; only the focused cell is in the tab order (roving tabindex).
const cells = [];
const drawn = [];
let focusRow = 0;
let focusCol = 0;

for (let r = 0; r < size; r++) {
    cells.push([]);
    drawn.push([]);
    for (let c = 0; c < size; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell';
        cell.tabIndex = -1;
        cell.dataset.row = r;
        cell.dataset.col = c;
        gridEl.append(cell);
        cells[r].push(cell);
        drawn[r].push(null);
    }
}

function render() {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const alive = game.grid[r][c] === 1;
            if (drawn[r][c] === alive) continue;
            drawn[r][c] = alive;
            const cell = cells[r][c];
            cell.classList.toggle('live', alive);
            cell.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}, ${alive ? 'alive' : 'dead'}`);
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
    game.step();
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

gridEl.addEventListener('click', event => {
    const cell = event.target.closest('.cell');
    if (!cell) return;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    game.toggleCell(row, col);
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
    render();
    announce('Grid cleared. Generation 0');
});

speedInput.addEventListener('input', () => {
    speedValue.textContent = `${speed()} / s`;
    if (isPlaying()) {
        clearInterval(timer);
        startTimer();
    }
});

loadButton.addEventListener('click', () => {
    pause();
    const name = patternSelect.value;
    game.loadPattern(name);
    render();
    announce(`${patternSelect.selectedOptions[0].text} loaded. Generation 0`);
});

// First view: a glider at generation 0, so Play does something straight away.
game.loadPattern('glider');
moveFocus(Math.floor((size - 3) / 2), Math.floor((size - 3) / 2), { focus: false });
render();
updateControls();
