import { createFileRoute } from '@tanstack/react-router';
import ColorSortApp from '../../../puzzles/color-sort/ColorSortApp';

export const Route = createFileRoute('/puzzles/color-sort')({
  component: ColorSortApp,
});
