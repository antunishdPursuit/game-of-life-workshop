# Game of Life Workshop

A test-first Conway's Game of Life in vanilla JavaScript, with a C# companion engine held to the same tests.

[Try Game of Life live](https://antunishdpursuit.github.io/game-of-life-workshop/)

The page runs entirely in the browser. It does not require an account, backend, build step or API key.

## Why It Exists

This repository started as a workshop exercise in AI pair programming. The goal was not only a working simulation but a visible method: describe each behaviour as a failing test, let the AI assistant make it pass, review the result, and keep every step as its own commit. The C# companion shows the same contract holding in a second language.

## What You Can Do

- Draw or erase live cells by clicking or tapping the grid
- Load a block, blinker or glider into the middle of the grid
- Play and pause the simulation, or step one generation at a time
- Change the speed from 1 to 20 generations per second
- Clear the grid and reset the generation counter
- Use the whole page with the keyboard alone
- Use it on desktop or phone, in light or dark mode

The page opens with a glider loaded, so Play does something straight away.

## How It Works

```text
Click, tap or key press
  -> app.js (draws the grid, handles input, runs the timer)
  -> src/GameOfLife.js (owns the grid and the rules)
  -> nextGeneration: every cell decided from the previous grid at once
  -> app.js redraws only the cells that changed
```

Each step applies the four rules to every cell simultaneously:

- A live cell with two or three live neighbours survives
- A live cell with fewer than two live neighbours dies of underpopulation
- A live cell with more than three live neighbours dies of overpopulation
- A dead cell with exactly three live neighbours comes alive

The grid is finite. Cells past the edge count as dead, so on the full 24 × 24 grid the opening glider settles into a still 2 × 2 block in the corner after 47 generations.

## Controls

### Desktop

- Toggle a cell: click it
- Enter the grid: `Tab` (the grid is a single tab stop)
- Move between cells: arrow keys, or `Home` and `End` for the ends of a row
- Toggle the focused cell: `Space` or `Enter`
- Leave the grid: `Tab` to the Play button

### Phone

- Toggle a cell: tap it
- The grid sits above the controls and keeps every cell at least 24px wide

Step, Load and Clear announce the new generation to screen readers. Playing does not, so announcements never flood.

## Built With

- HTML
- CSS
- Vanilla JavaScript (ES modules, no framework or bundler)
- Node's built-in test runner for the JavaScript engine
- C# on .NET 10 with xUnit for the companion engine
- GitHub Pages for deployment

## Run Locally

Requirements:

- Python 3, or any other static file server
- Node.js 20 or later, for the JavaScript tests
- .NET 10 SDK, for the C# tests

The page loads the engine as a JavaScript module, so it needs a local server rather than opening `index.html` as a file:

```bash
python -m http.server 8123
```

Open `http://localhost:8123`.

## Testing

```bash
npm test
dotnet test ProductivityConf.AiPairProgramming.sln
```

`npm test` runs the JavaScript engine tests; there are no packages to install. `dotnet test` builds the solution and runs the C# tests. Both suites check the same behaviour: grid size, neighbour counts at edges and corners, each rule, simultaneous updates, the block, blinker and glider, stepping, toggling, clearing and loading patterns.

The tests cover the engines, not the page. The page was checked by hand in a browser with mouse and keyboard at desktop, tablet and phone widths, in light and dark mode. It has not yet been tested with a screen reader or on a real phone.

## Technical Notes

- The rules live only in the engine. `app.js` has no game logic: it draws the grid and calls `step`, `toggleCell`, `clear` and `loadPattern`.
- `nextGeneration` builds a new grid instead of changing the old one, which is what makes the update simultaneous. A test fails if cells are updated in place.
- The C# engine mirrors the JavaScript API with `bool` cells instead of `0` and `1`.
- The grid size is chosen once on load: as many cells as fit at 24px or larger, up to 24 × 24.
- Only the focused cell is in the tab order (a roving tab index), so the grid costs one `Tab` press instead of hundreds.

## Current Limits

- The grid has fixed edges and does not wrap around
- Resizing the window does not resize the grid; reload to change it
- There are three starter patterns and no saving or sharing
- The C# engine is a library with tests and has no interface
- Screen-reader and real-phone testing are still pending

## Project Lineage

The repository began on April 2, 2025 as [Marco Pierobon](https://github.com/marcopierobontw)'s C#/.NET 8 scaffold for an AI pair-programming workshop: a solution, an empty class library and an xUnit test project. The first three commits are his. In the workshop, [Dennis](https://github.com/antunishdPursuit) switched the exercise to JavaScript and wrote a `GameOfLife` class that built an empty 10 × 10 grid, with a first test for its size.

In October 2026 Dennis finished the project with Claude Code, an AI coding assistant, as the pair programmer. Dennis chose the direction (a browser simulation, a C# companion instead of deleting the starter, GitHub Pages) and approved each step and the visual design; the assistant wrote the code from that point under that direction. Every behaviour began as a failing test, and each commit was checked from a clean copy of the repository so it builds and passes on its own.

## Credits

- Workshop scaffold: [Marco Pierobon](https://github.com/marcopierobontw)
- Game of Life: devised by John Horton Conway in 1970

## Status

The JavaScript engine, the C# companion and the browser page are complete and tested. GitHub Pages publishing, screen-reader testing and real-phone testing are pending.
