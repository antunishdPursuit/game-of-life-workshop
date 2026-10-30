// The creatures drawn in live cells, one per look from src/creatures.js.
// Each is a 12 × 12 pixel drawing: b = body, g = elder body, h = hat,
// a = accent (blush, or the whole body when crowded), o = cut-out in the cell colour, . = empty.

const SPRITES = {
    newborn: [
        '............',
        '............',
        '......b.....',
        '.....b......',
        '...bbbbbb...',
        '..bbbbbbbb..',
        '..bobbbbob..',
        '.abobbbboba.',
        '.bbbboobbbb.',
        '..bbbbbbbb..',
        '...bbbbbb...',
        '............',
    ],
    adult: [
        '............',
        '....bbbb....',
        '..bbbbbbbb..',
        '.bbbbbbbbbb.',
        '.bbobbbbobb.',
        'bbbobbbbobbb',
        'baabbbbbbaab',
        'bbbbobbobbbb',
        '.bbbboobbbb.',
        '..bbbbbbbb..',
        '...bb..bb...',
        '............',
    ],
    elder: [
        '...hhhhhh...',
        '...hhhhhh...',
        '.hhhhhhhhhh.',
        '.gggggggggg.',
        '.gggggggggg.',
        'ggooggggoogg',
        'gaaggggggaag',
        'gggggooggggg',
        '.gggggggggg.',
        '..gggggggg..',
        '...gg..gg...',
        '............',
    ],
    lonely: [
        '............',
        '............',
        '....bbbb....',
        '..bbbbbbbb..',
        '.bbbbbbbbbb.',
        '.bbobbbbobb.',
        'bbbobbbbobbb',
        'bbbbbbbbbbbb',
        '.bbobboobbb.',
        '..bbobbobb..',
        '...bb..bb...',
        '............',
    ],
    crowded: [
        '............',
        '............',
        '............',
        '..aaaaaaaa..',
        '.aaaaaaaaaa.',
        'aaoaaaaaaoaa',
        'aaaoaaaaoaaa',
        'aaoaaaaaaoaa',
        'aaaaaaaaaaaa',
        'aaaoaooaoaaa',
        '.aaaaaaaaaa.',
        '..aa....aa..',
    ],
};

// Colours come from the page's tokens, so dark mode needs no second set of drawings.
const COLOURS = {
    b: 'var(--cell-live)',
    h: 'var(--cell-live)',
    g: 'var(--text-muted)',
    a: 'var(--accent)',
    o: 'var(--panel)',
};

const SVG_NS = 'http://www.w3.org/2000/svg';

// Adds one hidden <symbol> per creature to the page; cells show them with <use href="#creature-…">.
// Runs of the same colour in a row become one rectangle to keep the drawing small.
export function addCreatureSymbols() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    for (const [name, rows] of Object.entries(SPRITES)) {
        const symbol = document.createElementNS(SVG_NS, 'symbol');
        symbol.id = `creature-${name}`;
        symbol.setAttribute('viewBox', '0 0 12 12');
        rows.forEach((row, y) => {
            let x = 0;
            while (x < row.length) {
                const ch = row[x];
                let end = x + 1;
                while (end < row.length && row[end] === ch) end++;
                if (ch !== '.') {
                    const rect = document.createElementNS(SVG_NS, 'rect');
                    rect.setAttribute('x', x);
                    rect.setAttribute('y', y);
                    rect.setAttribute('width', end - x);
                    rect.setAttribute('height', 1);
                    rect.style.fill = COLOURS[ch];
                    symbol.append(rect);
                }
                x = end;
            }
        });
        svg.append(symbol);
    }
    document.body.prepend(svg);
}
