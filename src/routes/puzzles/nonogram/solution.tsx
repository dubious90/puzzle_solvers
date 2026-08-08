import { createFileRoute } from '@tanstack/react-router';
import NonogramSolution from '../../../puzzles/nonogram/NonogramSolution';

export const Route = createFileRoute('/puzzles/nonogram/solution')({
  component: NonogramSolution,
});
