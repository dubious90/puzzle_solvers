import { OutgoingMessage } from "http";
import { useColor } from "react-color-palette";

export function useRecommendedColors() {
    const [orange] = useColor("#F39C12");
    const [lightBlue] = useColor("#00F0FF");
    const [red] = useColor("#FF0000");
    const [pink] = useColor("#FFC0CB");
    const [lightGreen] = useColor("#90EE90");
    const [darkBlue] = useColor("#003AFF");
    const [gray] = useColor("#808080");
    const [purple] = useColor("#7F00FF")
    const [sageGreen] = useColor("#8A9A5B");
    const [forestGreen] = useColor("#228B22");
    const [yellow] = useColor("#FFEA00");
    const [brown] = useColor("#966919");

    return [
        orange,
        lightBlue,
        red,
        pink,
        lightGreen,
        darkBlue,
        gray,
        purple,
        sageGreen,
        forestGreen,
        yellow,
        brown,
    ]
}

export function createRandomPuzzle(pipeCount: number) {
    const colorCount = pipeCount - 2;
    let pipes: Array<Array<number>> = Array(pipeCount).fill([]);
    let allBlots: Array<number> = [];
    for (let i = 0; i < colorCount; i++) {
        allBlots.push(i);
        allBlots.push(i);
        allBlots.push(i);
        allBlots.push(i);
    }

    for (let i = 0; i < colorCount; i++) {
        let newPipe = pipes[i].slice();
        for (let j = 0; j < 4; j++) {
            const randomIndex = Math.floor(Math.random() * allBlots.length);
            newPipe[j] = allBlots[randomIndex];
            allBlots.splice(randomIndex, 1);
        }
        pipes[i] = newPipe;
    }

    return pipes;
}

export const examplePuzzle: Array<Array<number>> = [
    [1, 2, 3, 4],
    [2, 4, 5, 6],
    [7, 8, 9, 2],
    [3, 10, 5, 10],
    [11, 0, 10, 0],
    [2, 6, 3, 8],
    [7, 8, 5, 6],
    [9, 7, 6, 0],
    [10, 5, 9, 11],
    [1, 7, 3, 9],
    [8, 0, 4, 11],
    [11, 4, 1, 1],
    [],
    [],
];
