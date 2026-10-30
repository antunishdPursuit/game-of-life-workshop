namespace ProductivityConf.AiPairProgramming.Library;

// C# companion to src/GameOfLife.js. Same rules and behaviour; cells are bools instead of 0/1.
public class GameOfLife
{
    // Starter patterns drawn as text: '#' is alive, '.' is dead.
    public static IReadOnlyDictionary<string, string[]> Patterns { get; } = new Dictionary<string, string[]>
    {
        ["block"] = ["##", "##"],
        ["blinker"] = ["###"],
        ["glider"] = [".#.", "..#", "###"],
    };

    public GameOfLife(int rows = 10, int cols = 10)
    {
        Rows = rows;
        Cols = cols;
        Grid = new bool[rows, cols];
    }

    public int Rows { get; }
    public int Cols { get; }
    public bool[,] Grid { get; set; }
    public int Generation { get; set; }

    public void Step()
    {
        Grid = NextGeneration(Grid);
        Generation++;
    }

    public void ToggleCell(int row, int col)
    {
        if (row < 0 || row >= Rows || col < 0 || col >= Cols)
        {
            throw new ArgumentOutOfRangeException(nameof(row), $"Cell ({row}, {col}) is outside the {Rows}x{Cols} grid");
        }
        Grid[row, col] = !Grid[row, col];
    }

    public void Clear()
    {
        Grid = new bool[Rows, Cols];
        Generation = 0;
    }

    // Clears the grid and places a starter pattern in the middle.
    public void LoadPattern(string name)
    {
        if (!Patterns.TryGetValue(name, out var pattern))
        {
            throw new ArgumentException($"Unknown pattern: {name}", nameof(name));
        }
        var height = pattern.Length;
        var width = pattern[0].Length;
        if (height > Rows || width > Cols)
        {
            throw new ArgumentException($"Pattern {name} does not fit in the {Rows}x{Cols} grid", nameof(name));
        }
        Clear();
        var top = (Rows - height) / 2;
        var left = (Cols - width) / 2;
        for (var r = 0; r < height; r++)
        {
            for (var c = 0; c < width; c++)
            {
                if (pattern[r][c] == '#') Grid[top + r, left + c] = true;
            }
        }
    }

    // Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent.
    // Cells outside the grid count as dead.
    public static int CountLiveNeighbors(bool[,] grid, int row, int col)
    {
        var count = 0;
        for (var dr = -1; dr <= 1; dr++)
        {
            for (var dc = -1; dc <= 1; dc++)
            {
                if (dr == 0 && dc == 0) continue;
                var r = row + dr;
                var c = col + dc;
                if (r >= 0 && r < grid.GetLength(0) && c >= 0 && c < grid.GetLength(1) && grid[r, c])
                {
                    count++;
                }
            }
        }
        return count;
    }

    // Every cell is decided from the old grid, so a new grid is built instead of changing it in place.
    public static bool[,] NextGeneration(bool[,] grid)
    {
        var rows = grid.GetLength(0);
        var cols = grid.GetLength(1);
        var next = new bool[rows, cols];
        for (var r = 0; r < rows; r++)
        {
            for (var c = 0; c < cols; c++)
            {
                var neighbors = CountLiveNeighbors(grid, r, c);
                // Any live cell with two or three live neighbours lives on; fewer dies by underpopulation, more by overpopulation.
                // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                next[r, c] = grid[r, c] ? neighbors is 2 or 3 : neighbors == 3;
            }
        }
        return next;
    }
}
