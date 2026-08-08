import React, { useState } from 'react';
import { TableCell } from '@mui/material';

import { AppState, RowOrColumn } from './enums';

interface PromptInputProps {
    // The intent of the app in this moment. Affects editability of the prompt inputs.
    appState: AppState,
    // Called whenever the prompt is modified to store the value.
    onChange: (prompt: number[]) => void,
    // The current value of the prompt. Defaults to [0].
    value: number[],
    // Whether this prompt is for a row or column (affects presentation).
    promptType: RowOrColumn,
    // If the current prompt is invalid, this is the relevant error message. Empty if valid.
    promptError: string,
    // Used to uniquely identify this element and all of its children for React rendering.
    reactKey: string,
}

/**
 * A small input for enabling user to enter prompts for a nonogram table.
 * 
 * A prompt is an array of numbers that define how the grid can be completed correctly. If the grid
 * is 10x10, then a prompt of 10 means that every square in the grid is marked as YES. A prompt of
 * 0 would mean none of them are.
 * 
 * A prompt can be multiple numbers. 3,4 would mean that there is a sequence of 3 YES blocks
 * followed by a different sequence of 4 yes blocks, with 3 NO blocks scattered before, between,
 * and after the YES blocks. A block of 7 is not allowed for 3,4 as there must be at least one NO
 * space between the YES blocks.
 */
export default function PromptInput({ appState, onChange, value, promptType, promptError, reactKey }: PromptInputProps) {
    // When editing, we show an input that the user can change.
    const [editing, setEditing] = useState(false);

    let sx: any = {
        padding: "2px",
        maxWidth: "100px",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
    };
    if (promptError.length > 0) {
        sx.border = "3px solid red";
    }

    const align = promptType === RowOrColumn.ROW ? "right" : "center";

    function handleChange(newText: string) {
        let newValue: number[] = [];
        const validRegex = /^[0-9]+(,[0-9])*$/;
        if (!validRegex.test(newText)) {
            alert("Each prompt must be a comma-delimited string of numbers. Please re-enter.");
        }
        else {
            const promptTexts = newText.split(",");
            promptTexts.forEach((prompt) => {
                const num = parseInt(prompt);
                if (num === undefined) {
                    console.log("Supposedly impossible scenario encountered -- prompt didn't parse as number.");
                }
                newValue.push(num);
            });
        }

        onChange(newValue);
        setEditing(false);
    }

    if (!value || value.length === 0) value = [0];
    const textValue = value.join(",");
    let titleText = promptError.length > 0 ? promptError : "";

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
                    style={{
                        textAlign: "center",
                        position: "relative",
                        width: "80px",
                        marginLeft: "-50vw",
                        marginRight: "-50vw",
                    }}
                />
            </TableCell>
        );
    }
    else {
        return (
            <TableCell key={reactKey} title={titleText} align={align} sx={sx} onClick={() => { if (appState === AppState.FORMING_PUZZLE) setEditing(true) }}>
                <span key={reactKey + "_span"}>
                    {textValue}
                </span>
            </TableCell >
        );
    }
}