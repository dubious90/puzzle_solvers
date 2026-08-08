import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ColorSortProvider } from '../../../puzzles/color-sort/ColorSortContext';

export const Route = createFileRoute('/puzzles/color-sort')({
  component: () => (
    <ColorSortProvider>
      <Outlet />
    </ColorSortProvider>
  ),
});
