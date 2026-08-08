import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import Cookies from 'universal-cookie';
import { ColorPicker, IColor, useColor } from 'react-color-palette';
import 'react-color-palette/css';

import Sliders from './Sliders';
import { MoveAction, solvePipes } from './pipes';
import { AppState } from './enums';
import { useRecommendedColors, examplePuzzle, createRandomPuzzle } from './puzzle-creator';
import ColorSortButtons, { ButtonClickAction } from './ColorSortButtons';
import './ColorSortApp.css';

interface PipeProps {
  index: number;
  colorIds: Array<number>;
  allColors: Array<IColor>;
  onClick: (pipeIndex: number, colorIndex: number) => void;
}

interface ColorBlotType {
  color?: IColor;
  index: number;
  onColorChange: (color: IColor, index: number) => void;
  onClick: (colorIndex: number) => void;
}

function Pipe({ colorIds, allColors, index, onClick }: PipeProps) {
  const fills: Array<ReactElement> = [];
  for (let i = 0; i < colorIds.length; i++) {
    const fillOffset = 50 * (i + 4 - colorIds.length) + 25;
    const key = 'pipe' + index + 'color' + i;
    const color = allColors[colorIds[i]];
    if (!color) {
      console.log('Missing color on pipe ' + index, i, colorIds, allColors, index);
    } else {
      fills.push(
        <rect key={key} fill={color.hex} width="48" height="50" y={fillOffset} x={1}
          onClick={() => onClick(index, i)} />
      );
    }
  }
  return (
    <svg display="block" width="75px" height="250px">
      <g>
        <rect fill='#FFFFFF' stroke="#000000" width="50" height="225" strokeWidth="1px" />
      </g>
      <g>{fills}</g>
    </svg>
  );
}

function useOutsideClick(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [callback]);
  return ref;
}

function ColorBlot({ color, index, onColorChange, onClick }: ColorBlotType) {
  const [defaultColor] = useColor('#FF0000');
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const ref = useOutsideClick(() => setShowPicker(false));
  if (color === null || color === undefined) color = defaultColor;

  return (
    <span>
      <svg height="50" width="50" onClick={() => onClick(index)}>
        <g>
          <rect fill={color.hex} width="50" height="50" />
          <text strokeWidth="1" stroke='#000000' x="50%" y="50%"
            dominantBaseline="middle" textAnchor='middle'>{index}</text>
        </g>
      </svg>
      <div ref={ref}>
        <Button size="small" variant='outlined' onClick={() => setShowPicker(true)}>PICK</Button>
        {showPicker && (
          <div id="colorPicker">
            <ColorPicker color={color} onChange={(c) => onColorChange(c, index)} hideAlpha={true} />
          </div>
        )}
      </div>
    </span>
  );
}

