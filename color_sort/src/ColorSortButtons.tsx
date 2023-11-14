import { Button } from '@mui/material';
import { AppState } from './enums';

export enum ButtonClickAction {
    SOLVE_PUZZLE,
    BACK_TO_PUZZLE_CREATION,
    USE_RECOMMENDED_COLORS,
    RANDOM_PUZZLE,
    EXAMPLE_PUZZLE,
}

export interface ColorSortButtonsProps {
    appState: AppState,
    handleButtonClick: (action: ButtonClickAction) => void,
}

function SecondaryButtons({ appState, handleButtonClick }: ColorSortButtonsProps) {
    if (appState === AppState.FINDING_SOLUTION) {
        return null;
    }
    return (
        <div style={{ marginTop: "20px" }}>
            <Button sx={{ margin: "10px" }} variant='outlined' size='small' onClick={() => handleButtonClick(ButtonClickAction.USE_RECOMMENDED_COLORS)}>USE RECOMMENDED COLORS</Button>
            <Button sx={{ margin: "10px" }} variant='outlined' size='small' onClick={() => handleButtonClick(ButtonClickAction.EXAMPLE_PUZZLE)}>USE EXAMPLE PUZZLE</Button>
            <Button sx={{ margin: "10px" }} variant='outlined' size='small' onClick={() => handleButtonClick(ButtonClickAction.RANDOM_PUZZLE)}>GENERATE RANDOM PUZZLE</Button>
        </div>
    );
}

export default function ColorSortButtons({ appState, handleButtonClick }: ColorSortButtonsProps) {
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