import { DialogueContext } from "@/core/dialogue/dialogue.types";
import { createDialogueSignalHandler, createDialogueYieldHandler } from "./dialogueHandlers";
import { MAIN_CHARACTER_NAME } from "@/config/init.config";
import sleep from "@/shared/utils/sleep";
import { BnyEmissionHandler, BnyPauseBody, BnyPauseHandler, BnyProgram, createVM } from "@bunnarray/vm";
import { createSignal, onCleanup, onMount } from "solid-js";

// Reply beat for CAR after a player selects an option.
const CAR_DELAY_MS = 1200;

function parseOptionText(raw: string): { summary: string; full: string } {
    const [summary, full = summary] = raw.split('\\', 2).map((part) => part.trim());
    return { summary, full };
}

/** A choice shown to the player. */
export type DialogueOption = {
    summary: string;
    full: string;
    select: () => void;
}

type DialogueMessage = { name: string | null; text: string };

export type HermesProps = {
    program: BnyProgram;
    ctx?: DialogueContext;
    onClose: VoidFunction;
}

export default function createHermesController({ program, ctx, onClose: close }: HermesProps) {
    const [overlay, setOverlay] = createSignal(ctx?.initialOverlay);
    const [messages, setMessages] = createSignal<DialogueMessage[]>([]);
    const addMessage = (message: DialogueMessage) =>
        setMessages((prev) => [...prev, message]);

    const [options, setOptions] = createSignal<DialogueOption[]>([]);
    const [pendingNext, setPendingNext] = createSignal<BnyPauseBody<'next'> | null>(null);

    let shouldAutomaticallyClose = false;
    let advanceAfterYield = false;
    let stopped = false;
    onCleanup(() => { stopped = true; });

    function advance() {
        const pause = pendingNext();
        if (stopped || !pause) return;
        setPendingNext(null);
        pause.resume();
    }

    async function selectOption(
        pause: BnyPauseBody<'select'>,
        index: number,
        full: string,
        noCar: boolean
    ) {
        if (stopped) return;

        setOptions([]);
        shouldAutomaticallyClose = noCar;

        if (!noCar) {
            addMessage({ name: MAIN_CHARACTER_NAME, text: full });
            await sleep(CAR_DELAY_MS);
        }

        if (!stopped) pause.resume(index);
    }

    function showOptions(pause: BnyPauseBody<'select'>) {
        shouldAutomaticallyClose = false;
        setOptions(pause.options.map((option, index) => {
            const noCar = option.text.startsWith('^');
            const rawOptionText = noCar ? option.text.slice(1) : option.text;
            const { summary, full } = parseOptionText(rawOptionText);

            return {
                summary, full,
                select: () => selectOption(pause, index, full, noCar)
            };
        }));
    }

    const yieldHandler = createDialogueYieldHandler(ctx?.yieldHandlers);
    async function handleYield(pause: BnyPauseBody<'yield'>) {
        const res = await yieldHandler(pause.identifier, pause.value, runtime);
        if (stopped) return;

        advanceAfterYield = res?.advance === true;
        pause.resume();
    }

    const handleSignal = createDialogueSignalHandler(ctx?.signalHandlers);
    
    const onEmission: BnyEmissionHandler = (emission) => {
        if (stopped) return;
        switch (emission.kind) {
            case 'say':
                shouldAutomaticallyClose = false;
                addMessage({
                    name: emission.speaker === null
                        ? null
                        : ctx?.speakerNames?.[emission.speaker] ?? emission.speaker,
                    text: emission.text
                });
                return;
            case 'memory':
                ctx?.onMemoryUpdate?.(emission);
                return;
            case 'signal':
                handleSignal(emission.identifier, emission.value, runtime);
        }
    };

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
                    setOptions([{ summary: "[END]", full: "", select: close }]);
                }
                return;
            case 'error':
                // todo: handle this better, add recovery.
                throw pause.error;
        }
    };

    const vm = createVM(program, {
        memory: ctx?.initialMemory,
        onEmission, onPause
    });
    const runtime = { memory: vm.memory, setOverlay };
    onMount(vm.start);

    return { overlay, messages, options, pendingNext, advance };
}
