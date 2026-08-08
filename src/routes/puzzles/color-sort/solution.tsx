import { createFileRoute } from '@tanstack/react-router';
import ColorSortSolution from '../../../puzzles/color-sort/ColorSortSolution';

export const Route = createFileRoute('/puzzles/color-sort/solution')({
  component: ColorSortSolution,
});
