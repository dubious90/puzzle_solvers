import React, { useState } from 'react';
import { Button, Typography, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import NonogramSolver, { GridHistory, HistoryResolution } from './solver';
import NonogramGrid from './NonogramGrid';
import { ExamplePuzzle, getExamplePuzzle, getRandomPuzzle } from './puzzle-creator';
import { useNonogramContext } from './NonogramContext';
import './NonogramApp.css';

function HistoryResolutionSelector({ value, onChange }: { value: HistoryResolution; onChange: (v: HistoryResolution) => void }) {
  return (
    <div>
      <span style={{ marginRight: '10px' }}>How often should history be captured?</span>
      <Select size="small" value={value} onChange={(e: SelectChangeEvent<HistoryResolution>) => onChange(e.target.value as HistoryResolution)}>
        <MenuItem value={HistoryResolution.EVERY_STEP}>Whenever value entered</MenuItem>
        <MenuItem value={HistoryResolution.EVERY_ROW_OR_COLUMN}>Whenever a row or column is changed</MenuItem>
        <MenuItem value={HistoryResolution.ON_PASSTHROUGH}>When grid is fully iterated through</MenuItem>
      </Select>
    </div>
  );
}

function checkPromptForErrors(prompt: Array<number>, gridSize: number) {
  if (!prompt) return '';
  const sum = prompt.reduce((a, b) => a + b, 0);
  if (sum > gridSize) return 'Prompt adds up to ' + sum + ' which is longer than the grid allows.';
  return '';
}

export default function NonogramBuilder() {
  const navigate = useNavigate();
  const { setGridHistory, setGridSize: setContextGridSize } = useNonogramContext();

  const [gridSize, setGridSize] = useState<number>(10);
  const [rowPromptsByGridSize, setRowPromptsByGridSize] = useState(new Map<number, number[][]>());
  const [columnPromptsByGridSize, setColumnPromptsByGridSize] = useState(new Map<number, number[][]>());
  const [historyResolution, setHistoryResolution] = useState<HistoryResolution>(HistoryResolution.EVERY_ROW_OR_COLUMN);
  const [nonogramSolver] = useState(new NonogramSolver());

  const rowPrompts: number[][] = rowPromptsByGridSize.get(gridSize) || [];
  const columnPrompts: number[][] = columnPromptsByGridSize.get(gridSize) || [];

  function setRowPrompts(prompts: number[][]) {
    const newMap = new Map(rowPromptsByGridSize);
    newMap.set(gridSize, prompts);
    setRowPromptsByGridSize(newMap);
  }

  function setColumnPrompts(prompts: number[][]) {
    const newMap = new Map(columnPromptsByGridSize);
    newMap.set(gridSize, prompts);
    setColumnPromptsByGridSize(newMap);
  }

  // Compute errors
  const rowPromptErrors = rowPrompts.map(p => checkPromptForErrors(p, gridSize));
  const columnPromptErrors = columnPrompts.map(p => checkPromptForErrors(p, gridSize));
  const errorInPrompts = rowPromptErrors.some(e => e !== '') || columnPromptErrors.some(e => e !== '');

  function handleSolve() {
    if (errorInPrompts) {
      alert('Please resolve any errors in the prompts before solving the puzzle');
      return;
    }
    nonogramSolver.setHistoryResolution(historyResolution);
    const history: GridHistory = [];
    nonogramSolver.solveNonogram(rowPrompts, columnPrompts, history);
    setGridHistory(history);
    setContextGridSize(gridSize);
    navigate({ to: '/puzzles/nonogram/solution' });
  }

  function handleExamplePuzzle() {
    const puzzle: ExamplePuzzle = getExamplePuzzle(gridSize);
    setRowPrompts(puzzle.rows);
    setColumnPrompts(puzzle.columns);
  }

  function handleRandomPuzzle() {
    const puzzle: ExamplePuzzle = getRandomPuzzle(gridSize);
    setRowPrompts(puzzle.rows);
    setColumnPrompts(puzzle.columns);
  }

  return (
    <div className="App" style={{ margin: '20px' }}>
      <div>
        <label>Grid size (recommended 5, 10, 15): </label>
        <input type="range" min={5} max={15} step={5} value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))} />
        <span> {gridSize}</span>
      </div>
      <HistoryResolutionSelector value={historyResolution} onChange={setHistoryResolution} />
      <div style={{ margin: '15px' }}>
        <Typography>Click on the prompts to edit. All prompts should be comma delimited lists of numbers (e.g. 5 or 2,4,2)</Typography>
      </div>
      <NonogramGrid
        gridSize={gridSize}
        gridState={[]}
        rowPrompts={rowPrompts}
        columnPrompts={columnPrompts}
        isEditable={true}
        onRowPromptChange={(i, prompt) => {
          const newPrompts = rowPrompts.slice();
          newPrompts[i] = prompt;
          setRowPrompts(newPrompts);
        }}
        onColumnPromptChange={(i, prompt) => {
          const newPrompts = columnPrompts.slice();
          newPrompts[i] = prompt;
          setColumnPrompts(newPrompts);
        }}
        rowPromptErrors={rowPromptErrors}
        columnPromptErrors={columnPromptErrors}
      />
      <div style={{ marginTop: '20px' }}>
        <Button sx={{ margin: '10px' }} variant='outlined' size='small' onClick={handleExamplePuzzle}>USE EXAMPLE PUZZLE</Button>
        <Button sx={{ margin: '10px' }} variant='outlined' size='small' onClick={handleRandomPuzzle}>GENERATE RANDOM PUZZLE</Button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Button variant='contained' size='large' onClick={handleSolve}>FIND SOLUTION</Button>
      </div>
    </div>
  );
}
