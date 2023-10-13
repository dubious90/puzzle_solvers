import { checkValidMove, isSolved, makeValidMove, solvePipes } from "./pipes";

describe("Pipes Puzzle", () => {
    describe("#isSolved", () => {
        test("valid solution returns true", () => {
            const pipes = [
                [1, 1, 1, 1],
                [2, 2, 2, 2],
                [],
                [],
            ];
            expect(isSolved(pipes)).toBe(true);
        });

        test("valid solution returns true regardless of pipes order", () => {
            const pipes = [
                [2, 2, 2, 2],
                [],
                [4, 4, 4, 4],
                [3, 3, 3, 3],
                [],
                [1, 1, 1, 1],
            ];
            expect(isSolved(pipes)).toBe(true);
        });

        test("puzzle with incomplete pipes returns false", () => {
            const pipes = [
                [1, 1, 1,],
                [2, 2, 2, 2],
                [1],
                [],
            ];
            expect(isSolved(pipes)).toBe(false);
        });

        test("puzzle with mixed pipes returns false", () => {
            const pipes = [
                [1, 2, 1, 2],
                [3, 3, 3, 3],
            ];
            expect(isSolved(pipes)).toBe(false);
        });

        test("empty pipes returns true", () => {
            const pipes = [
                [],
                [],
            ];
            expect(isSolved(pipes)).toBe(true);
        });
    });

    describe("#checkValidMove", () => {
        test("returns true if receiving pipe is empty", () => {
            expect(checkValidMove([1, 1, 2, 2], [])).toBe(true);
        });

        test("returns true if receiving pipe has room and correct top", () => {
            expect(checkValidMove([1, 1, 2, 2], [1, 1])).toBe(true);
        });

        test("returns false if receiving pipe is full", () => {
            expect(checkValidMove([1, 1], [1, 1, 2, 2])).toBe(false);
        });

        test("returns false if pipes have different tops", () => {
            expect(checkValidMove([1, 1], [2, 1, 1])).toBe(false);
        })
    });

    describe("#makeValidMove", () => {
        test("moves color onto empty pipe", () => {
            const pipes = [
                [1, 1, 1, 2],
                [2, 2, 2, 1],
                [],
                [],
            ];
            const expectedPipes = [
                [2],
                [2, 2, 2, 1],
                [1, 1, 1,],
                [],
            ];
            expect(makeValidMove(pipes, 0, 2)).toEqual(expectedPipes);
        });

        test("moves color onto same color pipe", () => {
            const pipes = [
                [1, 1,],
                [1, 1,],
                [2, 2, 2, 2],
                [],
            ];
            const expectedPipes = [
                [],
                [1, 1, 1, 1],
                [2, 2, 2, 2],
                [],
            ];
            expect(makeValidMove(pipes, 0, 1)).toEqual(expectedPipes);
        });

        test("does not mutate original pipes parameter", () => {
            const pipes = [
                [1, 1],
                [1, 1],
            ];
            expect(makeValidMove(pipes, 0, 1)).toEqual([[], [1, 1, 1, 1]]);
            expect(pipes).toEqual([[1, 1], [1, 1]]);
        });
    });

    describe("#solvePipes", () => {
        test("solves big solvable puzzle", () => {
            const solvableInput = [
                [1, 2, 3, 4],
                [2, 4, 5, 6],
                [7, 8, 9, 2],
                [3, 10, 5, 10],
                [11, 12, 10, 12],
                [2, 6, 3, 8],
                [7, 8, 5, 6],
                [9, 7, 6, 12],
                [10, 5, 9, 11],
                [1, 7, 3, 9],
                [8, 12, 4, 11],
                [11, 4, 1, 1],
                [],
                [],
            ];
            const solution = solvePipes(solvableInput);
            expect(solution).toHaveLength(40);
        });

        test("returns 1 step solution for already solved puzzle", () => {
            const solvedPuzzle = [
                [1, 1, 1, 1],
                [2, 2, 2, 2],
                [],
                [],
            ];

            const solution = solvePipes(solvedPuzzle);
            expect(solution).toHaveLength(1);
            expect(solution[0].pipes).toEqual(solvedPuzzle);
        });

        test("returns empty string for unsolvable puzzle", () => {
            const unsolvableInput = [
                [0, 0, 4, 7],
                [8, 4],
                [6, 6, 8, 3],
                [0, 1, 3, 8],
                [4, 2, 0, 5],
                [3, 1, 7, 4],
                [7, 7, 2, 5],
                [1, 1, 6, 8],
                [3, 6, 5],
                [2, 2],
            ];

            const solution = solvePipes(unsolvableInput);
            expect(solution).toHaveLength(0);
        });
    });
});
