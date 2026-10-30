import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { startAges, nextAges, lookOf } from './creatures.js';

// Builds a grid from rows of text: '#' is alive, '.' is dead.
function parse(...rows) {
    return rows.map(row => [...row].map(ch => (ch === '#' ? 1 : 0)));
}

describe('startAges', () => {
    test('gives every live cell age 1 and every dead cell age 0', () => {
        assert.deepEqual(startAges(parse('#.', '.#')), [[1, 0], [0, 1]]);
    });
});

describe('nextAges', () => {
    test('a cell that stays alive gets one step older', () => {
        assert.deepEqual(nextAges(parse('#'), parse('#'), [[4]]), [[5]]);
    });

    test('a cell that is born starts at age 1', () => {
        assert.deepEqual(nextAges(parse('.'), parse('#'), [[0]]), [[1]]);
    });

    test('a cell that dies goes back to age 0', () => {
        assert.deepEqual(nextAges(parse('#'), parse('.'), [[7]]), [[0]]);
    });
});

describe('lookOf', () => {
    test('a dead cell has no look', () => {
        assert.equal(lookOf(0, 0, 3), null);
    });

    test('a live cell with 4 or more neighbours is crowded, whatever its age', () => {
        assert.equal(lookOf(1, 1, 4), 'crowded');
        assert.equal(lookOf(1, 20, 8), 'crowded');
    });

    test('a live cell with 0 or 1 neighbours is lonely, whatever its age', () => {
        assert.equal(lookOf(1, 1, 0), 'lonely');
        assert.equal(lookOf(1, 20, 1), 'lonely');
    });

    test('a comfortable cell born this step is a newborn', () => {
        assert.equal(lookOf(1, 1, 2), 'newborn');
    });

    test('a comfortable cell alive 10 steps or more is an elder', () => {
        assert.equal(lookOf(1, 10, 3), 'elder');
    });

    test('any other comfortable cell is an adult', () => {
        assert.equal(lookOf(1, 2, 2), 'adult');
        assert.equal(lookOf(1, 9, 3), 'adult');
    });
});
