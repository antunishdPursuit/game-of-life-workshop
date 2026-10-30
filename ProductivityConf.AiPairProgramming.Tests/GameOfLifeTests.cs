using ProductivityConf.AiPairProgramming.Library;

namespace ProductivityConf.AiPairProgramming.Tests;

// Mirrors src/GameOfLife.test.js so both engines are held to the same contract.
public class GameOfLifeTests
{
    // Builds a grid from rows of text: '#' is alive, '.' is dead.
    private static bool[,] Parse(params string[] rows)
    {
        var grid = new bool[rows.Length, rows[0].Length];
        for (var r = 0; r < rows.Length; r++)
        {
            for (var c = 0; c < rows[r].Length; c++)
            {
                grid[r, c] = rows[r][c] == '#';
            }
        }
        return grid;
    }

    private static void AssertGrid(bool[,] expected, bool[,] actual)
    {
        Assert.Equal(expected.GetLength(0), actual.GetLength(0));
        Assert.Equal(expected.GetLength(1), actual.GetLength(1));
        Assert.Equal(expected, actual);
    }

    // Grid

    [Fact]
    public void CreatesA10By10GridByDefault()
    {
        var game = new GameOfLife();

        Assert.Equal(10, game.Grid.GetLength(0));
        Assert.Equal(10, game.Grid.GetLength(1));
    }

    [Fact]
    public void UsesTheRowsAndColsPassedIn()
    {
        var game = new GameOfLife(3, 5);

        Assert.Equal(3, game.Grid.GetLength(0));
        Assert.Equal(5, game.Grid.GetLength(1));
    }

    [Fact]
    public void StartsWithEveryCellDead()
    {
        var game = new GameOfLife(4, 6);

        Assert.All(game.Grid.Cast<bool>(), cell => Assert.False(cell));
    }

    [Fact]
    public void StartsAtGenerationZero()
    {
        Assert.Equal(0, new GameOfLife().Generation);
    }

    // CountLiveNeighbors

    private static readonly bool[,] Full = Parse(
        "###",
        "###",
        "###");

    [Fact]
    public void CountsAllEightNeighboursOfAMiddleCell()
    {
        Assert.Equal(8, GameOfLife.CountLiveNeighbors(Full, 1, 1));
    }

    [Fact]
    public void DoesNotCountTheCellItself()
    {
        var lone = Parse(
            "...",
            ".#.",
            "...");

        Assert.Equal(0, GameOfLife.CountLiveNeighbors(lone, 1, 1));
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(2, 2)]
    public void TreatsCellsOutsideACornerAsDead(int row, int col)
    {
        Assert.Equal(3, GameOfLife.CountLiveNeighbors(Full, row, col));
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(1, 2)]
    public void TreatsCellsOutsideAnEdgeAsDead(int row, int col)
    {
        Assert.Equal(5, GameOfLife.CountLiveNeighbors(Full, row, col));
    }

    // NextGeneration rules

    [Fact]
    public void LiveCellWithFewerThanTwoNeighboursDies()
    {
        var next = GameOfLife.NextGeneration(Parse(
            "...",
            "##.",
            "..."));

        Assert.False(next[1, 1]);
    }

    [Fact]
    public void LiveCellWithTwoNeighboursLivesOn()
    {
        var next = GameOfLife.NextGeneration(Parse(
            "#..",
            ".#.",
            "..#"));

        Assert.True(next[1, 1]);
    }

    [Fact]
    public void LiveCellWithThreeNeighboursLivesOn()
    {
        var next = GameOfLife.NextGeneration(Parse(
            "#.#",
            ".#.",
            "..#"));

        Assert.True(next[1, 1]);
    }

    [Fact]
    public void LiveCellWithMoreThanThreeNeighboursDies()
    {
        var next = GameOfLife.NextGeneration(Parse(
            "#.#",
            ".#.",
            "#.#"));

        Assert.False(next[1, 1]);
    }

    [Fact]
    public void DeadCellWithExactlyThreeNeighboursComesAlive()
    {
        var next = GameOfLife.NextGeneration(Parse(
            "#.#",
            "...",
            ".#."));

        Assert.True(next[1, 1]);
    }

    [Fact]
    public void DeadCellWithTwoOrFourNeighboursStaysDead()
    {
        Assert.False(GameOfLife.NextGeneration(Parse("#.#", "...", "..."))[1, 1]);
        Assert.False(GameOfLife.NextGeneration(Parse("#.#", "...", "#.#"))[1, 1]);
    }

