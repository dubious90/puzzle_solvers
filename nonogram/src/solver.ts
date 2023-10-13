import assert from "assert";


export enum Square {
    NO,
    YES,
    MAYBE
}

const MEDIUM_SPEC = {
    ROWS: [
        [2, 2],
        [6],
        [1, 3],
        [1, 4, 1],
        [10],
        [10],
        [3, 3],
        [2, 2],
        [4],
        [3],
    ],
    COLS: [
        [8],
        [2, 5],
        [3, 1, 1],
        [5, 2],
        [6, 1],
        [2, 3, 1],
        [3],
        [3],
        [4],
        [5],
    ],
}

const TRIVIAL_SPEC = {
    ROWS: [
        [5],
        [3],
        [3],
        [3],
        [5],
    ],
    COLS: [
        [1, 1],
        [5],
        [5],
        [5],
        [1, 1],
    ],
};

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

    solveNonogram(rowPrompts: Array<Array<number>>, colPrompts: Array<Array<number>>, history: GridHistory = []) {
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
                    });
                }
                history.push(this.getReadableGrid(grid));

                for (let col = 0; col < grid.rows.length; col++) {
                    this.filterCurrentValuesToPossibilities(grid.cols[col], (row, val) => {
                        didSomething = true;
                        this.setSquareOnGrid(grid, row, col, val);
                    });
                }
                history.push(this.getReadableGrid(grid));
            }
        }
        catch (e) {
            console.log(e);
        }

        return this.getReadableGrid(grid);
    }

};