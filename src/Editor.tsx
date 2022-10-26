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
    Remirror, EditorComponent, useRemirror
} from '@remirror/react';
import {
    PlaceholderExtension,
    StrikeExtension,
    CodeBlockExtension,
    CodeExtension,
    wysiwygPreset
} from "remirror/extensions";
import React from "react";

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


const Editor: React.FC = () => {
    const {manager} = useRemirror({
        builtin: {persistentSelectionClass: 'selection'},
        extensions: () => [
            new PlaceholderExtension({placeholder}),
            new StrikeExtension(),
            new CodeExtension(),
            new CodeBlockExtension(),
            ...wysiwygPreset()],
    });
    return (
        <div className="remirror-theme">
            <Remirror manager={manager}>
                <MyToolbar/>
                <EditorComponent/>
            </Remirror>
        </div>
    );
};

export default Editor;