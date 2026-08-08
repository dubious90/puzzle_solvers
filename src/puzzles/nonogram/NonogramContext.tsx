import React, { createContext, useContext, useState } from 'react';
import { GridHistory } from './solver';

interface NonogramState {
  gridHistory: GridHistory;
  gridSize: number;
  setGridHistory: (history: GridHistory) => void;
  setGridSize: (size: number) => void;
}

const NonogramContext = createContext<NonogramState | null>(null);

export function NonogramProvider({ children }: { children: React.ReactNode }) {
  const [gridHistory, setGridHistory] = useState<GridHistory>([]);
  const [gridSize, setGridSize] = useState<number>(10);

  return (
    <NonogramContext.Provider value={{ gridHistory, gridSize, setGridHistory, setGridSize }}>
      {children}
    </NonogramContext.Provider>
  );
}

export function useNonogramContext() {
  const ctx = useContext(NonogramContext);
  if (!ctx) throw new Error('useNonogramContext must be used inside NonogramProvider');
  return ctx;
}
