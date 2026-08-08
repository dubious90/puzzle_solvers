import { createFileRoute } from '@tanstack/react-router';
import NonogramBuilder from '../../../puzzles/nonogram/NonogramBuilder';

export const Route = createFileRoute('/puzzles/nonogram/')({
  component: NonogramBuilder,
});
