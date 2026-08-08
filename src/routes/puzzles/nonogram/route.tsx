import { createFileRoute, Outlet } from '@tanstack/react-router';
import { NonogramProvider } from '../../../puzzles/nonogram/NonogramContext';

export const Route = createFileRoute('/puzzles/nonogram')({
  component: () => (
    <NonogramProvider>
      <Outlet />
    </NonogramProvider>
  ),
});
