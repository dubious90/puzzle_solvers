import NonogramSolver from "./solver";

describe("Nonogram Solver", () => {
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
});