import { AssetURL } from "@/shared/types/misc.types";
import { DialogueContext } from "./dialogue.types";
import { createSignal } from "solid-js";
import { BnyProgram } from "@bunnarray/vm";
import { pushUILayer } from "@/app/shell/layers/UILayerManager";
import { Show } from "solid-js";
import Hermes from "@/features/hermes/Hermes";

type DialogueSession = {
    popLayer: VoidFunction;
    resolve: VoidFunction;
}

export type StartDialogueOptions = {
    overlay?: AssetURL;
    blockBehind?: boolean;
    ctx?: DialogueContext;
}

const [session, setSession] = createSignal<DialogueSession | null>(null);
export const dialogueOngoing = () => !!session();

export async function startDialogue(program: BnyProgram, options?: StartDialogueOptions) {
    if (dialogueOngoing()) throw new Error("Dialogue already in progress.");

    const [overlay, setOverlay] = createSignal<AssetURL | undefined>(options?.overlay);

    const { popLayer } = pushUILayer({
        lock: 'all', // for now I don't see any case where we'd change this.
        blockBehind: options?.blockBehind === undefined ? true : options.blockBehind,
        component: () => <>
            <Show when={overlay()}>
                <div
                    id='dialogue-overlay'
                    class='fademein'
                    style={{ background: `url(${overlay()})` }}
                />
            </Show>
            <Hermes program={program} ctx={options?.ctx} onClose={endDialogue} setOverlay={setOverlay} />
        </>
    });

    return new Promise<void>(resolve => setSession({ popLayer, resolve }));
}

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