import {EditorState, extension, getChangedNodes, Transaction} from '@remirror/core';
import {CreateExtensionPlugin, getCursor, PlainExtension} from "remirror";
import {Decoration, DecorationSet} from "prosemirror-view";
import {NodeWithPosition} from "@remirror/core-utils/dist-types/prosemirror-node-utils";
import NSpell from "nspell"
import {Schema} from "prosemirror-model";
import { TextSelection} from "prosemirror-state";
import { SuggestViewProps } from './Editor';


const loadDictionary = async (filename: string): Promise<string> => {
    const req = await window.fetch(filename)
    return req.text()
}

class SpellExtensionState {
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
            loadDictionary("/index.aff"),
            loadDictionary("/index.dic")
        ]).then(
            ([affString, dicString]) => {
                this.nSpell = NSpell(affString, dicString);
                console.log("nspell loaded")
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


@extension({})
export class SpellExtension extends PlainExtension {
    setSuggests: (props: SuggestViewProps) => void;

    constructor(setSuggests: (props: SuggestViewProps) => void) {
        super();
        this.setSuggests = setSuggests;
        console.log("spell-constructor")
    }

    createPlugin(): CreateExtensionPlugin {
        const pluginState = new SpellExtensionState(this);
        const setSuggests = this.setSuggests
        const clearSuggests = () => setSuggests({
            x: -9999,
            y: -9999,
            word: "",
            suggestionsArray: []
        })

        return {
            state: {
                init(_) {
                    return pluginState.init();
                },
                apply(tr, _, __, state) {
                    return pluginState.apply(tr, state);
                }
            },
            props: {
                // handle click on the highlighted (`decorated`) word and open suggest window
                handleClickOn(view, pos, node, _, event) {
                    event.preventDefault()
                    const deco = pluginState.decorationSet.find(pos, pos)[0]
                    if (!deco) {
                        clearSuggests()
                        return
                    }
                    const decoStart = deco.from
                    const decoEnd = deco.to
                    const word = view.state.doc.textBetween(decoStart, decoEnd)

                    // correction function callback
                    const doCorrection = (word: string) => {
                        let tr = view.state.tr.insertText(word, decoStart, decoEnd)
                        const newPos = tr.doc.resolve(tr.mapping.map(decoStart + word.length))
                        tr = tr.setSelection(new TextSelection(newPos, newPos))
                        clearSuggests();
                        view.dispatch(tr);
                        view.focus();
                    }

                    // addToDictionary function callback
                    const addToDictionary = (word: string) => {
                        pluginState.nSpell?.add(word)

                        // update whole document
                        const nodes: NodeWithPosition[] = []
                        const s = view.state
                        s.doc.nodesBetween(0, s.doc.content.size, (node, pos) => {
                            nodes.push({node, pos})
                            return true
                        })
                        pluginState.updateDecorationSet(s.tr, s.schema, nodes)

                        doCorrection(word)
                        clearSuggests();
                    }

                    // get suggestions and pass them to SuggestView
                    setSuggests({
                        x: view.coordsAtPos(decoStart).left,
                        y: view.coordsAtPos(pos).bottom,
                        word: word,
                        suggestionsArray: (word.length < 32 ? (pluginState.nSpell?.suggest(word) ?? []) : []).slice(0, 5),
                        doCorrectionCallback: doCorrection,
                        addToDictCallback: addToDictionary,
                    })
                },

                handleKeyPress(){
                    clearSuggests()
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