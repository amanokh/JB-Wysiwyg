import 'remirror/styles/all.css';
import '../styles/Editor.css'

import {SpellExtension} from '../extensions/SpellExtension';
import SuggestPopup, {SuggestPopupProps, suggestPopupDefaultProps} from "./SuggestPopup";
import HeaderToolbar from "./HeaderToolbar";

import {Remirror, EditorComponent, useRemirror} from '@remirror/react';
import {PlaceholderExtension, StrikeExtension, CodeExtension, wysiwygPreset} from "remirror/extensions";
import React, {useState} from "react";


const placeholder = 'Enter some text...'

const Editor: React.FC = () => {
    const [suggestViewProps, setSuggestViewProps] = useState<SuggestPopupProps>(suggestPopupDefaultProps)
    const suggestView = SuggestPopup(suggestViewProps)

    const {manager} = useRemirror({
        // builtin: {persistentSelectionClass: 'selection'},
        extensions: () => [
            new PlaceholderExtension({placeholder}),
            new StrikeExtension(),
            new CodeExtension(),
            new SpellExtension(setSuggestViewProps),
            ...wysiwygPreset()],
    });

    return (
        <div className="remirror-theme" spellCheck={false}>
            <Remirror manager={manager}>
                {suggestView}
                <HeaderToolbar />
                <EditorComponent />
            </Remirror>
        </div>
    );
};

export default Editor;