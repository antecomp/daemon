import { DialogueContext, DialogueNode } from "./dialogueNode.types";
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import attachToConsole from "@/devtools/attachToConsole";
import Hermes from "@/features/hermes/Hermes";
import { createSignal, Show } from "solid-js";

/**
 * Interface representing the options for starting a dialogue.
 * 
 * @property overlay - The image overlay (url) to be displayed during the dialogue.
 * @property canCloseDialogueEarly - Indicates if the dialogue can be closed early.
 * @property lock - The lock state associated with the dialogue.
 * @property blockBehind - Indicates if interactions with layers behind this one are blocked.
 */
export type StartDialogueOptions = {
    overlay?: string,
    blockBehind?: boolean,
    ctx?: DialogueContext
};

const [currentDialogueOverlay, setCurrentDialogueOverlay] = createSignal<string | null>(null);
const [dialogueLayerID, setDialogueLayerID] = createSignal<string | null>(null);
let dialogueCompletionResolver: (() => void) | null = null;

function startDialogue(rootNode: DialogueNode, options?: StartDialogueOptions) {
    if (dialogueLayerID()) throw new Error("Dialogue already in progress.");

    const { id } = pushUILayer({
        lock: 'all', // I see no case where this won't be correct.
        blockBehind: (options?.blockBehind == undefined) ? true : options.blockBehind,
        component: () => <>
            <Show when={DialogueService.currentDialogueOverlay()}>
                <div id="dialogue-overlay" class="fademein" style={{ background: `url(${DialogueService.currentDialogueOverlay()})` }}></div>
            </Show>
            <Hermes root={rootNode} ctx={options?.ctx} />
        </>,
    });

    setDialogueLayerID(id);

    if (options?.overlay) setCurrentDialogueOverlay(options.overlay);

    return new Promise<void>((resolve) => {
        dialogueCompletionResolver = resolve;
    })
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

export const DialogueService = {
    /**
     * Launch a new Hermes instance (new dialogue sequence).
     * @param rootNode, required param, a ref to the root node of the dialogue tree you want to render.
     * @param options - Start dialogue options (all optional), reference type definition for more details
     * @throws "Dialogue already in progress" error if there's already an active dialogue.
     */
    startDialogue,
    /**
     * End the current dialogue instance.
     * @param options - End dialogue options (all optional), reference type definition for more details
     */
    endDialogue,
   /** 
    * Retrieve the currently used dialogue overlay.
    */
    currentDialogueOverlay,
     /**
     * Change the overlay image of the current dialogue. Can be set to null for no image.
     */
    setCurrentDialogueOverlay,
    /** 
     * Indicates if there is an active dialogue.
     */
    dialogueOngoing
};

attachToConsole(DialogueService, "DIALOGUESERVICE")
