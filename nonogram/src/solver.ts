import assert from "assert";


export enum Square {
    MAYBE,
    NO,
    YES,
}

export enum HistoryResolution {
    // Every time a square is updated, create a history node.
    EVERY_STEP,
    // Every time a row or column is updated, create a history node.
    EVERY_ROW_OR_COLUMN,
    // Every iteration of going through the puzzle, create a history node.
    ON_PASSTHROUGH,
    // Never create history nodes.
    NEVER,
}

function copyTwoDimensionalArray(oldArray: Array<Array<Square>>) {
    let newArray: Array<Array<Square>> = [];
    oldArray.forEach((nestedArray: Array<any>) => {
        newArray.push(nestedArray.slice());
    })
    return newArray;
}

// Represents a row or column.
export interface RowCol {
    // The current state of the squares
    current: Array<Square>;
    // All remaining possibilities for what this row or column could be
    possibilities: Array<Array<Square>>;
    // The prompt defining the structure of this column
    prompt: Array<number>;
}

interface Grid {
    // The grid contains duplicated row and column information for easier manipulation.
    rows: Array<RowCol>,
    cols: Array<RowCol>,
}

export type GridHistory = Array<Array<Array<Square>>>;

export default class NonogramSolver {
    private initialPossibilityMap = new Map<number, Map<string, Array<Array<Square>>>>;
    private allPermutations = new Map<number, Array<Array<Square>>>;
    private historyResolution = HistoryResolution.EVERY_ROW_OR_COLUMN;

    setHistoryResolution(resolution: HistoryResolution) {
        this.historyResolution = resolution;
    }

    getPermutations(gridSize: number) {
        let permutations = this.allPermutations.get(gridSize);
        if (permutations) {
            return permutations;
        }

        permutations = [[]];

        for (let i = 0; i < gridSize; i++) {
            let nextPermutations: Array<Array<Square>> = [];
            permutations.forEach((workingRowCol) => {
                let newPermutation: Array<Square> = workingRowCol.slice();
                newPermutation.push(Square.YES);
                nextPermutations.push(newPermutation);

                newPermutation = workingRowCol.slice();
                newPermutation.push(Square.NO);
                nextPermutations.push(newPermutation);
            });
            permutations = nextPermutations;
        }

        this.allPermutations.set(gridSize, permutations);

        return permutations;
    }

    validSequenceForPrompt(sequence: Array<Square>, prompt: Array<number>) {
        let promptIndex = 0;
        let counting = 0;
        for (let i = 0; i < sequence.length; i++) {
            if (sequence[i] === Square.YES) {
                counting++;
                if (promptIndex >= prompt.length || counting > prompt[promptIndex]) {
                    return false;
                }
            }
            else if (sequence[i] === Square.NO && counting > 0) {
                if (promptIndex >= prompt.length || counting < prompt[promptIndex]) {
                    return false;
                }
                else if (counting === prompt[promptIndex]) {
                    counting = 0;
                    promptIndex++;
                }
                else {
                    throw Error("How in the world");
                }
            }
            else if (sequence[i] === Square.NO) {
                // Do nothing?
            }
        }

        if (promptIndex === prompt.length || (promptIndex === prompt.length - 1 && prompt[promptIndex] === counting)) {
            return true;
        }
        return false;
    }

    getInitialPossibilitiesForPrompt(gridSize: number, prompt: Array<number>) {
        // Check if we already have determined the initial possibilities.
        let promptsToPossibilitiesMap = this.initialPossibilityMap.get(gridSize) || new Map<string, Array<Array<Square>>>();
        const promptKey = prompt.join("|");
        const storedPossibilities = promptsToPossibilitiesMap.get(promptKey);
        if (storedPossibilities) {
            return copyTwoDimensionalArray(storedPossibilities);
        }

        let possiblePermutations: Array<Array<Square>> = [];
        const allPermutations = this.getPermutations(gridSize);
        allPermutations.forEach((permutation) => {
            if (this.validSequenceForPrompt(permutation, prompt)) {
                possiblePermutations.push(permutation.slice());
            }
        });

        promptsToPossibilitiesMap.set(promptKey, possiblePermutations);
        this.initialPossibilityMap.set(gridSize, promptsToPossibilitiesMap);
        return possiblePermutations;
    }

    // constructor(gridSize: number, prompt: Array<number>) {
    createRowCol(gridSize: number, prompt: Array<number>): RowCol {
        const possibilities = this.getInitialPossibilitiesForPrompt(gridSize, prompt);
        return {
            current: new Array(gridSize).fill(Square.MAYBE),
            prompt,
            possibilities,
        }
    }

