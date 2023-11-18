import React, { ReactElement, useState } from 'react';
import { TableCell } from '@mui/material';

import { AppState, RowOrColumn } from './enums';

interface PromptInputProps {
    // appState: AppState,
    gridSize: number,
    onChange: (prompt: number[]) => void,
    value: number[],
    promptType: RowOrColumn,
    // If an error is added or removed, call this function.
    handleErrorChange: (inErrorState: boolean) => void,
    reactKey: string,
}

export default function PromptInput({ gridSize, onChange, value, promptType, handleErrorChange, reactKey }: PromptInputProps) {
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    let sx: any = { padding: "2px", maxWidth: "100px" };

    if (error.length > 0) {
        sx.border = "3px solid red";
    }

    const align = promptType === RowOrColumn.ROW ? "right" : "center";

    function handleChange(newText: string) {
        let newError = "";
        const validRegex = /^[0-9]+(,[0-9])*$/;
        if (!validRegex.test(newText)) {
            newError = "Each prompt must be a comma-delimited string of numbers";
        }
        else {
            const promptTexts = newText.split(",");
            let newValue: number[] = [];
            let sum = 0;
            promptTexts.forEach((prompt) => {
                const num = parseInt(prompt);
                if (num === undefined) {
                    console.log("This shouldn't happen");
                    newError = "Each prompt must be a comma-delimited string of numbers";
                }
                sum = sum + num;
                newValue.push(num);
            });

            if (sum > gridSize) {
                newError = "Prompt adds up to " + sum + " which is longer than the grid allows.";
            }
            else {
                if (newError.length === 0) {
                    onChange(newValue);
                    setEditing(false);
                }
            }
        }
        setError(newError);
        handleErrorChange(error.length > 0);
    }

    if (!value || value.length === 0) value = [0];

    const textValue = value.join(",");

    let titleText = error.length > 0 ? error : "";

    if (editing) {
        return (
            <TableCell key={reactKey} title={titleText} align={align} sx={sx}>
                <input
                    autoFocus
                    className="promptInput"
                    type="text"
                    onBlur={(e) => { handleChange(e.target.value) }}
                    defaultValue={textValue}
                    onKeyUp={(e) => { if (e.key === "Enter") handleChange((e.target as HTMLInputElement).value) }}
                    key={reactKey + "_input"}
                />
            </TableCell>
        );
    }
    else {
        return (
            <TableCell key={reactKey} title={titleText} align={align} sx={sx} onClick={() => { setEditing(true) }}>
                <span key={reactKey + "_span"}>
                    {textValue}
                </span>
            </TableCell >
        );
    }
}