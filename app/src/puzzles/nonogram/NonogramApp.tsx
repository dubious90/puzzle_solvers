import React, { ReactElement, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Paper, Select, MenuItem, SelectChangeEvent,
} from '@mui/material';

import { AppState, RowOrColumn } from './enums';
import Sliders from './Sliders';
import NonogramSolver, { Square, GridHistory, HistoryResolution } from './solver';
import NonogramButtons, { ButtonClickAction } from './NonogramButtons';
import PromptInput from './PromptInput';
import { ExamplePuzzle, getExamplePuzzle, getRandomPuzzle } from './puzzle-creator';
import './NonogramApp.css';

interface HistoryResolutionSelectorProps {
  value: HistoryResolution;
  onChange: (newValue: HistoryResolution) => void;
  appState: AppState;
}

function HistoryResolutionSelector({ value, onChange, appState }: HistoryResolutionSelectorProps) {
  const handleChange = (event: SelectChangeEvent<HistoryResolution>) => {
    onChange(event.target.value as HistoryResolution);
  };
  if (appState === AppState.ITERATING_HISTORY) return null;
  return (
    <div>
      <span style={{ marginRight: '10px' }}>How often should history be captured?</span>
      <Select size="small" value={value} onChange={handleChange}>
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
  if (sum > gridSize) {
    return 'Prompt adds up to ' + sum + ' which is longer than the grid allows.';
  }
  return '';
}

export default function NonogramApp() {
  const [appState, setAppState] = useState<AppState>(AppState.FORMING_PUZZLE);
  const [gridSize, setGridSize] = useState<number>(10);
  const [gridHistory, setGridHistory] = useState<GridHistory>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
  const [rowPromptsByGridSize, setRowPromptsByGridSize] = useState(new Map<number, number[][]>());
  const [columnPromptsByGridSize, setColumnPromptsByGridSize] = useState(new Map<number, number[][]>());
  const [historyResolution, setHistoryResolution] = useState<HistoryResolution>(HistoryResolution.EVERY_ROW_OR_COLUMN);
  const [nonogramSolver, setNonogramSolver] = useState(new NonogramSolver());

  const rowPrompts: number[][] = rowPromptsByGridSize.get(gridSize) || [];
  const columnPrompts: number[][] = columnPromptsByGridSize.get(gridSize) || [];
  const currentGridState = appState === AppState.ITERATING_HISTORY ? gridHistory[currentHistoryIndex] : [];
  let errorInPrompts = false;

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

  const handleButtonClick = (action: ButtonClickAction) => {
    if (action === ButtonClickAction.SOLVE_PUZZLE) {
      if (errorInPrompts) {
        alert('Please resolve any errors in the prompts before solving the puzzle');
        return;
      }
      const solver = nonogramSolver;
      solver.setHistoryResolution(historyResolution);
      const history: GridHistory = [];
      solver.solveNonogram(rowPrompts, columnPrompts, history);
      setGridHistory(history);
      setAppState(AppState.ITERATING_HISTORY);
      setCurrentHistoryIndex(history.length - 1);
      setNonogramSolver(solver);
    } else if (action === ButtonClickAction.BACK_TO_PUZZLE_CREATION) {
      setAppState(AppState.FORMING_PUZZLE);
      setCurrentHistoryIndex(0);
      setGridHistory([]);
    } else if (action === ButtonClickAction.EXAMPLE_PUZZLE) {
      const puzzle: ExamplePuzzle = getExamplePuzzle(gridSize);
      setRowPrompts(puzzle.rows);
      setColumnPrompts(puzzle.columns);
    } else if (action === ButtonClickAction.RANDOM_PUZZLE) {
      const puzzle: ExamplePuzzle = getRandomPuzzle(gridSize);
      setRowPrompts(puzzle.rows);
      setColumnPrompts(puzzle.columns);
    }
  };

  const headers: ReactElement[] = [<TableCell key="spacer"></TableCell>];
  const rows: ReactElement[] = [];

  for (let i = 0; i < gridSize; i++) {
    const columnPrompt = columnPrompts[i];
    const columnPromptError = checkPromptForErrors(columnPrompt, gridSize);
    if (columnPromptError) errorInPrompts = true;
    headers.push(
      <PromptInput
        key={'columnPromptInput' + i}
        appState={appState}
        promptType={RowOrColumn.COLUMN}
        value={columnPrompt}
        onChange={(prompt) => {
          const newPrompts = columnPrompts.slice();
          newPrompts[i] = prompt;
          setColumnPrompts(newPrompts);
        }}
        promptError={columnPromptError}
        reactKey={'columnPrompt' + i}
      />
    );

    const currentRow = currentGridState[i] || [];
    const cells: ReactElement[] = [];
    for (let j = 0; j < gridSize; j++) {
      const square: Square = currentRow[j] || Square.MAYBE;
      const reactKey = 'cell_' + i + '_' + j;
      if (square === Square.YES) {
        cells.push(<TableCell key={reactKey} size="small" style={{ background: 'gray', border: '1px solid gray' }}><div className='cellDiv'>&#x2713;</div></TableCell>);
      } else if (square === Square.NO) {
        cells.push(<TableCell key={reactKey} size="small" style={{ border: '1px solid gray' }}><div className='cellDiv'>X</div></TableCell>);
      } else {
        cells.push(<TableCell key={reactKey} size="small" style={{ border: '1px solid gray' }}><div className='cellDiv'>&nbsp;</div></TableCell>);
      }
    }

    const rowPrompt = rowPrompts[i];
    const rowPromptError = checkPromptForErrors(rowPrompt, gridSize);
    if (rowPromptError) errorInPrompts = true;
    cells.unshift(
      <PromptInput
        key={'rowPromptInput' + i}
        appState={appState}
        promptType={RowOrColumn.ROW}
        value={rowPrompts[i]}
        onChange={(prompt) => {
          const newPrompts = rowPrompts.slice();
          newPrompts[i] = prompt;
          setRowPrompts(newPrompts);
        }}
        promptError={rowPromptError}
        reactKey={'rowPrompt' + i}
      />
    );
    rows.push(<TableRow key={'row_' + i}>{cells}</TableRow>);
  }

  const instructions = appState === AppState.FORMING_PUZZLE
    ? <div style={{ margin: '15px' }}>
        <Typography>Click on the prompts to edit. All prompts should be comma delimited lists of numbers (e.g. 5 or 2,4,2)</Typography>
      </div>
    : null;

  return (
    <div className="App" style={{ margin: '20px' }}>
      <Sliders
        appState={appState}
        gridSize={gridSize}
        gridSizeOnChange={(_e, v) => setGridSize(v as number)}
        historySize={gridHistory.length}
        historyOnChange={(_e, v) => setCurrentHistoryIndex(v as number)}
        currentHistoryIndex={currentHistoryIndex}
      />
      <HistoryResolutionSelector appState={appState} onChange={setHistoryResolution} value={historyResolution} />
      {instructions}
      <TableContainer component={Paper} sx={{ paddingBottom: '10px' }}>
        <Table sx={{ width: 'auto', margin: '0 auto' }} id="nonogramTable" aria-label="nonogramTable">
          <TableHead>
            <TableRow key="header_row">{headers}</TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </TableContainer>
      <NonogramButtons appState={appState} handleButtonClick={handleButtonClick} />
    </div>
  );
}
