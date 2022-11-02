// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jest-remirror adds custom jest matchers like `expect(doc1).toEqualRemirrorDocument(doc2)`.
import "jest-remirror/environment"

import fetchMock from "jest-fetch-mock";

fetchMock.mockIf(/\/dictionaries/, () => {
    return Promise.resolve({
        body: "2\nknown\ntest"
    })
})
fetchMock.enableMocks();
