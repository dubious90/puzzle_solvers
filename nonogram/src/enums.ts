export enum AppState {
    // The user is currently defining the puzzle parameters, setting sliders and assigning prompts.
    FORMING_PUZZLE,
    // A puzzle exists and has been solved. User can iterate through the history to see solution.
    ITERATING_HISTORY,
}

export enum RowOrColumn {
    ROW,
    COLUMN,
}