// How each live cell is drawn. None of this changes the rules in GameOfLife.js;
// it only reads the grid to pick a creature for each cell.

export const ELDER_AGE = 10;

// Cells already alive at the start count as just born.
export function startAges(grid) {
    return grid.map(row => row.map(cell => (cell === 1 ? 1 : 0)));
}

// A cell that stays alive gets one step older, a newly born cell starts at 1, a dead cell is 0.
export function nextAges(previous, grid, ages) {
    return grid.map((row, r) => row.map((cell, c) => {
        if (cell !== 1) return 0;
        return previous[r][c] === 1 ? ages[r][c] + 1 : 1;
    }));
}

// Checked in order; the first match wins. Crowded and lonely cells die on the next step.
export function lookOf(cell, age, neighbors) {
    if (cell !== 1) return null;
    if (neighbors >= 4) return 'crowded';
    if (neighbors <= 1) return 'lonely';
    if (age === 1) return 'newborn';
    if (age >= ELDER_AGE) return 'elder';
    return 'adult';
}
