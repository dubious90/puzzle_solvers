# Puzzle Solvers

A collection of browser-based puzzle solvers built with React, TypeScript, and Vite.

## Puzzles

- **Color Sort** (`/puzzles/color-sort`) — Solves "water sort" style color-sorting tube puzzles via BFS.
- **Nonogram** (`/puzzles/nonogram`) — Solves nonogram (picross) puzzles using constraint propagation.

## Getting Started

```bash
cd app
npm install
npm start
```

This starts the Vite dev server at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm test` | Run all tests with Vitest |

## Tech Stack

- React 19
- TypeScript 7
- Vite 8 (Rolldown)
- TanStack Router (file-based routing)
- MUI 9
- Vitest 4
