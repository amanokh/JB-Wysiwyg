/* eslint-disable testing-library/render-result-naming-convention */
import { renderEditor } from "jest-remirror";
import {
    CodeExtension,
    PlaceholderExtension,
    StrikeExtension,
    wysiwygPreset
} from "remirror/extensions";
import {SpellExtension} from "../extensions/SpellExtension";
import {TextSelection} from "prosemirror-state";


describe("heading", () => {
    // Render an editor with chosen extensions
    const setSuggestViewProps = jest.fn()
    const spellExtension = new SpellExtension(setSuggestViewProps)

    const editor = renderEditor([
        new PlaceholderExtension(),
        new StrikeExtension(),
        new CodeExtension(),
        spellExtension,
        ...wysiwygPreset()
    ]);

    const {
        nodes: { doc, p },
    } = editor;

    it("highlights typo errors", () => {
        // Initialize the editor with an empty paragraph
        editor.add(doc(p("")))

        // Insert word 'unknown', expect to be not checked
        editor.insertText("unknown");

        expect(editor.state.doc).toEqualRemirrorDocument(doc(p("unknown")));
        expect(editor.innerHTML).toBe("<p>unknown</p>")

        // Insert a space after the 'unknown', expect to be checked and marked
        editor.insertText(" ");
        expect(editor.state.doc).toEqualRemirrorDocument(doc(p("unknown ")));
        expect(editor.innerHTML).toBe("<p><span class=\"spell-error\">unknown</span> </p>")


        // Insert the 'known' after all, expect to be not marked
        editor.insertText("known ");

        expect(editor.state.doc).toEqualRemirrorDocument(doc(p("unknown known ")));
        expect(editor.innerHTML).toBe("<p><span class=\"spell-error\">unknown</span> known </p>")
    });

    it("removes typo error on edit", () => {
        // Initialize the editor with known and unknown word, check init highlighting
        editor.add(doc(p("unknown known unknown ")))
        expect(editor.innerHTML).toBe("<p><span class=\"spell-error\">unknown</span> known <span class=\"spell-error\">unknown</span> </p>")

        // Replace 'unknown' to 'known', expect to be unmarked
        editor.selectText(new TextSelection(editor.doc.resolve(1), editor.doc.resolve(8)))
        editor.replace("known")

        expect(editor.state.doc).toEqualRemirrorDocument(doc(p("known known unknown ")));
        expect(editor.innerHTML).toBe("<p>known known <span class=\"spell-error\">unknown</span> </p>")
    });
});