export default function ColorSortApp() {
  const cookies = new Cookies(null, { path: '/' });

  const [appState, setAppState] = useState<AppState>(AppState.FORMING_PUZZLE);
  const [pipeCount, setPipeCount] = useState<number>(14);
  const [pipeInputs, setPipeInputs] = useState<Array<Array<number>>>([]);
  const [allColors, setAllColors] = useState<Array<IColor>>(cookies.get('allColors') || []);
  const [history, setHistory] = useState<Array<MoveAction>>([]);
  const [currentMoveActionIndex, setCurrentMoveAction] = useState<number>(0);
  const recommendedColors = useRecommendedColors();
  const colorCount = pipeCount - 2;

  function addColorToPipe(colorId: number) {
    const newPipeInputs = pipeInputs.slice();
    let added = false;
    for (let i = 0; i < pipeCount; i++) {
      if (!newPipeInputs[i]) newPipeInputs[i] = [];
      const oldPipe = newPipeInputs[i] || [];
      if (oldPipe.length < 4 && !added) {
        const newPipe = oldPipe.slice();
        newPipe.unshift(colorId);
        newPipeInputs[i] = newPipe;
        added = true;
      }
    }
    setPipeInputs(newPipeInputs);
  }

  function removeColorFromPipe(pipeIndex: number, colorIndex: number) {
    const newPipeInputs = pipeInputs.slice();
    const newPipe = newPipeInputs[pipeIndex].slice();
    newPipe.splice(colorIndex, 1);
    newPipeInputs[pipeIndex] = newPipe;
    setPipeInputs(newPipeInputs);
  }

  function handleColorChange(color: IColor, index: number) {
    const newColors = allColors.slice();
    newColors[index] = color;
    setAllColors(newColors);
    cookies.set('allColors', newColors);
  }

  function handleButtonClick(action: ButtonClickAction) {
    if (action === ButtonClickAction.SOLVE_PUZZLE) {
      const solution = solvePipes(pipeInputs.slice(0, pipeCount));
      if (solution && solution.length > 0) {
        setHistory(solution);
        setAppState(AppState.FINDING_SOLUTION);
      } else {
        alert('Could not find solution');
      }
    } else if (action === ButtonClickAction.BACK_TO_PUZZLE_CREATION) {
      setAppState(AppState.FORMING_PUZZLE);
      setCurrentMoveAction(0);
      setHistory([]);
    } else if (action === ButtonClickAction.USE_RECOMMENDED_COLORS) {
      const newColors = allColors.length < colorCount
        ? new Array<IColor>(colorCount)
        : allColors.slice();
      for (let i = 0; i < Math.min(allColors.length, recommendedColors.length); i++) {
        newColors[i] = recommendedColors[i];
      }
      setAllColors(newColors);
      cookies.set('allColors', newColors);
    } else if (action === ButtonClickAction.RANDOM_PUZZLE) {
      setPipeInputs(createRandomPuzzle(pipeCount));
    } else if (action === ButtonClickAction.EXAMPLE_PUZZLE) {
      setPipeCount(examplePuzzle.length);
      setPipeInputs(examplePuzzle);
    }
  }

  const currentMoveAction = history[currentMoveActionIndex];

  const pipes: Array<ReactElement> = [];
  for (let i = 0; i < pipeCount; i++) {
    if (appState === AppState.FORMING_PUZZLE) {
      pipes.push(
        <li key={'pipe' + i}>
          <Pipe index={i} colorIds={pipeInputs[i] || []} allColors={allColors}
            onClick={removeColorFromPipe} />
        </li>
      );
    } else if (appState === AppState.FINDING_SOLUTION) {
      pipes.push(
        <li key={'pipe' + i}>
          <Pipe index={i} colorIds={currentMoveAction.pipes[i] || []} allColors={allColors}
            onClick={() => {}} />
        </li>
      );
    }
  }

  const colorSelectors: Array<ReactElement> = [];
  for (let i = 0; i < colorCount; i++) {
    colorSelectors.push(
      <li key={'key' + i}>
        <ColorBlot color={allColors[i]} index={i}
          onColorChange={handleColorChange} onClick={addColorToPipe} />
      </li>
    );
  }

  return (
    <div className="App" style={{ margin: '20px' }}>
      <Sliders
        appState={appState}
        pipeCount={pipeCount}
        pipesOnChange={(_e, v) => setPipeCount(v as number)}
        historySize={history.length}
        historyOnChange={(_e, v) => setCurrentMoveAction(v as number)}
        currentMoveAction={currentMoveActionIndex}
      />
      <div>
        <ul className='pipesList'>{pipes}</ul>
      </div>
      {appState === AppState.FORMING_PUZZLE && (
        <div>
          <div>Select colors. Then pick them to place them in pipes and create your puzzle:</div>
          <ul className='colorList'>{colorSelectors}</ul>
        </div>
      )}
      {appState === AppState.FINDING_SOLUTION && currentMoveActionIndex > 0 && (() => {
        const colorValue = currentMoveAction.pipes[currentMoveAction.receiver][0];
        const color = (
          <svg height={20} width={20}>
            <g><rect fill={allColors[colorValue].hex} width="20" height="20" /></g>
          </svg>
        );
        return (
          <div>
            Moved {color} from pipe {currentMoveAction.mover + 1} to pipe {currentMoveAction.receiver + 1}
          </div>
        );
      })()}
      <hr />
      <ColorSortButtons appState={appState} handleButtonClick={handleButtonClick} />
    </div>
  );
}
