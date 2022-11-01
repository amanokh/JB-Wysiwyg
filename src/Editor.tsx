import 'remirror/styles/all.css';
import './Editor.css'

import {
    BasicFormattingButtonGroup,
    DataTransferButtonGroup,
    HeadingLevelButtonGroup,
    HistoryButtonGroup,
    Toolbar,
    VerticalDivider,
    ToggleCodeButton,
    Remirror, EditorComponent, useRemirror
} from '@remirror/react';
import {
    PlaceholderExtension,
    StrikeExtension,
    CodeExtension,
    wysiwygPreset
} from "remirror/extensions";
import React, { useState } from "react";
import { SpellExtension } from './SpellExtension';

const placeholder = 'Enter some text...'

export interface SuggestViewProps {
    x: number,
    y: number,
    word: string,
    suggestionsArray: string[],
    doCorrectionCallback?: (word: string) => void
    addToDictCallback?: (word: string) => void
}

const SuggestView = ({x, y, word, suggestionsArray, doCorrectionCallback, addToDictCallback}: SuggestViewProps) => {
    return (
        <div className="suggest-view"
             style={{
                 left: x,
                 top: y,
             }}>
            {suggestionsArray.map((value) => (
                <span key={value} onClick={() => doCorrectionCallback && doCorrectionCallback(value)} className="suggest-view-variant">{value}</span>
            ))}
            <span onClick={() => addToDictCallback && addToDictCallback(word)} className="suggest-view-variant ignore">Add to dictionary</span>
        </div>
    )
};

const MyToolbar: React.FC = () => {
    return (
        <div className="toolbar-wrapper">
            <Toolbar>
                <HistoryButtonGroup/>
                <VerticalDivider/>
                <DataTransferButtonGroup/>
                <VerticalDivider/>
                <BasicFormattingButtonGroup/>
                <ToggleCodeButton/>
                <VerticalDivider/>
                <HeadingLevelButtonGroup/>
            </Toolbar>
        </div>
    )
}


const Editor: React.FC = () => {
    const [suggestViewProps, setSuggestViewProps] = useState<SuggestViewProps>({
        word: "",
        suggestionsArray: [],
        x: -99999,
        y: -99999
    })

    const {manager} = useRemirror({
        // builtin: {persistentSelectionClass: 'selection'},
        extensions: () => [
            new PlaceholderExtension({placeholder}),
            new StrikeExtension(),
            new CodeExtension(),
            new SpellExtension(setSuggestViewProps),
            ...wysiwygPreset()],
    });

    const suggestView = SuggestView(suggestViewProps)

    return (
        <div className="remirror-theme" spellCheck={false}>
            <Remirror manager={manager}>
                {suggestView}
                <MyToolbar/>
                <EditorComponent />
            </Remirror>
        </div>
    );
};

export {Editor, SuggestView};