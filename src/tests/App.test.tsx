import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';
import SuggestPopup, {suggestPopupDefaultProps} from "../components/SuggestPopup";

test('renders App', () => {
    render(<App />);
});

test('renders SuggestPopup', () => {
    const suggester = SuggestPopup(suggestPopupDefaultProps)
    render(suggester);
});
