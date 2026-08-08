import React, { useState } from 'react';
import { Button, Slider, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import NonogramGrid from './NonogramGrid';
import { useNonogramContext } from './NonogramContext';
import './NonogramApp.css';

export default function NonogramSolution() {
  const navigate = useNavigate();
  const { gridHistory, gridSize } = useNonogramContext();
  const [currentStep, setCurrentStep] = useState<number>(gridHistory.length - 1);

  if (gridHistory.length === 0) {
    navigate({ to: '/puzzles/nonogram' });
    return null;
  }

  const currentGridState = gridHistory[currentStep] || [];

  return (
    <div className="App" style={{ margin: '20px' }}>
      <div>
        <Typography>Scroll through the steps to see the solution:</Typography>
        <Slider
          aria-label="historyTicker"
          value={currentStep}
          step={1}
          marks
          min={0}
          max={gridHistory.length - 1}
          onChange={(_e, v) => setCurrentStep(v as number)}
        />
      </div>
      <NonogramGrid
        gridSize={gridSize}
        gridState={currentGridState}
        rowPrompts={[]}
        columnPrompts={[]}
        isEditable={false}
      />
      <div style={{ marginTop: '20px' }}>
        <Button variant='contained' size='large' onClick={() => navigate({ to: '/puzzles/nonogram' })}>
          BACK TO PUZZLE CREATION
        </Button>
      </div>
    </div>
  );
}
