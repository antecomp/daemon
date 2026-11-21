import { DialogueContext } from "@/core/dialogue/dialogue.types";
import { BnyEmissionHandler, BnyPauseBody, BnyPauseHandler, BnyProgram, createVM } from "@bunnarray/vm";
import { createMemo, createSignal, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import MessageBox, { MessageBoxProps } from "./MessageBox";
import createTypewriter from "@/shared/hooks/createTypewriter";

import "./hermes.css";
import topb from "./assets/topb.png";
import midb from "./assets/midb.png";
import botb from "./assets/botb.png";
import ntwrk_gif from "./assets/ntwrk.gif";
import nameplateBorder from "./assets/nameplate_border.png";
import continuePanel from "./assets/continue_prompt.png"
import { MAIN_CHARACTER_NAME, MAIN_CHARACTER_VLID } from "@/config/init.config";
import sleep from "@/shared/utils/sleep";
import { createDialogueSignalHandler, createDialogueYieldHandler } from "@/core/dialogue/handlers";

// Reply beat for CAR after a player selects an option.
// [option select] -> send option message -> (wait CAR_DELAY_MS) -> send reply message.
const CAR_DELAY_MS = 1200;
const OPTION_BACKGROUNDS = [topb, midb, botb];
const OPTIONS_PER_PAGE = OPTION_BACKGROUNDS.length;

function parseOptionText(raw: string): { summary: string; full: string } {
    const [summary, full = summary] = raw.split('\\', 2).map((part) => part.trim());
    return { summary, full };
}

/** A choice shown to the player. */
type DialogueOption = {
    /** Short label shown on the choice. */
    summary: string,
    /** Text previewed on hover and sent for ordinary choices. */
    full: string,
    /** Select this choice. */
    select: () => void;
}

/** Dialogue display used by `startDialogue`; for a temporary camera view, use `createDialogueWithCamOvr(...).start()`. */
export default function Hermes(
    // Destructure out of laziness. All of this should be static anyways.
    { program, ctx, onClose: close }:
        {
            program: BnyProgram,
            ctx?: DialogueContext,
            onClose: VoidFunction,
        }
) {
    const [overlay, setOverlay] = createSignal(ctx?.initialOverlay);
    const [messages, setMessages] = createSignal<MessageBoxProps[]>([]);
    const addMessage = ({ name, text }: { name: string | null; text: string }) =>
        setMessages((prev) => [...prev, { name, text }]);

    const [options, setOptions] = createSignal<DialogueOption[]>([]);
    const [optionsPage, setOptionsPage] = createSignal(0);
    const optionPages = createMemo(() =>
        Array.from({ length: Math.ceil(options().length / OPTIONS_PER_PAGE) }, (_, index) => index)
    );
    const visibleOptions = createMemo(() => {
        const offset = optionsPage() * OPTIONS_PER_PAGE;
        return options().slice(offset, offset + OPTIONS_PER_PAGE);
    });

    const [pendingNext, setPendingNext] = createSignal<BnyPauseBody<'next'> | null>(null);
    function advance() {
        const pause = pendingNext();
        if (stopped || !pause) return;
        setPendingNext(null);
        pause.resume();
    }

    // Whether or not we show the [END] option first.
    let shouldAutomaticallyClose = false;

    // Automatically normal dialogue advance after yield ("wait for" functionality)
    let advanceAfterYield = false;

    // Prevent continuation after unmmount
    let stopped = false;
    onCleanup(() => { stopped = true });

    // Preview message for hovered option.
    const [hoveredOption, setHoveredOption] = createSignal("");
    const { displayText: optionPreviewText } = createTypewriter(hoveredOption);

    async function selectOption(
        pause: BnyPauseBody<'select'>,
        index: number,
        full: string,
        noCar: boolean
    ) {
        if (stopped) return;

        setOptions([]);
        setHoveredOption('');
        setOptionsPage(0)

        shouldAutomaticallyClose = noCar;

        if (!noCar) {
            addMessage({ name: MAIN_CHARACTER_NAME, text: full });
            await sleep(CAR_DELAY_MS);
        }

        if (!stopped) pause.resume(index);
    }

    function showOptions(pause: BnyPauseBody<'select'>) {
        setOptionsPage(0);
        shouldAutomaticallyClose = false;

        setOptions(pause.options.map((option, index) => {
            const noCar = option.text.startsWith('^');
            const rawOptionText = noCar ? option.text.slice(1) : option.text;
            const { summary, full } = parseOptionText(rawOptionText);

            return {
                summary, full,
                select: () => selectOption(pause, index, full, noCar)
            }
        }))
    }

    // todo: I should probably have better names here lol.
    const yieldHandler = createDialogueYieldHandler(ctx?.yieldHandlers);
    async function handleYield(pause: BnyPauseBody<'yield'>) {
        const res = await yieldHandler(pause.identifier, pause.value, runtime);

        if (stopped) return;

        advanceAfterYield = res?.advance === true;
        pause.resume();
    }

    const handleSignal = createDialogueSignalHandler(ctx?.signalHandlers)

    const onEmission: BnyEmissionHandler = (emission) => {
        if (stopped) return;
        switch (emission.kind) {
            case 'say':
                const speaker = emission.speaker
                shouldAutomaticallyClose = false;
                addMessage({ 
                    name: speaker === null
                        ? null
                        : ctx?.speakerNames?.[speaker] ?? speaker, 
                    text: emission.text 
                });
                return;
            case 'memory':
                ctx?.onMemoryUpdate?.(emission);
                return;
            case 'signal':
                handleSignal(emission.identifier, emission.value, runtime);
        }
    }

    const onPause: BnyPauseHandler = (pause) => {
        if (stopped) return;
        switch (pause.kind) {
            case 'select':
                showOptions(pause);
                return;
            case 'next':
                if (advanceAfterYield) {
                    advanceAfterYield = false;
                    pause.resume();
                    return;
                }

                setPendingNext(pause);
                return;
            case 'yield':
                handleYield(pause);
                return;
            case 'end':
                if (shouldAutomaticallyClose) {
                    close();
                } else {
                    setOptions([
                        { summary: "[END]", full: "", select: close }
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

    const runtime = { memory: vm.memory, setOverlay };

    onMount(vm.start);

    return (
        <>
            <Show when={overlay()}>
                <div
                    id='dialogue-overlay'
                    class='fademein'
                    style={{ background: `url(${overlay()})` }}
                />
            </Show>
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
                        OPTION_BACKGROUNDS.map((background, index) => {
                            const option = () => visibleOptions()[index];
                            return (
                                <div
                                    class="hermes-resp-container"
                                    classList={{ inactive: !option() }}
                                    onClick={() => option()?.select()}
                                    onMouseOver={() => {
                                        const hovered = option();
                                        if (hovered) setHoveredOption(hovered.full);
                                    }}
                                >
                                    <p>{option()?.summary}</p>
                                    <span />
                                    <img src={background} />
                                </div>
                            );
                        })
                    }>
                        <Match when={pendingNext()}>
                            <img
                                src={continuePanel}
                                class='hermes-next-prompt'
                                onClick={advance}
                            />
                        </Match>
                    </Switch>
                </div>

                <div class="hermes-footer">
                    <span>S-VLID:{MAIN_CHARACTER_VLID}</span>
                    <span>R-VLID:0000:0000</span>
                    <img src={ntwrk_gif} />
                </div>

                <Show when={optionPages().length > 1}>
                    <div classList={{
                        "hermes-pages": true,
                        "hp-first": optionsPage() === 0,
                        "hp-last": optionsPage() === optionPages().length - 1
                    }}>
                        <For each={optionPages()}>{(page) => (
                            <a
                                class="hermes-page-opt"
                                classList={{ "hpo-active": optionsPage() === page }}
                                onClick={() => setOptionsPage(page)}
                            />
                        )}</For>
                    </div>
                </Show>

            </div>
        </>
    )

}
