import assert from "assert";


enum Square {
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
interface RowCol {
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

export default class NonogramSolver {
    initialPossibilityMap = new Map<number, Map<string, Array<Array<Square>>>>;
    allPermutations = new Map<number, Array<Array<Square>>>;

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

    // setSquareValue(index: number, val: Square) {
    //     this.current[index] = val;
    // }

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

    setSquare(row: number, col: number, val: Square) {
        // this.rows[row][col] = val;
        // this.cols[col][row] = val;
    }

    solveNonogram(rowPrompts: Array<Array<number>>, colPrompts: Array<Array<number>>) {
        assert(rowPrompts.length === colPrompts.length);
        let grid = this.createGrid(rowPrompts, colPrompts);

    }

};

// const solver = new NonogramSolver();
// solver.solveNonogram(TRIVIAL_SPEC.ROWS, TRIVIAL_SPEC.COLS);