import React, { ReactElement } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper,
} from '@mui/material';

import { RowOrColumn } from './enums';
import { Square } from './solver';
import PromptInput from './PromptInput';

interface NonogramGridProps {
  gridSize: number;
  /** The current grid state (filled squares). Empty array for builder mode. */
  gridState: Array<Array<Square>>;
  /** Row prompts to display. Only editable when isEditable is true. */
  rowPrompts: number[][];
  /** Column prompts to display. Only editable when isEditable is true. */
  columnPrompts: number[][];
  /** Whether prompts can be edited (builder) or are read-only (solution). */
  isEditable: boolean;
  /** Called when a row prompt changes. Only relevant when isEditable. */
  onRowPromptChange?: (index: number, prompt: number[]) => void;
  /** Called when a column prompt changes. Only relevant when isEditable. */
  onColumnPromptChange?: (index: number, prompt: number[]) => void;
  /** Error string per row prompt index. */
  rowPromptErrors?: string[];
  /** Error string per column prompt index. */
  columnPromptErrors?: string[];
}

export default function NonogramGrid({
  gridSize,
  gridState,
  rowPrompts,
  columnPrompts,
  isEditable,
  onRowPromptChange,
  onColumnPromptChange,
  rowPromptErrors = [],
  columnPromptErrors = [],
}: NonogramGridProps) {
  const headers: ReactElement[] = [<TableCell key="spacer"></TableCell>];
  const rows: ReactElement[] = [];

  for (let i = 0; i < gridSize; i++) {
    headers.push(
      <PromptInput
        key={'columnPromptInput' + i}
        isEditable={isEditable}
        promptType={RowOrColumn.COLUMN}
        value={columnPrompts[i]}
        onChange={(prompt) => onColumnPromptChange?.(i, prompt)}
        promptError={columnPromptErrors[i] || ''}
        reactKey={'columnPrompt' + i}
      />
    );

    const currentRow = gridState[i] || [];
    const cells: ReactElement[] = [];

    cells.push(
      <PromptInput
        key={'rowPromptInput' + i}
        isEditable={isEditable}
        promptType={RowOrColumn.ROW}
        value={rowPrompts[i]}
        onChange={(prompt) => onRowPromptChange?.(i, prompt)}
        promptError={rowPromptErrors[i] || ''}
        reactKey={'rowPrompt' + i}
      />
    );

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

    rows.push(<TableRow key={'row_' + i}>{cells}</TableRow>);
  }

  return (
    <TableContainer component={Paper} sx={{ paddingBottom: '10px' }}>
      <Table sx={{ width: 'auto', margin: '0 auto' }} aria-label="nonogramTable">
        <TableHead>
          <TableRow>{headers}</TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
}
