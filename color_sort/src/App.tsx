import React, { ReactElement, useEffect, useRef, useState } from 'react';

import { Button } from '@mui/material';
import Cookies from 'universal-cookie';
import { ColorPicker, IColor, useColor } from "react-color-palette";

import Sliders from './Sliders';
import { MoveAction, solvePipes } from './pipes';
import { AppState } from './enums';

import './App.css';
import "react-color-palette/css";

interface PipeProps {
  index: number,
  colorIds: Array<number>,
  allColors: Array<IColor>,
  onClick: (pipeIndex: number, colorIndex: number) => void,
}

interface ColorBlotType {
  color?: IColor,
  index: number,
  onColorChange: (color: IColor, index: number) => void,
  onClick: (colorIndex: number) => void,
}

function Pipe({ colorIds, allColors, index, onClick }: PipeProps) {
  let fills: Array<ReactElement> = [];

  for (let i = 0; i < colorIds.length; i++) {
    const fillOffset = 50 * (i + 4 - colorIds.length) + 25;
    const key = "pipe" + index + "color" + i;
    fills.push(
      <rect key={key} fill={allColors[colorIds[i]].hex} width="48" height="50" y={fillOffset} x={1} onClick={() => onClick(index, i)} ></rect>
    );
  };
  return (
    <svg display="block" width="75px" height="250px">
      <g>
        <rect fill='#FFFFFF' stroke="#000000" width="50" height="225" strokeWidth="1px"></rect>
      </g>
      <g>
        {fills}
      </g>
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
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}

function ColorBlot({ color, index, onColorChange, onClick }: ColorBlotType) {
  const [defaultColor] = useColor("#FF0000");
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const ref = useOutsideClick(() => {
    setShowPicker(false);
  })
  if (color === null || color === undefined) color = defaultColor;

  function handleColorSelect(color: IColor) {
    onColorChange(color, index);
  }

  function handleClick() {
    onClick(index);
  }

  const colorPicker = (showPicker ? <div id="colorPicker"><ColorPicker color={color || defaultColor} onChange={handleColorSelect} hideAlpha={true} /></div> : null);

  return (
    <span>
      <svg height="50" width="50" onClick={handleClick}>
        <g>
          <rect fill={color.hex} width="50" height="50" ></rect>
          <text strokeWidth="1" stroke='#000000' x="50%" y="50%" dominantBaseline="middle" textAnchor='middle'>{index}</text>
        </g>
      </svg>
      <div ref={ref}>
        <Button size="small" variant='outlined' onClick={() => { setShowPicker(true) }}>PICK</Button>
        {colorPicker}
      </div>
    </span>
  )
}

function App() {
  const cookies = new Cookies(null, { path: '/' });

  const [appState, setAppState] = useState<AppState>(AppState.FORMING_PUZZLE);
  const [pipeCount, setPipeCount] = useState<number>(14);
  const [colorCount, setColorCount] = useState<number>(12);
  const [pipeInputs, setPipeInputs] = useState<Array<Array<number>>>([]);
  const [allColors, setAllColors] = useState<Array<IColor>>(cookies.get("allColors") || []);
  const [history, setHistory] = useState<Array<MoveAction>>([]);
  const [currentMoveActionIndex, setCurrentMoveAction] = useState<number>(0);

  function addColorToPipe(colorId: number) {
    let newPipeInputs = pipeInputs.slice();
    let added = false;
    for (let i = 0; i < pipeCount; i++) {
      if (!newPipeInputs[i]) {
        newPipeInputs[i] = [];
      }
      const oldPipe = newPipeInputs[i] || [];
      if (oldPipe.length < 4 && !added) {
        let newPipe = oldPipe.slice();
        newPipe.unshift(colorId);
        newPipeInputs[i] = newPipe;
        added = true;
      }
    }
    setPipeInputs(newPipeInputs);
  }

  function removeColorFromPipe(pipeIndex: number, colorIndex: number) {
    let newPipeInputs = pipeInputs.slice();
    let newPipe = newPipeInputs[pipeIndex].slice();
    newPipe.splice(colorIndex, 1);
    newPipeInputs[pipeIndex] = newPipe;
    setPipeInputs(newPipeInputs);
  }

  function handleColorChange(color: IColor, index: number) {
    let newColors = allColors.slice();
    newColors[index] = color;
    setAllColors(newColors);
    cookies.set("allColors", allColors);
  }

  function handleButtonClick() {
    if (appState === AppState.FORMING_PUZZLE) {
      const solution = solvePipes(pipeInputs.slice(0, pipeCount));
      if (solution && solution.length > 0) {
        setHistory(solution);
        setAppState(AppState.FINDING_SOLUTION);
      }
      else {
        alert("Could not find solution");
      }
    }
    else {
      setAppState(AppState.FORMING_PUZZLE);
      setCurrentMoveAction(0);
      setHistory([]);
    }
  }

  const currentMoveAction = history[currentMoveActionIndex];

  let pipes: Array<ReactElement> = [];
  for (let i = 0; i < pipeCount; i++) {
    if (appState === AppState.FORMING_PUZZLE) {
      const colorIds: Array<number> = pipeInputs[i] || [];

      pipes.push(
        <li key={"pipe" + i}>
          <Pipe index={i} colorIds={colorIds} allColors={allColors} onClick={removeColorFromPipe} />
        </li>
      );
    }
    else if (appState === AppState.FINDING_SOLUTION) {
      let colorIds: Array<number> = currentMoveAction.pipes[i] || [];

      pipes.push(
        <li key={"pipe" + i}>
          <Pipe index={i} colorIds={colorIds} allColors={allColors} onClick={() => { }} />
        </li>
      );
    }
  }

  let colorSelectors: Array<ReactElement> = [];
  for (let i = 0; i < colorCount; i++) {
    colorSelectors.push(
      <li key={"key" + i}>
        <ColorBlot color={allColors[i]} index={i} onColorChange={handleColorChange} onClick={addColorToPipe} />
      </li>
    );
  }

  const selectColorsDiv = appState === AppState.FORMING_PUZZLE ?
    (
      <div>
        <div>
          Select colors. Then drag them to pipes to create your puzzle:
        </div>
        <ul className='colorList'>
          {colorSelectors}
        </ul>
      </div>
    )
    : null;

  let explainHistoryDiv = null;
  if (appState === AppState.FINDING_SOLUTION && currentMoveActionIndex > 0) {
    const colorValue: number = currentMoveAction.pipes[currentMoveAction.receiver][0];
    const color = <svg height={20} width={20}><g><rect fill={allColors[colorValue].hex} width="20" height="20" ></rect></g></svg>
    explainHistoryDiv =
      (
        <div>
          Moved {color} from pipe {currentMoveAction.mover + 1} to pipe {currentMoveAction.receiver + 1}
        </div>
      );
  }

  return (
    <div className="App" style={{ margin: "20px" }}>
      <Sliders
        appState={appState}
        pipeCount={pipeCount}
        colorCount={colorCount}
        pipesOnChange={(event: Event, newPipesCount: number | number[]) => { setPipeCount(newPipesCount as number); }}
        colorsOnChange={(event: Event, newColorCount: number | number[]) => { setColorCount(newColorCount as number); }}
        historySize={history.length}
        historyOnChange={(event: Event, newMoveAction: number | number[]) => { setCurrentMoveAction(newMoveAction as number); }}
        currentMoveAction={currentMoveActionIndex}
      />
      <div>
        <ul className='pipesList'>
          {pipes}
        </ul>
      </div>
      {selectColorsDiv}
      {explainHistoryDiv}
      <hr />
      <div style={{ marginTop: "20px" }}>
        <Button variant='contained' size='large' onClick={handleButtonClick}>{appState === AppState.FORMING_PUZZLE ? "FIND SOLUTION" : "BACK TO PUZZLE CREATION"}</Button>
      </div>
    </div >
  );
}

export default App;
