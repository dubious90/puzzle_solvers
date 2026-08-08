import React, { ReactElement } from 'react';
import { IColor } from 'react-color-palette';

interface PipeProps {
  index: number;
  colorIds: Array<number>;
  allColors: Array<IColor>;
  onClick?: (pipeIndex: number, colorIndex: number) => void;
}

export default function Pipe({ colorIds, allColors, index, onClick }: PipeProps) {
  const fills: Array<ReactElement> = [];
  for (let i = 0; i < colorIds.length; i++) {
    const fillOffset = 50 * (i + 4 - colorIds.length) + 25;
    const key = 'pipe' + index + 'color' + i;
    const color = allColors[colorIds[i]];
    if (!color) {
      console.log('Missing color on pipe ' + index, i, colorIds, allColors, index);
    } else {
      fills.push(
        <rect key={key} fill={color.hex} width="48" height="50" y={fillOffset} x={1}
          onClick={onClick ? () => onClick(index, i) : undefined} />
      );
    }
  }
  return (
    <svg display="block" width="75px" height="250px">
      <g>
        <rect fill='#FFFFFF' stroke="#000000" width="50" height="225" strokeWidth="1px" />
      </g>
      <g>{fills}</g>
    </svg>
  );
}
