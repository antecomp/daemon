import { DialogueContext } from "./dialogue.types";
import { createSignal } from "solid-js";
import { BnyProgram } from "@bunnarray/vm";
import { pushUILayer } from "@/app/shell/layers/UILayerManager";
import Hermes from "@/features/hermes/Hermes";

type DialogueSession = {
    popLayer: VoidFunction;
    resolve: VoidFunction;
}

/** {@link DialogueContext} plus control over interaction with layers behind the dialogue. */
export type StartDialogueOptions =
    {
        /** Block interaction with layers behind the dialogue (default: true). */
        blockBehind?: boolean
    }
    & DialogueContext

const [session, setSession] = createSignal<DialogueSession | null>(null);

/** Whether a dialogue is currently open. */
export const dialogueOngoing = () => !!session();

/**
 * Opens a dialogue (Hermes) overlay. Rejects if one is already open.
 * @param program Bny Dialogue to play.
 * @param options Optional {@link DialogueContext} settings: 
 * - `initialOverlay` shows a starting image,
 * - `initialMemory` seeds dialogue values, 
 * - `onMemoryUpdate` receives memory changes,
 * - `signalHandlers` map of signals to handlers  `{[identifier]: (value, runtime) => void}`,
 * - `yieldHandlers` map of yield handlers. `{[identifier]: YieldHandler`,
 * - and `speakerNames` replaces displayed speaker names.
 * @returns a Promise that resolves when the dialogue ends (either naturally or from {@link endDialogue})
 */
export async function startDialogue(program: BnyProgram, options?: StartDialogueOptions) {
    if (dialogueOngoing()) throw new Error("Dialogue already in progress.");

    const {blockBehind = true, ...ctx } = options ?? {};

    const { popLayer } = pushUILayer({
        lock: 'all', // for now I don't see any case where we'd change this.
        blockBehind,
        component: () => <Hermes program={program} ctx={ctx} onClose={endDialogue} />
    });

    return new Promise<void>(resolve => setSession({ popLayer, resolve }));
}

/** Close the current dialogue. Resolves the promise returned by {@link startDialogue} */
export function endDialogue() {
    const ses = session();
    if (!ses) {
        console.warn('Close dialogue called, but no active dialogue was detected!');
        return;
    }

    ses.popLayer();
    ses.resolve();
    setSession(null);
}
