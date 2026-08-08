import { Slider, Typography } from '@mui/material';
import React from 'react';
import { AppState } from './enums';

interface SlidersProps {
    // The intent of the app in this moment. Affects which sliders appear.
    appState: AppState,
    // The current value for the nonogram grid size.
    gridSize: number,
    // Called when the slider for grid size is changed.
    gridSizeOnChange: (event: Event, newValue: number | number[]) => void,
    // The max value for the history slider.
    historySize: number,
    // Called when the history slider is moved.
    historyOnChange: (event: Event, newValue: number | number[]) => void,
    // The current index/value of the history slider.
    currentHistoryIndex: number
}

export default function Sliders({ appState, gridSize, gridSizeOnChange, historySize, historyOnChange, currentHistoryIndex }: SlidersProps) {
    if (appState === AppState.FORMING_PUZZLE) {
        return (
            <div>
                <div>
                    <Typography>Select grid size (recommended 5,10,15): </Typography>
                    <Slider
                        aria-label="gridSize"
                        value={gridSize}
                        valueLabelDisplay="on"
                        step={5}
                        marks
                        min={5}
                        max={15}
                        onChange={gridSizeOnChange}
                    />
                </div>
            </div>
        );
    }
    else if (appState === AppState.ITERATING_HISTORY) {
        return (<div>
            <div>
                <Typography>Scroll through the steps to see the solution: </Typography>
                <Slider
                    aria-label="historyTicker"
                    value={currentHistoryIndex}
                    step={1}
                    marks
                    min={0}
                    max={historySize - 1}
                    onChange={historyOnChange}
                />
            </div>
        </div>);
    }
    else return null;
}