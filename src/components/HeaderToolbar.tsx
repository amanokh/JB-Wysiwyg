import React from "react";
import {
    BasicFormattingButtonGroup,
    DataTransferButtonGroup, HeadingLevelButtonGroup,
    HistoryButtonGroup, ToggleCodeButton,
    Toolbar,
    VerticalDivider
} from "@remirror/react";

const HeaderToolbar: React.FC = () => {
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

export default HeaderToolbar;