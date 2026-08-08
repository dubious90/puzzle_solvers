import React, { useState } from 'react';
import { TableCell } from '@mui/material';

import { RowOrColumn } from './enums';

interface PromptInputProps {
  isEditable: boolean;
  onChange: (prompt: number[]) => void;
  value: number[];
  promptType: RowOrColumn;
  promptError: string;
  reactKey: string;
}

export default function PromptInput({ isEditable, onChange, value, promptType, promptError, reactKey }: PromptInputProps) {
  const [editing, setEditing] = useState(false);

  let sx: any = {
    padding: '2px',
    maxWidth: '100px',
    borderRight: '1px solid black',
    borderBottom: '1px solid black',
  };
  if (promptError.length > 0) {
    sx.border = '3px solid red';
  }

  const align = promptType === RowOrColumn.ROW ? 'right' : 'center';

  function handleChange(newText: string) {
    let newValue: number[] = [];
    const validRegex = /^[0-9]+(,[0-9]+)*$/;
    if (!validRegex.test(newText)) {
      alert('Each prompt must be a comma-delimited string of numbers. Please re-enter.');
    } else {
      const promptTexts = newText.split(',');
      promptTexts.forEach((prompt) => {
        newValue.push(parseInt(prompt, 10));
      });
    }
    onChange(newValue);
    setEditing(false);
  }

  if (!value || value.length === 0) value = [0];
  const textValue = value.join(',');
  const titleText = promptError.length > 0 ? promptError : '';

  if (editing) {
    return (
      <TableCell key={reactKey} title={titleText} align={align} sx={sx}>
        <input
          autoFocus
          className="promptInput"
          type="text"
          onBlur={(e) => handleChange(e.target.value)}
          defaultValue={textValue}
          onKeyUp={(e) => { if (e.key === 'Enter') handleChange((e.target as HTMLInputElement).value); }}
          key={reactKey + '_input'}
          style={{ textAlign: 'center', position: 'relative', width: '80px' }}
        />
      </TableCell>
    );
  } else {
    return (
      <TableCell key={reactKey} title={titleText} align={align} sx={sx}
        onClick={() => { if (isEditable) setEditing(true); }}>
        <span key={reactKey + '_span'}>{textValue}</span>
      </TableCell>
    );
  }
}
