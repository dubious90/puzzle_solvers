import { createFileRoute } from '@tanstack/react-router';
import NonogramApp from '../../../puzzles/nonogram/NonogramApp';

export const Route = createFileRoute('/puzzles/nonogram')({
  component: NonogramApp,
});
