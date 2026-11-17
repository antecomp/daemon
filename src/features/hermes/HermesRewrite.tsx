import { DialogueContext, DialogueOption } from "@/core/dialogue/dialogue.types";
import { BnyEmissionHandler, BnyPauseBody, BnyPauseHandler, BnyProgram, createVM } from "@bunnarray/vm";
import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
import MessageBox, { MessageBoxProps } from "./MessageBox";
import createTypewriter from "@/shared/hooks/createTypewriter";
import { DialogueService } from "@/core/dialogue/dialogueService";

import "./hermes.css";
import topb from "./assets/topb.png";
import midb from "./assets/midb.png";
import botb from "./assets/botb.png";
import ntwrk_gif from "./assets/ntwrk.gif";
import nameplateBorder from "./assets/nameplate_border.png";
import continuePanel from "./assets/continue_prompt.png"
import { MAIN_CHARACTER_VLID } from "@/config/init.config";

export default function Hermes(
    // Destructure out of laziness. All of this should be static anyways.
    { program, ctx }: { program: BnyProgram, ctx?: DialogueContext }
) {
    const [messages, setMessages] = createSignal<MessageBoxProps[]>([]);
    const addMessage = ({ name, text }: { name: string | null; text: string }) => setMessages((prev) => [...prev, { name, text }]);

    const [options, setOptions] = createSignal<DialogueOption[]>([]);
    const [optionsPage, setOptionsPage] = createSignal(0);
    const optionsOffset = () => optionsPage() * 3;
    const numPages = () => Math.ceil(options().length / 3);

    const [advance, setAdvance] = createSignal<VoidFunction | null>(null);

    // Whether or not we show the [END] option first.
    let shouldAutomaticallyClose = false;

    // Helper function to generate pagination for options (little thingy on the side.)
    const generatePages = () =>
        Array.from({ length: numPages() }, (_, i) => (
            <a
                class={`hermes-page-opt ${optionsPage() === i ? 'hpo-active' : ''}`}
                onClick={() => setOptionsPage(i)}
            ></a>
        ));

    // Preview message for hovered option.
    const [hoveredOption, setHoveredOption] = createSignal("");
    const { displayText: optionPreviewText } = createTypewriter(hoveredOption);

    function showOptions(pause: BnyPauseBody<'select'>) {
        setOptionsPage(0);
        setOptions(pause.options.map((option, index) => {
            return {
                // split into summary/full and handle (non)car custom syntax here...
                summary: option.text,
                full: option.text,
                select: () => {
                    setOptions([]);
                    setHoveredOption('');
                    setOptionsPage(0);
                    // handle (non) CAR handling here...
                    // If we have an option and then immediately hit end, that option 
                    // should be seen as a termination option (f.e a "goodbye! [END]")
                    shouldAutomaticallyClose = true;
                    pause.resume(index)
                }
            }
        }))
    }

    const onEmission: BnyEmissionHandler = (emission) => {
        shouldAutomaticallyClose = false;
        switch (emission.kind) {
            case 'say':
                addMessage({ name: emission.speaker, text: emission.text });
                return;
            case 'memory':
                ctx?.onMemoryUpdate?.(emission);
                return;
            case 'signal':
                ctx?.onSignal?.(emission.identifier, emission.value);
        }
    }

    const onPause: BnyPauseHandler = (pause) => {
        switch (pause.kind) {
            case 'select':
                showOptions(pause);
                return;
            case 'next':
                // yeah you have to do this because otherwise it thinks it's a setter CB.
                // TODO: consider changing the advance shape to avoid this.
                setAdvance(() => () => {
                    setAdvance(null);
                    pause.resume();
                });
                return;
            case 'yield':
                ctx?.onYield
                    ? ctx.onYield(pause.identifier, pause.value).then(pause.resume)
                    : pause.resume();
                return;
            case 'end':
                if (shouldAutomaticallyClose) {
                    DialogueService.endDialogue();
                } else {
                    setOptions([
                        { summary: "[END]", full: "", select: DialogueService.endDialogue }
                    ])
                }
                return;
            case 'error':
                throw pause.error;
        }
    }

    const vm = createVM(program, {
        memory: ctx?.initialMemory,
        onEmission, onPause
    });

    onMount(vm.start);

    return (
        <div class='hermes-container'>
            <div class='messages-container'>
                <div class='message-spacer-nightmare' />
                <For each={messages()}>{(message) => <MessageBox {...message} />}</For>
            </div>
            <div class='sender-container'>
                <div class='text-preview'>
                    <img src={nameplateBorder} />
                    <span class='name'>Arda</span>
                    {optionPreviewText()}
                </div>

                <Switch fallback={
                    [0, 1, 2].map((index) => {
                        const option = options()[optionsOffset() + index];
                        return (
                            <div
                                class={"hermes-resp-container " + (option ? "" : "inactive")}
                                onClick={() => option && option.select()}
                                onMouseOver={() => option && setHoveredOption(option.full)}
                            >
                                <p>{option?.summary}</p>
                                <span />
                                <img src={[topb, midb, botb][index]} />
                            </div>
                        );
                    })
                }>
                    <Match when={advance()}>
                        <img
                            src={continuePanel}
                            class='hermes-next-prompt'
                            onClick={advance()!}
                        />
                    </Match>
                </Switch>
            </div>

            <div class="hermes-footer">
                <span>S-VLID:{MAIN_CHARACTER_VLID}</span>
                <span>R-VLID:0000:0000</span>
                <img src={ntwrk_gif} />
            </div>

            <Show when={options().length > 3}>
                <div classList={{
                    "hermes-pages": true,
                    "hp-first": (optionsPage() == 0),
                    "hp-last": (optionsPage() == numPages() - 1)
                }}>
                    {generatePages()}
                </div>
            </Show>

        </div>
    )

}