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
    ToggleCodeBlockButton,
    Remirror, EditorComponent, useRemirror, useEditorState
} from '@remirror/react';
import {
    PlaceholderExtension,
    StrikeExtension,
    CodeBlockExtension,
    CodeExtension,
    wysiwygPreset
} from "remirror/extensions";
import React from "react";
import { SpellExtension } from './SpellExtension';

const placeholder = 'Enter some text...'


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
                <ToggleCodeBlockButton/>
                <VerticalDivider/>
                <HeadingLevelButtonGroup/>
            </Toolbar>
        </div>
    )
}

const Logger: React.FC = () => {
    const {doc} = useEditorState();

    return (
        <p>{doc.toString()}</p>
    );
}

const SuggestView: React.FC = () => {
    const array = ['lol', 'test', 'kek']
    return (
        <div className="suggest-view">
            {array.map((value) => (
                <span key={value} className="suggest-view-variant">{value}</span>
            ))}
            <span className="suggest-view-variant ignore">Ignore</span>
        </div>
    )
};


const Editor: React.FC = () => {
    const {manager} = useRemirror({
        // builtin: {persistentSelectionClass: 'selection'},
        extensions: () => [
            new PlaceholderExtension({placeholder}),
            new StrikeExtension(),
            new CodeExtension(),
            new CodeBlockExtension(),
            new SpellExtension(),
            ...wysiwygPreset()],
    });

    return (
        <div className="remirror-theme" spellCheck={false}>
            <Remirror manager={manager}>
                {/*<SuggestView/>*/}
                {/*<Logger/>*/}
                <MyToolbar/>
                <EditorComponent/>
            </Remirror>
        </div>
    );
};

export {Editor, SuggestView};