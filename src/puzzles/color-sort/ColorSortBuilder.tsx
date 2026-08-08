import React, { ReactElement, useState } from 'react';
import { Button } from '@mui/material';
import Cookies from 'universal-cookie';
import { IColor } from 'react-color-palette';
import { useNavigate } from '@tanstack/react-router';

import Pipe from './Pipe';
import ColorBlot from './ColorBlot';
import { solvePipes } from './pipes';
import { useRecommendedColors, examplePuzzle, createRandomPuzzle } from './puzzle-creator';
import { useColorSortContext } from './ColorSortContext';
import './ColorSortApp.css';

export default function ColorSortBuilder() {
  const cookies = new Cookies(null, { path: '/' });
  const navigate = useNavigate();
  const { setSolution, setAllColors: setContextColors } = useColorSortContext();

  const [pipeCount, setPipeCount] = useState<number>(14);
  const [pipeInputs, setPipeInputs] = useState<Array<Array<number>>>([]);
  const [allColors, setAllColors] = useState<Array<IColor>>(cookies.get('allColors') || []);
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

  function handleSolve() {
    const solution = solvePipes(pipeInputs.slice(0, pipeCount));
    if (solution && solution.length > 0) {
      setSolution(solution);
      setContextColors(allColors);
      navigate({ to: '/puzzles/color-sort/solution' });
    } else {
      alert('Could not find solution');
    }
  }

  function handleUseRecommendedColors() {
    const newColors = allColors.length < colorCount
      ? new Array<IColor>(colorCount)
      : allColors.slice();
    for (let i = 0; i < Math.min(newColors.length, recommendedColors.length); i++) {
      newColors[i] = recommendedColors[i];
    }
    setAllColors(newColors);
    cookies.set('allColors', newColors);
  }

  function handleRandomPuzzle() {
    setPipeInputs(createRandomPuzzle(pipeCount));
  }

  function handleExamplePuzzle() {
    setPipeCount(examplePuzzle.length);
    setPipeInputs(examplePuzzle);
  }

  const pipes: Array<ReactElement> = [];
  for (let i = 0; i < pipeCount; i++) {
    pipes.push(
      <li key={'pipe' + i}>
        <Pipe index={i} colorIds={pipeInputs[i] || []} allColors={allColors}
          onClick={removeColorFromPipe} />
      </li>
    );
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
      <div>
        <label>Number of pipes (including empty): </label>
        <input type="range" min={4} max={20} value={pipeCount}
          onChange={(e) => setPipeCount(Number(e.target.value))} />
        <span> {pipeCount}</span>
      </div>
      <div>
        <ul className='pipesList'>{pipes}</ul>
      </div>
      <div>
        <div>Select colors. Then pick them to place them in pipes and create your puzzle:</div>
        <ul className='colorList'>{colorSelectors}</ul>
      </div>
      <hr />
      <div style={{ marginTop: '20px' }}>
        <Button sx={{ margin: '10px' }} variant='outlined' size='small' onClick={handleUseRecommendedColors}>USE RECOMMENDED COLORS</Button>
        <Button sx={{ margin: '10px' }} variant='outlined' size='small' onClick={handleExamplePuzzle}>USE EXAMPLE PUZZLE</Button>
        <Button sx={{ margin: '10px' }} variant='outlined' size='small' onClick={handleRandomPuzzle}>GENERATE RANDOM PUZZLE</Button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Button variant='contained' size='large' onClick={handleSolve}>FIND SOLUTION</Button>
      </div>
    </div>
  );
}
