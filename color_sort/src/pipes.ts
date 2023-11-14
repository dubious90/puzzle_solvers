import assert from "assert";

function isPipeUniform4(pipe: Array<number>) {
    return (pipe[0] === pipe[1]
        && pipe[0] === pipe[2]
        && pipe[0] === pipe[3]);
}

function copyPipes(pipes: Array<Array<number>>) {
    let newPipes: Array<Array<number>> = [];
    pipes.forEach((pipe: Array<number>) => {
        newPipes.push(pipe.slice());
    });
    return newPipes;
}

function copySolution(solution: Array<MoveAction>) {
    let newSolution: Array<MoveAction> = [];
    solution.forEach((action) => {
        const newAction = new MoveAction(copyPipes(action.pipes), action.mover, action.receiver);
        newSolution.push(newAction);
    });
    return newSolution;
}

export function isSolved(pipes: Array<Array<number>>) {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        // empty pipes are okay. typically there should be two
        if (pipe.length > 0) {
            if (pipe.length === 4) {
                if (!isPipeUniform4(pipe)) {
                    return false;
                }
            }
            else {
                // pipes with 1,2,or 3 elements are not okay.
                return false;
            }
        }
    }
    return true;
}

function pipeCompareFn(a: Array<number>, b: Array<number>) {
    if (a.length !== b.length) {
        return a.length - b.length;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return a[i] - b[i];
        }
    }
    return 0;
}

function pipesToString(pipes: Array<Array<number>>) {
    let sorted = pipes.slice();
    sorted.sort(pipeCompareFn);
    return sorted.join("|");
}

export function checkValidMove(pipeToMove: Array<number>, receivingPipe: Array<number>) {
    return receivingPipe.length < 4
        && (
            receivingPipe.length === 0
            || pipeToMove[0] === receivingPipe[0]
        );
}

export function makeValidMove(pipes: Array<Array<number>>, movingIndex: number, receivingIndex: number) {
    let newPipes = copyPipes(pipes);
    let movingPipe = newPipes[movingIndex];
    let receivingPipe = newPipes[receivingIndex];

    const movingValue = movingPipe[0];
    while (movingPipe[0] === movingValue && 4 - receivingPipe.length > 0) {
        movingPipe.shift();
        receivingPipe.unshift(movingValue);
    }

    return newPipes;
}

export class MoveAction {
    pipes: Array<Array<number>>;
    mover: number;
    receiver: number;
    constructor(pipes: Array<Array<number>>, mover: number, receiver: number) {
        this.pipes = pipes;
        this.mover = mover;
        this.receiver = receiver;
    }

}

/**
 * 
 * @param pipesInput The puzzle input, an array of pipes, with numbers corresponding to colors
 * @returns 
 */
export function solvePipes(pipesInput: Array<Array<number>>) {
    let history = new Set();
    let finalSolution: Array<MoveAction> = [];

    let solutions = [[new MoveAction(pipesInput, -1, -1)]];
    history.add(pipesInput);
    while (finalSolution.length === 0 && solutions.length > 0) {
        const solution = solutions.shift();
        assert(solution);
        const currentPipes = solution[solution.length - 1].pipes;

        // If we've solved, return our solution.
        if (isSolved(currentPipes)) {
            finalSolution = solution;
        }
        else {
            for (let i = 0; i < currentPipes.length; i++) {
                const pipeToMove = currentPipes[i];
                if (pipeToMove.length > 0 && !isPipeUniform4(pipeToMove)) {
                    for (let j = 0; j < currentPipes.length; j++) {
                        if (i !== j) {
                            const receivingPipe = currentPipes[j];
                            if (checkValidMove(pipeToMove, receivingPipe)) {
                                const nextPipes = makeValidMove(currentPipes, i, j);
                                const historyEntry = pipesToString(nextPipes);
                                if (!history.has(historyEntry)) {
                                    history.add(historyEntry);

                                    let nextSolution = copySolution(solution);
                                    nextSolution.push(new MoveAction(nextPipes, i, j));
                                    solutions.push(nextSolution);
                                }
                            }
                        }
                    }
                }
                else {
                    // No color to sort. Move on
                }
            }
        }
    }

    return finalSolution;
}