    [Fact]
    public void UpdatesEveryCellAtOnceFromThePreviousGeneration()
    {
        // If cells were updated in place, the top row's changes would leak
        // into the counts for the rows below and the result would differ.
        var next = GameOfLife.NextGeneration(Parse(
            ".....",
            "..#..",
            "..#..",
            "..#..",
            "....."));

        AssertGrid(Parse(
            ".....",
            ".....",
            ".###.",
            ".....",
            "....."), next);
    }

    [Fact]
    public void DoesNotChangeTheGridItIsGiven()
    {
        var grid = Parse("##", "##");
        var copy = (bool[,])grid.Clone();

        GameOfLife.NextGeneration(grid);

        AssertGrid(copy, grid);
    }

    // Known patterns

    [Fact]
    public void BlockStaysTheSame()
    {
        var block = Parse(
            "....",
            ".##.",
            ".##.",
            "....");

        AssertGrid(block, GameOfLife.NextGeneration(block));
    }

    [Fact]
    public void BlinkerFlipsBetweenALineAndAColumn()
    {
        var horizontal = Parse(
            ".....",
            ".....",
            ".###.",
            ".....",
            ".....");
        var vertical = Parse(
            ".....",
            "..#..",
            "..#..",
            "..#..",
            ".....");

        AssertGrid(vertical, GameOfLife.NextGeneration(horizontal));
        AssertGrid(horizontal, GameOfLife.NextGeneration(vertical));
    }

    [Fact]
    public void BlinkerAgainstTheEdgeLosesTheCellsThatWouldFallOutside()
    {
        var next = GameOfLife.NextGeneration(Parse(
            "###",
            "...",
            "..."));

        AssertGrid(Parse(
            ".#.",
            ".#.",
            "..."), next);
    }

    [Fact]
    public void GliderMovesOneCellDownAndRightEveryFourGenerations()
    {
        var grid = Parse(
            ".#....",
            "..#...",
            "###...",
            "......",
            "......",
            "......");
        for (var i = 0; i < 4; i++) grid = GameOfLife.NextGeneration(grid);

        AssertGrid(Parse(
            "......",
            "..#...",
            "...#..",
            ".###..",
            "......",
            "......"), grid);
    }

    // Step

    [Fact]
    public void StepAdvancesTheGridAndGenerationCounter()
    {
        var game = new GameOfLife(5, 5);
        game.Grid = Parse(
            ".....",
            ".....",
            ".###.",
            ".....",
            ".....");

        game.Step();

        Assert.Equal(1, game.Generation);
        AssertGrid(Parse(
            ".....",
            "..#..",
            "..#..",
            "..#..",
            "....."), game.Grid);
    }

    // ToggleCell

    [Fact]
    public void ToggleCellBringsADeadCellToLifeAndKillsALiveOne()
    {
        var game = new GameOfLife(3, 3);

        game.ToggleCell(1, 2);
        Assert.True(game.Grid[1, 2]);

        game.ToggleCell(1, 2);
        Assert.False(game.Grid[1, 2]);
    }

    [Theory]
    [InlineData(3, 0)]
    [InlineData(0, -1)]
    public void ToggleCellRejectsACellOutsideTheGrid(int row, int col)
    {
        var game = new GameOfLife(3, 3);

        Assert.Throws<ArgumentOutOfRangeException>(() => game.ToggleCell(row, col));
    }

    // Clear

    [Fact]
    public void ClearKillsEveryCellAndResetsTheGenerationCounter()
    {
        var game = new GameOfLife(3, 3);
        game.Grid = Parse("###", "###", "###");
        game.Generation = 7;

        game.Clear();

        AssertGrid(Parse("...", "...", "..."), game.Grid);
        Assert.Equal(0, game.Generation);
    }

    // LoadPattern

    [Fact]
    public void OffersBlockBlinkerAndGlider()
    {
        Assert.Equal(new[] { "block", "blinker", "glider" }, GameOfLife.Patterns.Keys);
    }

    [Fact]
    public void LoadPatternClearsTheGridAndPlacesThePatternInTheMiddle()
    {
        var game = new GameOfLife(5, 5);
        game.ToggleCell(0, 0);
        game.Generation = 3;

        game.LoadPattern("glider");

        Assert.Equal(0, game.Generation);
        AssertGrid(Parse(
            ".....",
            "..#..",
            "...#.",
            ".###.",
            "....."), game.Grid);
    }

    [Fact]
    public void LoadPatternRejectsAnUnknownPattern()
    {
        Assert.Throws<ArgumentException>(() => new GameOfLife().LoadPattern("spaceship"));
    }

    [Fact]
    public void LoadPatternRejectsAPatternBiggerThanTheGrid()
    {
        Assert.Throws<ArgumentException>(() => new GameOfLife(2, 2).LoadPattern("glider"));
    }
}
