import {SuggestPopupProps, suggestPopupDefaultProps} from '../components/SuggestPopup';
import {SpellExtensionState} from "./SpellExtensionState";

import {extension} from '@remirror/core';
import {CreateExtensionPlugin, PlainExtension} from "remirror";
import {NodeWithPosition} from "@remirror/core-utils/dist-types/prosemirror-node-utils";
import {TextSelection} from "prosemirror-state";


@extension({})
export class SpellExtension extends PlainExtension {
    setSuggests: (props: SuggestPopupProps) => void;

    constructor(setSuggests: (props: SuggestPopupProps) => void) {
        super();
        this.setSuggests = setSuggests;
    }

    createPlugin(): CreateExtensionPlugin {
        const pluginState = new SpellExtensionState(this);
        pluginState.init()

        const setSuggests = this.setSuggests
        const clearSuggests = () => setSuggests(suggestPopupDefaultProps)

        return {
            state: {
                init(_) {},
                apply(tr, _, __, state) {
                    // get the new pluginState for decorations
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
                    // pass and update all decorations
                    return pluginState.decorationSet;
                }
            }
        };
    }

    get name(): string {
        return "spell-checker";
    }
}