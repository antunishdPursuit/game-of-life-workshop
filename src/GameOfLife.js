class GameOfLife {
    constructor(rows=10, cols=10){
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createGrid()
        this.generation = 0;
    }
    createGrid() {
        const grid = [];
        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(0);
            }
            grid.push(row);
        }
        return grid;
    }
    step() {
        this.grid = GameOfLife.nextGeneration(this.grid);
        this.generation++;
    }
    toggleCell(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            throw new RangeError(`Cell (${row}, ${col}) is outside the ${this.rows}x${this.cols} grid`);
        }
        this.grid[row][col] = this.grid[row][col] === 1 ? 0 : 1;
    }
    clear() {
        this.grid = this.createGrid();
        this.generation = 0;
    }
    // Clears the grid and places a starter pattern in the middle.
    loadPattern(name) {
        const pattern = GameOfLife.PATTERNS[name];
        if (!pattern) {
            throw new RangeError(`Unknown pattern: ${name}`);
        }
        const height = pattern.length;
        const width = pattern[0].length;
        if (height > this.rows || width > this.cols) {
            throw new RangeError(`Pattern ${name} does not fit in the ${this.rows}x${this.cols} grid`);
        }
        this.clear();
        const top = Math.floor((this.rows - height) / 2);
        const left = Math.floor((this.cols - width) / 2);
        pattern.forEach((line, r) => {
            [...line].forEach((ch, c) => {
                if (ch === '#') this.grid[top + r][left + c] = 1;
            });
        });
    }

    // Starter patterns drawn as text: '#' is alive, '.' is dead.
    static PATTERNS = {
        block: ['##', '##'],
        blinker: ['###'],
        glider: ['.#.', '..#', '###'],
    };

    // Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent.
    // Cells outside the grid count as dead.
    static countLiveNeighbors(grid, row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < grid.length && c >= 0 && c < grid[r].length) {
                    count += grid[r][c];
                }
            }
        }
        return count;
    }

    // At each step in time, the following transitions occur. Every cell is
    // decided from the old grid, so a new grid is built instead of changing it in place.
    static nextGeneration(grid) {
        return grid.map((row, r) => row.map((cell, c) => {
            const neighbors = GameOfLife.countLiveNeighbors(grid, r, c);
            if (cell === 1) {
                // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
                // Any live cell with two or three live neighbours lives on to the next generation.
                // Any live cell with more than three live neighbours dies, as if by overpopulation.
                return neighbors === 2 || neighbors === 3 ? 1 : 0;
            }
            // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
            return neighbors === 3 ? 1 : 0;
        }));
    }
}

export default GameOfLife;
