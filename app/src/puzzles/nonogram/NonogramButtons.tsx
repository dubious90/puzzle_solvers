import { Button, Tooltip } from '@mui/material';
import { AppState } from './enums';

export enum ButtonClickAction {
    SOLVE_PUZZLE,
    BACK_TO_PUZZLE_CREATION,
    RANDOM_PUZZLE,
    EXAMPLE_PUZZLE,
}

export interface NonogramButtonsProps {
    appState: AppState,
    handleButtonClick: (action: ButtonClickAction) => void,
}

function SecondaryButtons({ appState, handleButtonClick }: NonogramButtonsProps) {
    if (appState === AppState.ITERATING_HISTORY) {
        return null;
    }
    return (
        <div style={{ marginTop: "20px" }}>
            <Tooltip title="Use Example Puzzle: Replaces current puzzle state and pipe count with one example that is known to work.">
                <Button sx={{ margin: "10px" }} variant='outlined' size='small' onClick={() => handleButtonClick(ButtonClickAction.EXAMPLE_PUZZLE)}>USE EXAMPLE PUZZLE</Button>
            </Tooltip>
            <Tooltip title="Generate Random Puzzle: Replaces the current puzzle state with a randomly generated puzzle using the current pipe count. Note that not all randomly generated puzzles are guaranteed to have solutions.">
                <Button sx={{ margin: "10px" }} variant='outlined' size='small' onClick={() => handleButtonClick(ButtonClickAction.RANDOM_PUZZLE)}>GENERATE RANDOM PUZZLE</Button>
            </Tooltip >
        </div >
    );
}

export default function NonogramButtons({ appState, handleButtonClick }: NonogramButtonsProps) {
    let mainAction: ButtonClickAction;
    let mainButtonText: string;
    if (appState === AppState.FORMING_PUZZLE) {
        mainAction = ButtonClickAction.SOLVE_PUZZLE;
        mainButtonText = "FIND SOLUTION";
    }
    else {
        mainAction = ButtonClickAction.BACK_TO_PUZZLE_CREATION;
        mainButtonText = "BACK TO PUZZLE CREATION";
    }

    return (
        <div>
            <SecondaryButtons appState={appState} handleButtonClick={handleButtonClick} />
            <div id='mainButton' style={{ marginTop: "20px" }}>
                <Button variant='contained' size='large' onClick={() => handleButtonClick(mainAction)}>{mainButtonText}</Button>
            </div>
        </div>
    );
}