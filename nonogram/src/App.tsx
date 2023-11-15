import React, { ChangeEvent, ChangeEventHandler, ReactElement, useState } from 'react';
import './App.css';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Paper } from '@mui/material';

import { AppState } from './enums';
import Sliders from './Sliders';
import NonogramSolver, { Square, GridHistory } from './solver';

interface NonogramTableProps {
  gridSize: number,
  rowPrompts: Array<Array<number>>,
  columnPrompts: Array<Array<number>>,
  setRowPrompts: (rows: Array<Array<number>>) => void,
  setColumnPrompts: (cols: Array<Array<number>>) => void,
}

enum RowOrColumn {
  ROW,
  COLUMN,
}

interface PromptInputProps {
  // appState: AppState,
  gridSize: number,
  onChange: ChangeEventHandler<HTMLInputElement>,
  value: Array<number>,
  promptType: RowOrColumn,
  // If an error is added or removed, call this function.
  handleErrorChange: (inErrorState: boolean) => void,
}

function PromptInput({ gridSize, onChange, value, promptType, handleErrorChange }: PromptInputProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [valueOverride, setValueOverride] = useState("");
  let sx: any = { padding: "2px", maxWidth: "100px" };

  if (error.length > 0) {
    sx.border = "3px solid red";
  }

  const align = promptType === RowOrColumn.ROW ? "right" : "center";

  function handleBlur(event: ChangeEvent<HTMLInputElement>) {
    const validRegex = /^[0-9]+(,[0-9])*$/;
    const newText: string = event.target.value;
    if (!validRegex.test(newText)) {
      setError("Each prompt must be a comma-delimited string of numbers");
      setValueOverride(newText);
    }
    newText.split(",");
  }

  if (!value || value.length === 0) value = [0];

  const textValue = valueOverride.length > 0 ? valueOverride : value.join(",");

  let titleText = error.length > 0 ? error : "";

  if (editing) {
    return (
      <TableCell title={titleText} align={align} sx={sx}>
        <input
          className="promptInput"
          type="text"
          onBlur={handleBlur}
          defaultValue={textValue}
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

function NonogramTable({ gridSize, setRowPrompts, setColumnPrompts, rowPrompts, columnPrompts }: NonogramTableProps) {
  let headers: Array<ReactElement> = [<TableCell></TableCell>];
  let rows: Array<ReactElement> = [];
  const handleRowChange = (index: number, newValue: number) => {
    let newPrompts = rowPrompts.slice();
    newPrompts[index][0] = newValue;
    setRowPrompts(newPrompts);
  };

  const handleColumnChange = (index: number, newValue: number) => {
    let newPrompts = columnPrompts.slice();
    newPrompts[index][0] = newValue;
    setColumnPrompts(newPrompts);
  }

  const addOrRemoveError = (addError: boolean) => {
    if (addError) {

    }
  }

  for (let i = 0; i < gridSize; i++) {

    headers.push(
      <PromptInput
        promptType={RowOrColumn.COLUMN}
        gridSize={gridSize}
        value={columnPrompts[i]}
        onChange={(e: ChangeEvent<HTMLInputElement>) => { handleRowChange(i, parseInt(e.target.value)) }}
        handleErrorChange={addOrRemoveError}
      />
    );

    const cells = new Array(gridSize).fill(<TableCell className='nonogramCell'><div className='cellDiv'></div></TableCell>);
    cells.unshift(<PromptInput promptType={RowOrColumn.ROW} gridSize={gridSize} value={rowPrompts[i]} onChange={() => { }} handleErrorChange={addOrRemoveError} />);
    rows.push(
      <TableRow>
        {cells}
      </TableRow>
    );
  }
  return (
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
  );
}

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.FORMING_PUZZLE);
  const [gridSize, setGridSize] = useState<number>(10);
  const [gridHistory, setGridHistory] = useState<GridHistory>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
  const [rowPrompts, setRowPrompts] = useState<Array<Array<number>>>([]);
  const [columnPrompts, setColumnPrompts] = useState<Array<Array<number>>>([]);

  function handleGridSizeSlider(newGridSize: number) {
    setGridSize(newGridSize);

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
      <NonogramTable gridSize={gridSize} setColumnPrompts={setColumnPrompts} setRowPrompts={setRowPrompts} rowPrompts={rowPrompts} columnPrompts={columnPrompts} />

    </div>
  );
}

export default App;
