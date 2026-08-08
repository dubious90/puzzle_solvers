import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ColorSortBuilder from '../../../puzzles/color-sort/ColorSortBuilder';

export const Route = createFileRoute('/puzzles/color-sort/')({
  component: ColorSortBuilder,
});
