import React, { ReactElement, useState } from 'react';
import { Button, Slider, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import Pipe from './Pipe';
import { useColorSortContext } from './ColorSortContext';
import './ColorSortApp.css';

export default function ColorSortSolution() {
  const navigate = useNavigate();
  const { solution, allColors } = useColorSortContext();
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (solution.length === 0) {
    navigate({ to: '/puzzles/color-sort' });
    return null;
  }

  const currentMoveAction = solution[currentStep];
  const pipeCount = currentMoveAction.pipes.length;

  const pipes: Array<ReactElement> = [];
  for (let i = 0; i < pipeCount; i++) {
    pipes.push(
      <li key={'pipe' + i}>
        <Pipe index={i} colorIds={currentMoveAction.pipes[i] || []} allColors={allColors} />
      </li>
    );
  }

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
          max={solution.length - 1}
          onChange={(_e, v) => setCurrentStep(v as number)}
        />
      </div>
      <div>
        <ul className='pipesList'>{pipes}</ul>
      </div>
      {currentStep > 0 && (() => {
        const colorValue = currentMoveAction.pipes[currentMoveAction.receiver][0];
        const colorSwatch = (
          <svg height={20} width={20} style={{ verticalAlign: 'middle' }}>
            <rect fill={allColors[colorValue]?.hex || '#000'} width="20" height="20" />
          </svg>
        );
        return (
          <div>
            Moved {colorSwatch} from pipe {currentMoveAction.mover + 1} to pipe {currentMoveAction.receiver + 1}
          </div>
        );
      })()}
      <hr />
      <div style={{ marginTop: '20px' }}>
        <Button variant='contained' size='large' onClick={() => navigate({ to: '/puzzles/color-sort' })}>
          BACK TO PUZZLE CREATION
        </Button>
      </div>
    </div>
  );
}
