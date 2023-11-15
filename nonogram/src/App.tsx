import React, { ChangeEvent, ChangeEventHandler, ReactElement, useState } from 'react';
import './App.css';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Paper } from '@mui/material';

import { AppState } from './enums';
import Sliders from './Sliders';
import NonogramSolver, { Square, GridHistory } from './solver';
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
  const [currentGridState, setCurrentGridState] = useState<Square[][]>([]);

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
      const solver = new NonogramSolver();
      const history: GridHistory = [];
      const solution = solver.solveNonogram(rowPrompts, columnPrompts, history);
      setGridHistory(history);
      setAppState(AppState.ITERATING_HISTORY);
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

    const cells = new Array(gridSize).fill(<TableCell className='nonogramCell'><div className='cellDiv'></div></TableCell>);
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
