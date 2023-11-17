import React, { ReactElement, useState } from 'react';
import './App.css';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';

import { AppState } from './enums';
import Sliders from './Sliders';
import NonogramSolver, { Square, GridHistory, HistoryResolution } from './solver';
import NonogramButtons, { ButtonClickAction } from './NonogramButtons';

enum RowOrColumn {
  ROW,
  COLUMN,
}

interface PromptInputProps {
  // appState: AppState,
  gridSize: number,
  onChange: (prompt: number[]) => void,
  value: number[],
  promptType: RowOrColumn,
  // If an error is added or removed, call this function.
  handleErrorChange: (inErrorState: boolean) => void,
}

function PromptInput({ gridSize, onChange, value, promptType, handleErrorChange }: PromptInputProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  let sx: any = { padding: "2px", maxWidth: "100px" };

  if (error.length > 0) {
    sx.border = "3px solid red";
  }

  const align = promptType === RowOrColumn.ROW ? "right" : "center";

  function handleChange(newText: string) {
    let newError = "";
    const validRegex = /^[0-9]+(,[0-9])*$/;
    if (!validRegex.test(newText)) {
      newError = "Each prompt must be a comma-delimited string of numbers";
    }
    else {
      const promptTexts = newText.split(",");
      let newValue: number[] = [];
      let sum = 0;
      promptTexts.forEach((prompt) => {
        const num = parseInt(prompt);
        if (num === undefined) {
          console.log("This shouldn't happen");
          newError = "Each prompt must be a comma-delimited string of numbers";
        }
        sum = sum + num;
        newValue.push(num);
      });

      if (sum > gridSize) {
        newError = "Prompt adds up to " + sum + " which is longer than the grid allows.";
      }
      else {
        if (newError.length === 0) {
          onChange(newValue);
          setEditing(false);
        }
      }
    }
    setError(newError);
    handleErrorChange(error.length > 0);
  }

  if (!value || value.length === 0) value = [0];

  const textValue = value.join(",");

  let titleText = error.length > 0 ? error : "";

  if (editing) {
    return (
      <TableCell title={titleText} align={align} sx={sx}>
        <input
          autoFocus
          className="promptInput"
          type="text"
          onBlur={(e) => { handleChange(e.target.value) }}
          defaultValue={textValue}
          onKeyUp={(e) => { if (e.key === "Enter") handleChange((e.target as HTMLInputElement).value) }}
        />
      </TableCell>
    );
  }
  else {
    return (
      <TableCell title={titleText} align={align} sx={sx} onClick={() => { setEditing(true) }}>
        <span>
          {textValue}
        </span>
      </TableCell>
    );
  }
}


function App() {
  const [appState, setAppState] = useState<AppState>(AppState.FORMING_PUZZLE);
  const [gridSize, setGridSize] = useState<number>(10);
  const [gridHistory, setGridHistory] = useState<GridHistory>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
  const [rowPrompts, setRowPrompts] = useState<number[][]>([]);
  const [columnPrompts, setColumnPrompts] = useState<number[][]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  // const [currentGridState, setCurrentGridState] = useState<Square[][]>([]);
  const [nonogramSolver, setNonogramSolver] = useState(new NonogramSolver());

  const currentGridState = appState === AppState.ITERATING_HISTORY ? gridHistory[currentHistoryIndex] : [];

  function handleGridSizeSlider(newGridSize: number) {
    setGridSize(newGridSize);
  }

  let headers: ReactElement[] = [<TableCell></TableCell>];
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

  const addOrRemoveError = (addError: boolean) => {
    // DOES NOT WORK AT ALL. FIX LATER
    if (addError) {
      setErrorCount(errorCount + 1);
    }
    else {
      if (errorCount > 0) {
        setErrorCount(errorCount - 1);
      }
    }
  }

  const handleButtonClick = (action: ButtonClickAction) => {
    if (action === ButtonClickAction.SOLVE_PUZZLE) {
      let solver = nonogramSolver;
      solver.setHistoryResolution(HistoryResolution.EVERY_ROW_OR_COLUMN);
      const history: GridHistory = [];
      solver.solveNonogram(rowPrompts, columnPrompts, history);
      setGridHistory(history);
      setAppState(AppState.ITERATING_HISTORY);
      // setCurrentGridState(solution);
      setCurrentHistoryIndex(history.length - 1);
      setNonogramSolver(solver);
    }
    else if (action === ButtonClickAction.BACK_TO_PUZZLE_CREATION) {
      setAppState(AppState.FORMING_PUZZLE);
      setCurrentHistoryIndex(0);
      setGridHistory([]);
      // setCurrentGridState([]);
    }
  }

  for (let i = 0; i < gridSize; i++) {

    headers.push(
      <PromptInput
        promptType={RowOrColumn.COLUMN}
        gridSize={gridSize}
        value={columnPrompts[i]}
        onChange={(prompt) => { handleColumnChange(i, prompt) }}
        handleErrorChange={addOrRemoveError}
      />
    );

    const currentRow = currentGridState[i] || [];
    const cells: ReactElement[] = [];
    for (let j = 0; j < gridSize; j++) {
      const square: Square = currentRow[j] || Square.MAYBE;
      if (square === Square.YES) {
        cells.push(<TableCell size="small" style={{ background: 'gray' }} className='nonogramCell'><div className='cellDiv'>&#x2713;</div></TableCell>);
      }
      else if (square === Square.NO) {
        cells.push(<TableCell size="small" className='nonogramCell'><div className='cellDiv'>X</div></TableCell>);
      }
      else {
        cells.push(<TableCell size="small" className='nonogramCell'><div className='cellDiv'>&nbsp;</div></TableCell>);
      }
    }

    cells.unshift(<PromptInput
      promptType={RowOrColumn.ROW}
      gridSize={gridSize}
      value={rowPrompts[i]}
      onChange={(prompt) => { handleRowChange(i, prompt) }}
      handleErrorChange={addOrRemoveError} />);
    rows.push(
      <TableRow>
        {cells}
      </TableRow>
    );
  }

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
      <Typography>Click on the prompts to edit. All prompts should be comma delimited lists of numbers (e.g. 5 or 2,4,2)</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ width: "auto", margin: "0 auto" }} id="nonogramTable" aria-label="nonogramTable">
          <TableHead>
            <TableRow>
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
