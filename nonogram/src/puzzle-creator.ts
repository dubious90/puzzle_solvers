export interface ExamplePuzzle {
    rows: number[][],
    columns: number[][],
}

export function randomPuzzle() {

}

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