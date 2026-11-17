import { BnyProgram } from "@bunnarray/vm";
import { DialogueContext } from "./dialogue.types"
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import { DialogueService } from "./dialogueService";
import { createSignal, Show } from "solid-js";
import Hermes from "@/features/hermes/HermesRewrite";

export type StartDialogueOptions = {
    overlay?: string,
    blockBehind?: boolean,
    ctx?: DialogueContext
}

// TODO: with the new dialogue system, you should seriously consider redesigning this
const [currentDialogueOverlay, setCurrentDialogueOverlay] = createSignal<string | null>(null);
const [dialogueLayerID, setDialogueLayerID] = createSignal<string | null>(null);
let dialogueCompletionResolver: (() => void) | null = null;

function startDialogue(program: BnyProgram, options?: StartDialogueOptions) {
    if (dialogueLayerID()) throw new Error("Dialogue already in progress.");

    const { id } = pushUILayer({
        lock: 'all',
        blockBehind: (options?.blockBehind == undefined) ? true : options.blockBehind,
        component: () => <>
            <Show when={DialogueService.currentDialogueOverlay()}>
                <div id="dialogue-overlay" class="fademein" style={{ background: `url(${DialogueService.currentDialogueOverlay()})` }}></div>
            </Show>
            <Hermes program={program} ctx={options?.ctx} />
        </>
    });

    setDialogueLayerID(id);

    if (options?.overlay) setCurrentDialogueOverlay(options.overlay);

    return new Promise<void>(resolve => dialogueCompletionResolver = resolve);
}

function endDialogue() {
    // soft warn instead of a full error - a conflict shouldn't crash the game, but is worth warning us about.
    if (!dialogueLayerID()) { console.warn("Close Dialogue Called, but no active dialogue was detected!"); return; }

    setCurrentDialogueOverlay(null);
    popUILayer(dialogueLayerID()!);

    setDialogueLayerID(null);
    if (dialogueCompletionResolver) {
        dialogueCompletionResolver();
        dialogueCompletionResolver = null;
    }
}

function dialogueOngoing(): boolean {
    return dialogueLayerID() != null;
}

export const DialogueServiceRewrite = {
    startDialogue,
    endDialogue,
    currentDialogueOverlay,
    setCurrentDialogueOverlay,
    dialogueOngoing
}

// attachToConsole(DialogueService, "DIALOGUESERVICE")