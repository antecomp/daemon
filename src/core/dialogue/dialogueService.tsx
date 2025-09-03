import { DialogueNode } from "./dialogueNode.types";
import { popUILayer, pushUILayer } from "@/layers/UILayerStore";
import { MainUILock } from "@/layers/ui-layers.types";
import Hermes from "@/layers/hermes/Hermes";
import {createSignal} from "solid-js";

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
    canCloseDialogueEarly?: boolean, 
    lock?: MainUILock,
    blockBehind?: boolean,
    ctx?: Record<string, any>
};

const [currentDialogueOverlay, setCurrentDialogueOverlay] = createSignal<string | null>(null);
const [canCloseDialogueEarly, setCanCloseDialogueEarly] = createSignal(false);

let activeDialogue = null as string | null;
let dialogueCompletionResolver: (() => void) | null = null;

function startDialogue(rootNode: DialogueNode, options?: StartDialogueOptions) {
    if(activeDialogue) throw new Error("Dialogue already in progress.");

    const id = `dialogue-${Date.now()}`;
    activeDialogue = id;

    pushUILayer({
        id,
        lock: options?.lock ?? MainUILock.All,
        blockBehind: options?.blockBehind,
        component: () => <Hermes root={rootNode} ctx={options?.ctx} />,
        style: {right: 0}
    });

    if(options?.overlay) setCurrentDialogueOverlay(options.overlay);
    setCanCloseDialogueEarly(options?.canCloseDialogueEarly ?? false);

    return new Promise<void>((resolve) => {
        dialogueCompletionResolver = resolve;
    })
}

function endDialogue() {
    if (!activeDialogue) throw new Error("No active dialogue to end.");

    setCurrentDialogueOverlay(null);
    setCanCloseDialogueEarly(false);
    popUILayer(activeDialogue);

    activeDialogue = null;
    if(dialogueCompletionResolver) {
        dialogueCompletionResolver();
        dialogueCompletionResolver = null;
    }
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
    
    canCloseDialogueEarly,
    currentDialogueOverlay, 
    setCurrentDialogueOverlay 
};