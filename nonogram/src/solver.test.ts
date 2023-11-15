import NonogramSolver, { GridHistory, RowCol, Square } from "./solver";

describe("Nonogram Solver", () => {
    describe("#getPermutations", () => {
        const solver = new NonogramSolver();
        test("returns correct permutations for small numbers", () => {
            expect(solver.getPermutations(1)).toEqual([[1], [0]]);
            expect(solver.getPermutations(2)).toEqual([[1, 1], [1, 0], [0, 1], [0, 0]]);
            expect(solver.getPermutations(3)).toEqual([
                [1, 1, 1],
                [1, 1, 0],
                [1, 0, 1],
                [1, 0, 0],
                [0, 1, 1],
                [0, 1, 0],
                [0, 0, 1],
                [0, 0, 0],
            ]);
        });

        test("returns correct number of permutations for reasonable numbers", () => {
            for (let i = 4; i <= 15; i++) {
                expect(solver.getPermutations(i)).toHaveLength(2 ** i);
            }
        });
    });

    describe("#validSequenceForPrompt", () => {
        const solver = new NonogramSolver();
        test("returns true for valid sequences", () => {
            expect(solver.validSequenceForPrompt([1, 1, 0, 1, 0], [2, 1])).toBe(true);
            expect(solver.validSequenceForPrompt([1, 1, 0, 0, 1], [2, 1])).toBe(true);
            expect(solver.validSequenceForPrompt([0, 1, 1, 0, 1], [2, 1])).toBe(true);
            expect(solver.validSequenceForPrompt([1, 1, 1, 1, 1], [5])).toBe(true);
        });

        test("returns false for sub-sequence too long", () => {
            expect(solver.validSequenceForPrompt([1, 1, 1, 1, 1], [4])).toBe(false);
            expect(solver.validSequenceForPrompt([1, 1, 1, 0, 1], [2, 1])).toBe(false);
        });

        test("returns false when sub-sequence too short", () => {
            expect(solver.validSequenceForPrompt([1, 0, 0, 0, 1], [2, 1])).toBe(false);
            expect(solver.validSequenceForPrompt([1, 1, 1, 1, 0], [5])).toBe(false);
            expect(solver.validSequenceForPrompt([1, 0, 0, 0, 1], [1, 2])).toBe(false);
            expect(solver.validSequenceForPrompt([1, 0, 0, 1, 0], [1, 2])).toBe(false);
        });

        test("returns false when sub-sequence missing", () => {
            expect(solver.validSequenceForPrompt([1, 1, 0, 0, 0], [1, 2])).toBe(false);
            expect(solver.validSequenceForPrompt([0, 0, 0, 1, 1], [1, 2])).toBe(false);
        });
    });

    describe("#getInitialPossibilitiesForPrompt", () => {
        const solver = new NonogramSolver();
        test("gets expected permutations", () => {
            expect(solver.getInitialPossibilitiesForPrompt(5, [2, 1])).toEqual([
                [1, 1, 0, 1, 0],
                [1, 1, 0, 0, 1],
                [0, 1, 1, 0, 1],
            ]);

            expect(solver.getInitialPossibilitiesForPrompt(5, [2])).toEqual([
                [1, 1, 0, 0, 0],
                [0, 1, 1, 0, 0],
                [0, 0, 1, 1, 0],
                [0, 0, 0, 1, 1],
            ]);

            expect(solver.getInitialPossibilitiesForPrompt(15, [14])).toEqual([
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            ]);
        })
    });

    describe("#filterCurrentValuesToPossibilities", () => {
        let solver = new NonogramSolver();
        test("basic", () => {
            const rowCol: RowCol = solver.createRowCol(5, [5]);

            let tuples: Array<[number, Square]> = [];
            solver.filterCurrentValuesToPossibilities(rowCol, (index, val) => {
                tuples.push([index, val]);
            });
            expect(tuples).toEqual([
                [0, 1],
                [1, 1],
                [2, 1],
                [3, 1],
                [4, 1],
            ])
        });
    });

    describe("#solveNonogram", () => {
        test("Solves a trivial nonogram", () => {
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
            const solver = new NonogramSolver();
            let history: GridHistory = [];
            expect(solver.solveNonogram(TRIVIAL_SPEC.ROWS, TRIVIAL_SPEC.COLS, history)).toEqual(
                [
                    [1, 1, 1, 1, 1],
                    [0, 1, 1, 1, 0],
                    [0, 1, 1, 1, 0],
                    [0, 1, 1, 1, 0],
                    [1, 1, 1, 1, 1],

                ],
            );
        });

        test("Solves a medium nonogram", () => {
            const MEDIUM_SPEC = {
                ROWS: [
                    [2],
                    [4],
                    [10],
                    [5, 4],
                    [2, 1, 1, 1],
                    [2, 1],
                    [5, 4],
                    [4, 4],
                    [3, 2, 3],
                    [2],
                ],
                COLS: [
                    [2, 3],
                    [3, 3],
                    [7],
                    [3, 3],
                    [5, 1, 2],
                    [3, 2],
                    [4, 2],
                    [2, 4],
                    [3, 3],
                    [2, 3],
                ],
            }

            const EXPECTED_SOLUTION = [
                [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
                [0, 1, 1, 0, 1, 0, 1, 0, 1, 0],
                [0, 0, 1, 1, 0, 0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
                [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
                [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
                [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
            ];
            const solver = new NonogramSolver();
            let history: GridHistory = [];
            expect(solver.solveNonogram(MEDIUM_SPEC.ROWS, MEDIUM_SPEC.COLS, history)).toEqual(EXPECTED_SOLUTION);
        });

        test("Solves a large nonogram", () => {
            const LARGE_SPEC = {
                ROWS: [
                    // first third
                    [7],
                    [9],
                    [9],
                    [1, 7],
                    [1, 5],
                    // second third
                    [3, 7],
                    [2, 1, 8],
                    [1, 2, 8],
                    [1, 3, 7],
                    [1, 11],
                    // last third
                    [2, 5, 3],
                    [3, 3],
                    [1, 9, 1],
                    [2, 2],
                    [11],
                ],
                COLS: [
                    //first third
                    [5],
                    [2, 4],
                    [1, 1, 2],
                    [8, 2, 1],
                    [3, 3, 1, 1],
                    // second third
                    [4, 3, 1, 1],
                    [4, 2, 1, 1],
                    [8, 2, 1, 1],
                    [11, 1, 1],
                    [11, 1, 1],
                    // last third
                    [10, 1, 1],
                    [9, 2, 1],
                    [7, 2],
                    [9],
                    [5],
                ],
            }

            const EXPECTED_SOLUTION = [
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
                //
                [0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                //
                [1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
                [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
                [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
                [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            ];
            const solver = new NonogramSolver();
            let history: GridHistory = [];
            expect(solver.solveNonogram(LARGE_SPEC.ROWS, LARGE_SPEC.COLS, history)).toEqual(EXPECTED_SOLUTION);
        });
    })
});

describe("messing around", () => {
    function gridsAreSame(grid1: Array<Array<Square>>, grid2: Array<Array<Square>>) {
        return grid1.join("|") === grid2.join("|");
    }

    test("grids are same works", () => {
        const grid1: Array<Array<Square>> = [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0]];
        const grid2: Array<Array<Square>> = [[1, 1, 1, 1, 1], [0, 0, 0, 0, 0]];;
        const grid3: Array<Array<Square>> = [[1, 1, 1, 1, 0], [1, 0, 1, 0, 1]];
        const grid4: Array<Array<Square>> = [[1, 1, 1, 1, 0], [1, 0, 1, 0, 1]];

        expect(gridsAreSame(grid1, grid2)).toBe(true);
        expect(gridsAreSame(grid3, grid4)).toBe(true);
        expect(gridsAreSame(grid1, grid3)).toBe(false);
        expect(gridsAreSame(grid2, grid4)).toBe(false);

    })
})