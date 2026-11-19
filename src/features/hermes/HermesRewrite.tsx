import { DialogueContext, DialogueOption } from "@/core/dialogue/dialogue.types";
import { BnyEmissionHandler, BnyPauseBody, BnyPauseHandler, BnyProgram, createVM } from "@bunnarray/vm";
import { createSignal, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";
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
import sleep from "@/shared/utils/sleep";

// Reply beat for CAR after a player selects an option.
// [option select] -> send option message -> (wait CAR_DELAY_MS) -> send reply message.
const CAR_DELAY_MS = 1200;

function parseOptionText(raw: string): {summary: string; full: string} {
    const [summary, full = summary] = raw.split('\\', 2).map((part) => part.trim());
    return { summary, full };
}

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

    // resume CB for normal next pauses. Existence implies in that pause state.
    const [advance, setAdvance] = createSignal<VoidFunction | null>(null);

    // Whether or not we show the [END] option first.
    let shouldAutomaticallyClose = false;

    // Prevent continuation after unmmount
    let stopped = false;
    onCleanup(() => { stopped = true });

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
        shouldAutomaticallyClose = false;

        setOptions(pause.options.map((option, index) => {
            const noCar = option.text.startsWith('^');
            const rawOptionText = noCar ? option.text.slice(1) : option.text;
            const {summary, full} = parseOptionText(rawOptionText);

            return {
                summary, full,
                select: () => {
                    setOptions([]);
                    setHoveredOption('');
                    setOptionsPage(0);
                    if (noCar) {
                        // If we have an option and then immediately hit end, that option 
                        // should be seen as a termination option (f.e a "goodbye! [END]")
                        // sensibly this should only apply to non-car things too.
                        shouldAutomaticallyClose = true;
                        pause.resume(index)
                    } else {
                        addMessage({ name: 'Arda', text: full });
                        sleep(CAR_DELAY_MS).then(() => {
                            if (stopped) return;
                            pause.resume(index)
                        })
                    }
                }
            }
        }))
    }

    const onEmission: BnyEmissionHandler = (emission) => {
        if (stopped) return;
        switch (emission.kind) {
            case 'say':
                shouldAutomaticallyClose = false;
                addMessage({ name: emission.speaker, text: emission.text });
                return;
            case 'memory':
                ctx?.onMemoryUpdate?.(emission);
                return;
            case 'signal':
                ctx?.onSignal?.(emission.identifier, emission.value, { memory: vm.memory });
        }
    }

    const onPause: BnyPauseHandler = (pause) => {
        if (stopped) return;
        switch (pause.kind) {
            case 'select':
                showOptions(pause);
                return;
            case 'next':
                // yeah you have to do this because otherwise it thinks it's a setter CB.
                setAdvance(() => () => {
                    setAdvance(null);
                    pause.resume();
                });
                return;
            case 'yield':
                ctx?.onYield
                    ? ctx.onYield(pause.identifier, pause.value, { memory: vm.memory })
                        .then(() => stopped || pause.resume())
                        // todo: add a catch here with clean handling.
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
                // todo: handle this better, add recovery.
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