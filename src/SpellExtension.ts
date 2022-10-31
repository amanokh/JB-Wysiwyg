import {EditorState, extension, getChangedNodes, Transaction,} from '@remirror/core';
import {CreateExtensionPlugin, getCursor, PlainExtension} from "remirror";
import {Decoration, DecorationSet} from "prosemirror-view";
import {NodeWithPosition} from "@remirror/core-utils/dist-types/prosemirror-node-utils";
import NSpell from "nspell"
import {Schema} from "prosemirror-model";


class SpellExtensionState {
    private extension: SpellExtension;
    decorationOnCursor: Decoration | null | undefined;
    decorationSet: DecorationSet;

    constructor(extension: SpellExtension) {
        this.extension = extension;
        this.decorationSet = DecorationSet.empty;
    }

    apply(tr: Transaction, editorState: EditorState) {
        // console.log("plugin-apply");
        // console.log(tr);
/*        if (!tr.docChanged) {
            return this;
        }*/
        this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);
        const changedNodes = getChangedNodes(tr, {
            descend: true,
            predicate: (node) => node.isText
        });
        this.updateDecorationSet(tr, editorState.schema, changedNodes);
        return this;
    }

    updateDecorationSet(tr: Transaction, schema: Schema, changedNodes: NodeWithPosition[]) {
        let decorationSet = this.decorationSet;
        let decorationOnCursor = this.decorationOnCursor;
        let cursor = getCursor(tr.selection)

        if (decorationOnCursor) {
            decorationSet = decorationSet.add(tr.doc, [decorationOnCursor]);
            decorationOnCursor = null;
        }

        for (const {node, pos} of changedNodes) {
            // console.log("changed node str: ", node.textContent, pos)

            // exclude codeblocks
            if (node.marks.some((mark) => mark.type === schema.marks.code)) {
                decorationSet = decorationSet.remove(decorationSet.find(pos, pos + node.nodeSize));
                continue;
            }

            // todo: regexp for '
            const reg = /\w+/g
            let match = null;
            while ((match = reg.exec(node.textContent)) != null) {
                let word = match[0],
                    wordFrom = match.index,
                    wordTo = reg.lastIndex

                decorationSet = decorationSet.remove(decorationSet.find(pos + wordFrom, pos + wordTo));

                if (this.extension.nSpell && !this.extension.nSpell.correct(word)) {
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

const loadDictionary = async (filename: string): Promise<string> => {
    const req = await window.fetch(filename)
    return req.text()
}


@extension({})
export class SpellExtension extends PlainExtension {
    nSpell: NSpell | undefined;

    constructor() {
        super();
        Promise.all([
            loadDictionary("/index.aff"),
            loadDictionary("/index.dic")
        ]).then(
            ([affString, dicString]) => {
                this.nSpell = NSpell(affString, dicString);
                /*console.log(this.nSpell.correct("hello"))
                console.log(this.nSpell.correct('hell'))
                console.log(this.nSpell.spell('hllo'))*/
            }
        ).catch((err) => console.log("An error occurred while loading dictionaries. ", err))
        console.log("spell-constructor")
    }

    createPlugin(): CreateExtensionPlugin {
        const pluginState = new SpellExtensionState(this);

        return {
            state: {
                init(_) {
                    // check all
                    // return pluginState.init(state);
                },
                apply(tr, _, __, state) {
                    return pluginState.apply(tr, state);
                }
            },
            props: {
                handleClickOn(view, pos, node) {
                    console.log(pos)
                    console.log(node)
                },

                decorations() {
                    return pluginState.decorationSet;
                }
            }
        };

    }

    get name(): string {
        return "spell-checker";
    }
}