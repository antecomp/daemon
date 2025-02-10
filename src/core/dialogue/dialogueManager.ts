import { createSignal } from "solid-js";
import { DialogueNode } from "./dialogueNode.types";


// Singleton for managing the active dialogue, exposes signal for conditional rendering of Hermes with a dialogue instance.
class DialogueManager {
    private static instance: DialogueManager;

    // Signal used for conditional rendering of Hermes, (and passing root node to Hermes)
    // Generally also reference HermesOverlay.tsx
    private activeDialogueSignal = createSignal<DialogueNode | null>(null);
    public activeDialogue = this.activeDialogueSignal[0];
    private setActiveDialogue = this.activeDialogueSignal[1]; // -> Use startDialogue/endDialogue to manage externally.

    // Signal used for overlay image (if one exists), this is instead used by SceneContainer (since it has the dimensions and DOM position of what we want to overlay)
    private activeDialogueOverlay = createSignal<string | null>(null); // string = image url.
    public currentDialogueOverlay = this.activeDialogueOverlay[0];
    public setCurrentDialogueOverlay = this.activeDialogueOverlay[1]; // Init with the startDialogue, you *can* also change it mid dialogue.

    // Signal to indicate to Hermes whether you can use the "disconnect" button or not (early dialogue tree termination / optional dialogue)
    private closeDialogueEarly = createSignal(false);
    public canCloseDialogueEarly = this.closeDialogueEarly[0];
    public setCanCloseDialogueEarly = this.closeDialogueEarly[1];

    constructor() {};

    public static getInstance(): DialogueManager {
        if(!this.instance) this.instance = new DialogueManager();
        return this.instance;
    }

    // Add options later for camera hijacking / artwork
    // Options will eventually include: sceneRef? cameraRef? and desired position/rotation to tween to. <- whatever you need for hijacking the camera
    public startDialogue(rootNode: DialogueNode, options?: {overlay?: string, canCloseDialogueEarly?: boolean}) {
        if(this.activeDialogue()) throw new Error("Dialogue already in progress.");
        this.setActiveDialogue(rootNode);
        this.setCanCloseDialogueEarly(options?.canCloseDialogueEarly ?? false);
        // TODO: Camera Hijack
        options?.overlay && this.setCurrentDialogueOverlay(options.overlay);
    }

    public endDialogue() {
        if (!this.activeDialogue()) return;

        // TODO: Add stuff to restore camera position
        this.setCurrentDialogueOverlay(null);
        this.setCanCloseDialogueEarly(false);
        this.setActiveDialogue(null);
    }
}

export const DialogueService = DialogueManager.getInstance();