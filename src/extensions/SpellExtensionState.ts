import NSpell from "nspell";
import {Decoration, DecorationSet} from "prosemirror-view";
import {EditorState, getChangedNodes, Transaction} from "@remirror/core";
import {Schema} from "prosemirror-model";
import {NodeWithPosition} from "@remirror/core-utils/dist-types/prosemirror-node-utils";
import {getCursor} from "remirror";
import {SpellExtension} from "./SpellExtension";

const loadDictionary = async (filename: string): Promise<string> => {
    const req = await window.fetch(filename)
    return req.text()
}

export class SpellExtensionState {
    private extension: SpellExtension;

    nSpell: NSpell | undefined;
    decorationOnCursor: Decoration | null | undefined;
    decorationSet: DecorationSet;

    constructor(extension: SpellExtension) {
        this.extension = extension;
        this.decorationSet = DecorationSet.empty;
    }

    init() {
        // initialize nSpell library
        Promise.all([
            loadDictionary("/dictionaries/index.aff"),
            loadDictionary("/dictionaries/index.dic")
        ]).then(
            ([affString, dicString]) => {
                this.nSpell = NSpell(affString, dicString);
                console.log("nSpell dictionaries loaded")
            }
        ).catch((err) => console.log("An error occurred while loading dictionaries. ", err))
    }

    apply(tr: Transaction, editorState: EditorState) {
        // do the all work on document state update
        this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);
        const changedNodes = getChangedNodes(tr, {
            descend: true,
            predicate: (node) => node.isText
        });
        this.updateDecorationSet(tr, editorState.schema, changedNodes);
        return this;
    }

    updateDecorationSet(tr: Transaction, schema: Schema, nodesToCheck: NodeWithPosition[]) {
        let decorationSet = this.decorationSet;
        let decorationOnCursor = this.decorationOnCursor;
        let cursor = getCursor(tr.selection)

        if (decorationOnCursor) {
            decorationSet = decorationSet.add(tr.doc, [decorationOnCursor]);
            decorationOnCursor = null;
        }

        for (const {node, pos} of nodesToCheck) {
            // exclude codeblocks
            if (node.marks.some((mark) => mark.type === schema.marks.code)) {
                decorationSet = decorationSet.remove(decorationSet.find(pos, pos + node.nodeSize));
                continue;
            }

            const reg = /[a-zA-Z0-9_']+/g
            let match = null;
            while ((match = reg.exec(node.textContent)) != null) {
                let word = match[0],
                    wordFrom = match.index,
                    wordTo = reg.lastIndex

                decorationSet = decorationSet.remove(decorationSet.find(pos + wordFrom, pos + wordTo));

                if (this.nSpell && !this.nSpell.correct(word)) {
                    const deco = Decoration.inline(pos + wordFrom, pos + wordTo, {
                        class: 'spell-error'
                    });

                    // except decorating words on the current cursor
                    if (cursor && cursor.pos === pos + wordTo) {
                        decorationOnCursor = deco;
                    } else {
                        decorationSet = decorationSet.add(tr.doc, [deco])
                    }
                }
            }
        }

        this.decorationSet = decorationSet;
        this.decorationOnCursor = decorationOnCursor;
    }
}