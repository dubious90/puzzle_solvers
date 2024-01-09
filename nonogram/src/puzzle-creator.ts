import NonogramSolver, { HistoryResolution, Square } from "./solver";

export interface ExamplePuzzle {
    rows: number[][],
    columns: number[][],
}

/**
 * Given a completed row of YES and NO squares, determines the correct prompt that would enable
 * that permutation.
 * 
 * @param rowCol The row to get the correct prompt for.
 * @returns The prompt.
 */
function getPromptForRowCol(rowCol: Square[]) {
    let prompt: number[] = [];
    let current = 0;
    rowCol.forEach((square: Square) => {
        if (square === Square.YES) {
            current++;
        }
        else if (square === Square.NO) {
            if (current > 0) {
                prompt.push(current);
                current = 0;
            }
        }
        else {
            console.error("this shouldn't happen");
        }
    });
    if (current > 0) {
        prompt.push(current);
    }
    return prompt;
}

/**
 * Given a completed nonogram grid, determines all of the prompts that would lead to this solution.
 * 
 * @param solution A completed nonogram grid state.
 * 
 * @returns An ExamplePuzzle of row and column prompts.
 */
function solutionToPrompts(solution: Square[][]): ExamplePuzzle {
    let puzzle: ExamplePuzzle = {
        rows: [],
        columns: [],
    }
    for (let i = 0; i < solution.length; i++) {
        const row = solution[i];
        const column = solution.map(row => {
            return row[i];
        });
        puzzle.rows.push(getPromptForRowCol(row));
        puzzle.columns.push(getPromptForRowCol(column));
    }
    return puzzle;
}

/**
 * Given a set of prompts, determines if this puzzle is solvable.
 * 
 * @param solver The solver to determine solvability.
 * @param puzzle The prompts defining the current nonogram.
 * @returns Whether the puzzle is solvable or not.
 */
function puzzleIsSolvable(solver: NonogramSolver, puzzle: ExamplePuzzle) {
    const solution: Square[][] = solver.solveNonogram(puzzle.rows, puzzle.columns, []);
    let solvable = true;
    solution.forEach((row) => {
        row.forEach((square: Square) => {
            if (square === Square.MAYBE) {
                solvable = false;
            }
        });
    });
    return solvable;
}

/**
 * Returns a random solvable puzzle for the provided grid size.
 * 
 * @param gridSize The size of puzzle to create.
 * @returns Example Puzzle of column and row prompts.
 */
export function getRandomPuzzle(gridSize: number): ExamplePuzzle {
    let solver = new NonogramSolver();
    solver.setHistoryResolution(HistoryResolution.NEVER);
    return randomPuzzle(gridSize, solver);
}

/**
 * Returns a random solvable puzzle for the provided grid size.
 * 
 * @param gridSize The size of the puzzle to create.
 * @param solver The solver to determine solvability.
 * @returns Example Puzzle of column and row prompts.
 */
function randomPuzzle(gridSize: number, solver: NonogramSolver): ExamplePuzzle {
    let solution: Square[][] = [];
    for (let i = 0; i < gridSize; i++) {
        let row: Square[] = [];
        for (let j = 0; j < gridSize; j++) {
            if (Math.random() < .5) {
                row.push(Square.YES);
            }
            else {
                row.push(Square.NO);
            }
        }
        solution.push(row);
    }

    const puzzle: ExamplePuzzle = solutionToPrompts(solution);

    if (!puzzleIsSolvable(solver, puzzle)) {
        console.log("generated unsolvable puzzle, trying again");
        return randomPuzzle(gridSize, solver);
    }

    return puzzle;
}

/**
 * Gets specifically provided example nonogram puzzles.
 * 
 * If the provided grid size is 5,10, or 15, this will always produce the same puzzle, much faster
 * than generating a random puzzle.
 * 
 * For any other grid size, will produce a random puzzle.
 * 
 * @param gridSize The grid size to create a random puzzle for.
 * 
 * @returns A solvable ExamplePuzzle with row and column prompts.
 */
export function getExamplePuzzle(gridSize: number): ExamplePuzzle {
    if (gridSize === 5) {
        return {
            rows: [[1, 1], [1], [3], [1, 2], [4]],
            columns: [[3], [3], [1, 1, 1], [2], [2]],
        }
    }
    else if (gridSize === 10) {
        return {
            rows: [
                [6],
                [6, 1],
                [6, 3],
                [1, 1],
                [6, 3],
                [6, 1],
                [6],
                [3, 2],
                [1, 8],
                [10],
            ],
            columns: [
                [3, 3],
                [1, 1, 1, 1],
                [5, 3],
                [2, 2, 2],
                [3, 3, 2],
                [3, 3, 2],
                [2, 2, 2],
                [3, 3, 2],
                [1, 1, 1, 4],
                [3, 6],
            ],
        }
    }
    else if (gridSize === 15) {
        return {
            rows: [
                [11],
                [6, 2],
                [5, 1],
                [5, 1],
                [5, 1],
                [5, 1],
                [6, 3],
                [15],
                [1, 3],
                [14],
                [6, 2],
                [3, 2],
                [3, 1],
                [8],
                [7],
            ],
            columns: [
                [3, 4],
                [8, 2],
                [8, 2],
                [8, 2],
                [8, 2],
                [2, 4, 3],
                [1, 1, 4],
                [1, 1, 1, 3],
                [1, 1, 1, 3],
                [1, 1, 1, 2],
                [1, 1, 1, 2],
                [2, 4, 1, 2],
                [3, 5, 2],
                [6, 2],
                [2, 4],
            ],
        }
    }
    else {
        let puzzle: ExamplePuzzle = {
            rows: [],
            columns: [],
        }
        for (let i = 0; i < gridSize; i++) {
            puzzle.rows.push([i + 1]);
            puzzle.columns.push([i + 1]);
        }
        return puzzle;
    }
}