    createGrid(rowPrompts: Array<Array<number>>, colPrompts: Array<Array<number>>): Grid {
        const gridSize = rowPrompts.length;
        let rows = [];
        let cols = []

        for (let i = 0; i < gridSize; i++) {
            rows.push(this.createRowCol(gridSize, rowPrompts[i]));
            cols.push(this.createRowCol(gridSize, colPrompts[i]));
        }

        return {
            rows,
            cols,
        };
    }

    setSquareOnRowCol(rowCol: RowCol, index: number, val: Square) {
        rowCol.current[index] = val;
        let filteredPossibilities: Array<Array<Square>> = [];
        rowCol.possibilities.forEach((possibility) => {
            if (possibility[index] === val) {
                filteredPossibilities.push(possibility.slice());
            }
            else {
                // console.log("filtered a possibility out");
            }
        });
        rowCol.possibilities = filteredPossibilities;
    }

    filterCurrentValuesToPossibilities(rowCol: RowCol, setSquareFunction: (index: number, val: Square) => void) {
        for (let i = 0; i < rowCol.current.length; i++) {
            if (rowCol.current[i] === Square.MAYBE) {
                if (rowCol.possibilities.length === 0) {
                    throw Error("Ran out of possibilities");
                }
                let firstVal = rowCol.possibilities[0][i];
                let allSame = true;
                rowCol.possibilities.forEach((possibility) => {
                    if (possibility[i] !== firstVal) {
                        allSame = false;
                    }
                });

                if (allSame) {
                    setSquareFunction(i, firstVal);
                }
            }
            else {
                // Already set in stone.
            }
        }
    }

    setSquareOnGrid(grid: Grid, row: number, col: number, val: Square) {
        this.setSquareOnRowCol(grid.rows[row], col, val);
        this.setSquareOnRowCol(grid.cols[col], row, val);
    }

    getReadableGrid(grid: Grid): Array<Array<Square>> {
        let readableGrid: Array<Array<Square>> = [];
        grid.rows.forEach((row) => {
            readableGrid.push(row.current);
        });
        return readableGrid;
    }

    /**
     * Adds the current grid to history, if and only if:
     *     the specified resolution matches the desired resolution
     *     the last history entry isn't the same as the current history entry
     * 
     * @param grid 
     * @param history
     * @param desiredResolution 
     * @param checkGridChanged
     */
    addToHistory(grid: Grid, history: GridHistory, desiredResolution: HistoryResolution, checkGridChanged: Boolean = true) {
        function gridsAreSame(grid1: Array<Array<Square>>, grid2: Array<Array<Square>>) {
            return grid1.join("|") === grid2.join("|");
        }

        if (this.historyResolution === desiredResolution) {
            if (!checkGridChanged || history.length === 0) {
                history.push(this.getReadableGrid(grid));
            }
            else {
                const readableGrid = this.getReadableGrid(grid);
                if (!gridsAreSame(readableGrid, history[history.length - 1])) {
                    history.push(readableGrid);
                }
            }

        }
    }

    solveNonogram(
        rowPrompts: Array<Array<number>>, colPrompts: Array<Array<number>>, history: GridHistory = []) {
        assert(rowPrompts.length === colPrompts.length);
        let grid = this.createGrid(rowPrompts, colPrompts);

        let didSomething = true;
        try {
            while (didSomething) {
                didSomething = false;

                for (let row = 0; row < grid.rows.length; row++) {
                    this.filterCurrentValuesToPossibilities(grid.rows[row], (col, val) => {
                        didSomething = true;
                        this.setSquareOnGrid(grid, row, col, val);
                        this.addToHistory(grid, history, HistoryResolution.EVERY_STEP, false);
                    });
                    this.addToHistory(grid, history, HistoryResolution.EVERY_ROW_OR_COLUMN);
                }
                this.addToHistory(grid, history, HistoryResolution.ON_PASSTHROUGH);

                for (let col = 0; col < grid.rows.length; col++) {
                    this.filterCurrentValuesToPossibilities(grid.cols[col], (row, val) => {
                        didSomething = true;
                        this.setSquareOnGrid(grid, row, col, val);
                        this.addToHistory(grid, history, HistoryResolution.EVERY_STEP, false);
                    });
                    this.addToHistory(grid, history, HistoryResolution.EVERY_ROW_OR_COLUMN);
                }
                this.addToHistory(grid, history, HistoryResolution.ON_PASSTHROUGH);
            }
        }
        catch (e) {
            console.log(e);
        }

        return this.getReadableGrid(grid);
    }

};