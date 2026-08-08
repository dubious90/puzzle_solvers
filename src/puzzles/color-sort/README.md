# Color Sort Puzzle Solver

Solves "water sort" style puzzles where colored liquid segments fill tubes and need to be sorted so each tube contains only one color.

## How It Works

The solver uses breadth-first search (BFS) to explore all valid move sequences. It tracks visited states to avoid cycles, and returns the shortest solution path when one is found.

## Usage

1. Set the number of pipes (tubes) using the slider.
2. Pick colors and click them to fill pipes — or use "Generate Random Puzzle" / "Use Example Puzzle".
3. Click "Find Solution" to run the solver.
4. Scrub through the solution steps with the history slider.

