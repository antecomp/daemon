import { DialogueContext, DialogueNode } from "./dialogueNode.types";
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import attachToConsole from "@/devtools/attachToConsole";
import Hermes from "@/features/hermes/Hermes";
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
    blockBehind?: boolean,
    ctx?: DialogueContext 
};

const [currentDialogueOverlay, setCurrentDialogueOverlay] = createSignal<string | null>(null);
const [activeDialogue, setActiveDialogue] = createSignal<string | null>(null);
let dialogueCompletionResolver: (() => void) | null = null;

function startDialogue(rootNode: DialogueNode, options?: StartDialogueOptions) {
    if(activeDialogue()) throw new Error("Dialogue already in progress.");

    const id = `dialogue-${Date.now()}`; // TODO: change this. Utilize pushUILayers id?
    setActiveDialogue(id);

    pushUILayer({
        id,
        lock: 'all', // I see no case where this won't be correct.
        blockBehind: (options?.blockBehind == undefined) ? true : options.blockBehind,
        component: () => <Hermes root={rootNode} ctx={options?.ctx} />,
        style: {right: 0}
    });

    if(options?.overlay) setCurrentDialogueOverlay(options.overlay);

    return new Promise<void>((resolve) => {
        dialogueCompletionResolver = resolve;
    })
}

function endDialogue() {
    // soft warn instead of a full error - a conflict shouldn't crash the game, but is worth warning us about.
    if (!activeDialogue()) {console.warn("Close Dialogue Called, but no active dialogue was detected!"); return;}

    setCurrentDialogueOverlay(null);
    popUILayer(activeDialogue()!);

    setActiveDialogue(null);
    if(dialogueCompletionResolver) {
        dialogueCompletionResolver();
        dialogueCompletionResolver = null;
    }
}

function dialogueOngoing(): boolean {
    return activeDialogue() != null;
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
    
    currentDialogueOverlay, 
    setCurrentDialogueOverlay,

    dialogueOngoing
    
    
};

attachToConsole(DialogueService, "DG_DialogueService")
