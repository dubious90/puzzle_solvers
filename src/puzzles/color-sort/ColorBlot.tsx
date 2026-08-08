import React, { useState } from 'react';
import { Button } from '@mui/material';
import { ColorPicker, IColor, useColor } from 'react-color-palette';
import 'react-color-palette/css';

import useOutsideClick from '../../hooks/useOutsideClick';

interface ColorBlotProps {
  color?: IColor;
  index: number;
  onColorChange: (color: IColor, index: number) => void;
  onClick: (colorIndex: number) => void;
}

export default function ColorBlot({ color, index, onColorChange, onClick }: ColorBlotProps) {
  const [defaultColor] = useColor('#FF0000');
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const ref = useOutsideClick(() => setShowPicker(false));
  if (color === null || color === undefined) color = defaultColor;

  return (
    <span>
      <svg height="50" width="50" onClick={() => onClick(index)}>
        <g>
          <rect fill={color.hex} width="50" height="50" />
          <text strokeWidth="1" stroke='#000000' x="50%" y="50%"
            dominantBaseline="middle" textAnchor='middle'>{index}</text>
        </g>
      </svg>
      <div ref={ref}>
        <Button size="small" variant='outlined' onClick={() => setShowPicker(true)}>PICK</Button>
        {showPicker && (
          <div id="colorPicker">
            <ColorPicker color={color} onChange={(c) => onColorChange(c, index)} hideAlpha={true} />
          </div>
        )}
      </div>
    </span>
  );
}
