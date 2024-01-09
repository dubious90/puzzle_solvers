import React, { ReactElement, useState } from 'react';
import './App.css';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Select, MenuItem, SelectChangeEvent } from '@mui/material';

import { AppState, RowOrColumn } from './enums';
import Sliders from './Sliders';
import NonogramSolver, { Square, GridHistory, HistoryResolution } from './solver';
import NonogramButtons, { ButtonClickAction } from './NonogramButtons';
import PromptInput from './PromptInput';
import { ExamplePuzzle, getExamplePuzzle, getRandomPuzzle } from './puzzle-creator';

interface HistoryResolutionSelectorProps {
  // The current value for history resolution to display.
  value: HistoryResolution,
  // Sets the value of the history resolution as the select changes.
  onChange: (newValue: HistoryResolution) => void,
  // The current app state, affects whether the select appears or not.
  appState: AppState,
}

function HistoryResolutionSelector({ value, onChange, appState }: HistoryResolutionSelectorProps) {
  const handleChange = (event: SelectChangeEvent<HistoryResolution>, child: React.ReactNode) => {
    onChange(event.target.value as HistoryResolution);
  };
  if (appState === AppState.ITERATING_HISTORY) return null;
  return (
    <div>
      <span style={{ marginRight: "10px" }}>
        How often should history be captured?
      </span>
      <Select size="small" value={value} onChange={handleChange}>
        <MenuItem value={HistoryResolution.EVERY_STEP}>Whenever value entered</MenuItem>
        <MenuItem value={HistoryResolution.EVERY_ROW_OR_COLUMN}>Whenever a row or column is changed</MenuItem>
        <MenuItem value={HistoryResolution.ON_PASSTHROUGH}>When grid is fully iterated through</MenuItem>
      </Select>
    </div>
  );
}

function checkPromptForErrors(prompt: Array<number>, gridSize: number) {
  if (!prompt) return "";
  let newError = "";
  let sum = prompt.reduce((a, b) => a + b, 0);

  if (sum > gridSize) {
    newError = "Prompt adds up to " + sum + " which is longer than the grid allows.";
  }

  return newError;
}

