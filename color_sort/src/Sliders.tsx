import { Slider, Typography } from '@mui/material';
import React from 'react';
import { AppState } from './enums';

interface SlidersProps {
    appState: AppState,
    pipeCount: number,
    pipesOnChange: (event: Event, newValue: number | number[]) => void,
    // colorCount: number,
    // colorsOnChange: (event: Event, newValue: number | number[]) => void,
    historySize: number,
    historyOnChange: (event: Event, newValue: number | number[]) => void,
    currentMoveAction: number
}

export default function Sliders({ appState, pipeCount, pipesOnChange, historySize, historyOnChange, currentMoveAction }: SlidersProps) {
    if (appState === AppState.FORMING_PUZZLE) {
        return (
            <div>
                <div>
                    <Typography>Select number of pipes, including empty pipes: </Typography>
                    <Slider
                        aria-label="numberOfPipes"
                        value={pipeCount}
                        valueLabelDisplay="on"
                        step={1}
                        marks
                        min={4}
                        max={20}
                        onChange={pipesOnChange}
                    />
                </div>
                {/*
                removing this feature, as right now we assume colorCount = pipeCount - 2
                <div>
                    <Typography>Select number of colors: </Typography>
                    <Slider
                        aria-label="numberOfColors"
                        value={colorCount}
                        valueLabelDisplay="on"
                        step={1}
                        marks
                        min={2}
                        max={20}
                        onChange={colorsOnChange}
                    />
                </div> */}
            </div>
        );
    }
    else if (appState === AppState.FINDING_SOLUTION) {
        return (<div>
            <div>
                <Typography>Scroll through the steps to see the solution: </Typography>
                <Slider
                    aria-label="historyTicker"
                    value={currentMoveAction}
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