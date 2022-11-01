import React from "react";

export interface SuggestPopupProps {
    x: number,
    y: number,
    word: string,
    suggestionsArray: string[],
    doCorrectionCallback?: (word: string) => void
    addToDictCallback?: (word: string) => void
}

export const suggestPopupDefaultProps: SuggestPopupProps =  {
    x: -9999,
    y: -9999,
    word: '',
    suggestionsArray: []
}

const SuggestPopup = ({x, y, word, suggestionsArray, doCorrectionCallback, addToDictCallback}: SuggestPopupProps) => {
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

export default SuggestPopup