function App() {
  // The state of the app, affects which elements appear and what they functionally enable.
  const [appState, setAppState] = useState<AppState>(AppState.FORMING_PUZZLE);
  const [gridSize, setGridSize] = useState<number>(10);
  // Set by the nonogram solver, iterated through when ITERATING_HISTORY
  const [gridHistory, setGridHistory] = useState<GridHistory>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);

  // Stores the full set of prompts in a map keyed by gridSize, so changing the grid size does not remove effort.
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

  function handleGridSizeSlider(newGridSize: number) {
    setGridSize(newGridSize);
  }

  let headers: ReactElement[] = [<TableCell key="spacer"></TableCell>];
  let rows: ReactElement[] = [];
  const handleRowChange = (index: number, newPrompt: number[]) => {
    let newPrompts = rowPrompts.slice();
    newPrompts[index] = newPrompt;
    setRowPrompts(newPrompts);
  };

  const handleColumnChange = (index: number, newPrompt: number[]) => {
    let newPrompts = columnPrompts.slice();
    newPrompts[index] = newPrompt;
    setColumnPrompts(newPrompts);
  }

  /**
   * Generic function for handling all of the actions the main buttons may take.
   * 
   * @param action Defines the button being clicked, determines what action to take.
   */
  const handleButtonClick = (action: ButtonClickAction) => {
    if (action === ButtonClickAction.SOLVE_PUZZLE) {
      if (errorInPrompts) {
        alert("Please resolve any errors in the prompts before solving the puzzle");
        return;
      }
      let solver = nonogramSolver;
      solver.setHistoryResolution(historyResolution);
      const history: GridHistory = [];
      solver.solveNonogram(rowPrompts, columnPrompts, history);
      setGridHistory(history);
      setAppState(AppState.ITERATING_HISTORY);
      setCurrentHistoryIndex(history.length - 1);
      setNonogramSolver(solver);
    }
    else if (action === ButtonClickAction.BACK_TO_PUZZLE_CREATION) {
      setAppState(AppState.FORMING_PUZZLE);
      setCurrentHistoryIndex(0);
      setGridHistory([]);
    }
    else if (action === ButtonClickAction.EXAMPLE_PUZZLE) {
      let puzzle: ExamplePuzzle = getExamplePuzzle(gridSize);
      setRowPrompts(puzzle.rows);
      setColumnPrompts(puzzle.columns);
    }
    else if (action === ButtonClickAction.RANDOM_PUZZLE) {
      let puzzle: ExamplePuzzle = getRandomPuzzle(gridSize);
      setRowPrompts(puzzle.rows);
      setColumnPrompts(puzzle.columns);
    }
  }

  for (let i = 0; i < gridSize; i++) {
    const columnPrompt = columnPrompts[i];
    const columnPromptError = checkPromptForErrors(columnPrompt, gridSize);
    if (columnPromptError) errorInPrompts = true;
    headers.push(
      <PromptInput
        appState={appState}
        promptType={RowOrColumn.COLUMN}
        value={columnPrompt}
        onChange={(prompt) => { handleColumnChange(i, prompt) }}
        promptError={columnPromptError}
        reactKey={"columnPrompt" + i}
        key={"columnPromptInput" + i}
      />
    );

    const currentRow = currentGridState[i] || [];
    const cells: ReactElement[] = [];
    for (let j = 0; j < gridSize; j++) {
      const square: Square = currentRow[j] || Square.MAYBE;
      const reactKey = "cell_" + i + "_" + j;
      if (square === Square.YES) {
        cells.push(<TableCell key={reactKey} size="small" style={{ background: 'gray' }} className='nonogramCell'><div key={reactKey + "_div"} className='cellDiv'>&#x2713;</div></TableCell>);
      }
      else if (square === Square.NO) {
        cells.push(<TableCell key={reactKey} size="small" className='nonogramCell'><div key={reactKey + "_div"} className='cellDiv'>X</div></TableCell>);
      }
      else {
        cells.push(<TableCell key={reactKey} size="small" className='nonogramCell'><div key={reactKey + "_div"} className='cellDiv'>&nbsp;</div></TableCell>);
      }
    }

    const rowPrompt = rowPrompts[i];
    const rowPromptError = checkPromptForErrors(rowPrompt, gridSize);
    if (rowPromptError) errorInPrompts = true;
    cells.unshift(<PromptInput
      appState={appState}
      promptType={RowOrColumn.ROW}
      value={rowPrompts[i]}
      onChange={(prompt) => { handleRowChange(i, prompt) }}
      promptError={rowPromptError}
      reactKey={"rowPrompt" + i}
      key={"rowPromptInput" + i}
    />);
    rows.push(
      <TableRow key={"row_" + i}>
        {cells}
      </TableRow>
    );
  }

  const instructions = appState === AppState.FORMING_PUZZLE
    ? <div style={{ margin: "15px" }}>
      <Typography>Click on the prompts to edit. All prompts should be comma delimited lists of numbers (e.g. 5 or 2,4,2)</Typography>
    </div>
    : null;

  return (
    <div className="App" style={{ margin: "20px" }}>
      <Sliders
        appState={appState}
        gridSize={gridSize}
        gridSizeOnChange={(event: Event, newGridSize: number | number[]) => { handleGridSizeSlider(newGridSize as number); }}
        historySize={gridHistory.length}
        historyOnChange={(event: Event, newHistoryIndex: number | number[]) => { setCurrentHistoryIndex(newHistoryIndex as number); }}
        currentHistoryIndex={currentHistoryIndex}
      />
      <HistoryResolutionSelector appState={appState} onChange={setHistoryResolution} value={historyResolution} />
      {instructions}
      <TableContainer component={Paper} sx={{ paddingBottom: "10px" }}>
        <Table sx={{ width: "auto", margin: "0 auto" }} id="nonogramTable" aria-label="nonogramTable">
          <TableHead>
            <TableRow key="header_row">
              {headers}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </TableContainer>
      <NonogramButtons appState={appState} handleButtonClick={handleButtonClick} />
    </div>
  );
}

export default App;
