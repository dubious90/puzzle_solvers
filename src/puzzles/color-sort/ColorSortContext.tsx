import React, { createContext, useContext, useState } from 'react';
import { IColor } from 'react-color-palette';
import { MoveAction } from './pipes';

interface ColorSortState {
  solution: MoveAction[];
  allColors: IColor[];
  setSolution: (solution: MoveAction[]) => void;
  setAllColors: (colors: IColor[]) => void;
}

const ColorSortContext = createContext<ColorSortState | null>(null);

export function ColorSortProvider({ children }: { children: React.ReactNode }) {
  const [solution, setSolution] = useState<MoveAction[]>([]);
  const [allColors, setAllColors] = useState<IColor[]>([]);

  return (
    <ColorSortContext.Provider value={{ solution, allColors, setSolution, setAllColors }}>
      {children}
    </ColorSortContext.Provider>
  );
}

export function useColorSortContext() {
  const ctx = useContext(ColorSortContext);
  if (!ctx) throw new Error('useColorSortContext must be used inside ColorSortProvider');
  return ctx;
}
