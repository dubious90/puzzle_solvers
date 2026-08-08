# Nonogram Puzzle Solver

Solves nonogram (picross) puzzles using constraint propagation. Given row and column clues, it determines which cells are filled or empty.

## How It Works

The solver generates all valid permutations for each row/column based on its clue, then iteratively eliminates possibilities by cross-referencing row and column constraints until the grid is fully resolved. History is captured at configurable granularity for step-by-step playback.

## Usage

1. Set grid size (5, 10, or 15) using the slider.
2. Click on row/column prompts to enter clues as comma-separated numbers (e.g. `3,2,1`).
3. Or use "Use Example Puzzle" / "Generate Random Puzzle".
4. Click "Find Solution" to solve.
5. Scrub through the solution history with the slider.
