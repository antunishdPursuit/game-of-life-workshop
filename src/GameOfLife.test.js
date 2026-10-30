import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import GameOfLife from './GameOfLife.js';

// Builds a grid from rows of text: '#' is alive, '.' is dead.
function parse(...rows) {
    return rows.map(row => [...row].map(ch => (ch === '#' ? 1 : 0)));
}

describe('Game of Life Grid', () => {
    test('should create a 10x10 grid by default', () => {
        const game = new GameOfLife();

        assert.equal(game.grid.length, 10);
        game.grid.forEach(row => assert.equal(row.length, 10));
    });

    test('should use the rows and cols passed in', () => {
        const game = new GameOfLife(3, 5);

        assert.equal(game.grid.length, 3);
        game.grid.forEach(row => assert.equal(row.length, 5));
    });

    test('should start with every cell dead', () => {
        const game = new GameOfLife(4, 6);

        game.grid.forEach(row => row.forEach(cell => assert.equal(cell, 0)));
    });

    test('should start at generation 0', () => {
        assert.equal(new GameOfLife().generation, 0);
    });
});

describe('countLiveNeighbors', () => {
    const full = parse(
        '###',
        '###',
        '###',
    );

    test('counts all eight neighbours of a middle cell', () => {
        assert.equal(GameOfLife.countLiveNeighbors(full, 1, 1), 8);
    });

    test('does not count the cell itself', () => {
        const lone = parse(
            '...',
            '.#.',
            '...',
        );
        assert.equal(GameOfLife.countLiveNeighbors(lone, 1, 1), 0);
    });

    test('treats cells outside a corner as dead', () => {
        assert.equal(GameOfLife.countLiveNeighbors(full, 0, 0), 3);
        assert.equal(GameOfLife.countLiveNeighbors(full, 2, 2), 3);
    });

    test('treats cells outside an edge as dead', () => {
        assert.equal(GameOfLife.countLiveNeighbors(full, 0, 1), 5);
        assert.equal(GameOfLife.countLiveNeighbors(full, 1, 2), 5);
    });
});

describe('nextGeneration rules', () => {
    test('a live cell with fewer than two live neighbours dies (underpopulation)', () => {
        const next = GameOfLife.nextGeneration(parse(
            '...',
            '##.',
            '...',
        ));
        assert.equal(next[1][1], 0);
    });

    test('a live cell with two live neighbours lives on', () => {
        const next = GameOfLife.nextGeneration(parse(
            '#..',
            '.#.',
            '..#',
        ));
        assert.equal(next[1][1], 1);
    });

    test('a live cell with three live neighbours lives on', () => {
        const next = GameOfLife.nextGeneration(parse(
            '#.#',
            '.#.',
            '..#',
        ));
        assert.equal(next[1][1], 1);
    });

    test('a live cell with more than three live neighbours dies (overpopulation)', () => {
        const next = GameOfLife.nextGeneration(parse(
            '#.#',
            '.#.',
            '#.#',
        ));
        assert.equal(next[1][1], 0);
    });

    test('a dead cell with exactly three live neighbours comes alive (reproduction)', () => {
        const next = GameOfLife.nextGeneration(parse(
            '#.#',
            '...',
            '.#.',
        ));
        assert.equal(next[1][1], 1);
    });

    test('a dead cell with two or four live neighbours stays dead', () => {
        assert.equal(GameOfLife.nextGeneration(parse('#.#', '...', '...'))[1][1], 0);
        assert.equal(GameOfLife.nextGeneration(parse('#.#', '...', '#.#'))[1][1], 0);
    });

    test('updates every cell at once from the previous generation', () => {
        // If cells were updated in place, the top row's changes would leak
        // into the counts for the rows below and the result would differ.
        const next = GameOfLife.nextGeneration(parse(
            '.....',
            '..#..',
            '..#..',
            '..#..',
            '.....',
        ));
        assert.deepEqual(next, parse(
            '.....',
            '.....',
            '.###.',
            '.....',
            '.....',
        ));
    });

    test('does not change the grid it is given', () => {
        const grid = parse('##', '##');
        const copy = grid.map(row => [...row]);

        GameOfLife.nextGeneration(grid);

        assert.deepEqual(grid, copy);
    });
});

describe('known patterns', () => {
    test('a block stays the same (still life)', () => {
        const block = parse(
            '....',
            '.##.',
            '.##.',
            '....',
        );
        assert.deepEqual(GameOfLife.nextGeneration(block), block);
    });

    test('a blinker flips between a line and a column (period 2)', () => {
        const horizontal = parse(
            '.....',
            '.....',
            '.###.',
            '.....',
            '.....',
        );
        const vertical = parse(
            '.....',
            '..#..',
            '..#..',
            '..#..',
            '.....',
        );
        assert.deepEqual(GameOfLife.nextGeneration(horizontal), vertical);
        assert.deepEqual(GameOfLife.nextGeneration(vertical), horizontal);
    });

    test('a blinker against the edge loses the cells that would fall outside', () => {
        const next = GameOfLife.nextGeneration(parse(
            '###',
            '...',
            '...',
        ));
        assert.deepEqual(next, parse(
            '.#.',
            '.#.',
            '...',
        ));
    });

    test('a glider moves one cell down and right every four generations', () => {
        let grid = parse(
            '.#....',
            '..#...',
            '###...',
            '......',
            '......',
            '......',
        );
        for (let i = 0; i < 4; i++) grid = GameOfLife.nextGeneration(grid);

        assert.deepEqual(grid, parse(
            '......',
            '..#...',
            '...#..',
            '.###..',
            '......',
            '......',
        ));
    });
});

describe('step', () => {
    test('advances the game grid and generation counter', () => {
        const game = new GameOfLife(5, 5);
        game.grid = parse(
            '.....',
            '.....',
            '.###.',
            '.....',
            '.....',
        );

        game.step();

        assert.equal(game.generation, 1);
        assert.deepEqual(game.grid, parse(
            '.....',
            '..#..',
            '..#..',
            '..#..',
            '.....',
        ));
    });
});
