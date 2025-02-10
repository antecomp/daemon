import { createSignal } from "solid-js";
import { DialogueNode } from "./dialogueNode.types";



// Singleton for managing the active dialogue, exposes signal for conditional rendering of Hermes with a dialogue instance.
class DialogueManager {
    private static instance: DialogueManager;

    private activeDialogueSignal = createSignal<DialogueNode | null>(null);
    public activeDialogue = this.activeDialogueSignal[0];
    private setActiveDialogue = this.activeDialogueSignal[1];

    constructor() {};

    public static getInstance(): DialogueManager {
        if(!this.instance) this.instance = new DialogueManager();
        return this.instance;
    }

    // Add options later for camera hijacking / artwork
    public startDialogue(rootNode: DialogueNode /*,options?: {sceneRef?: any, cameraRef?: any, overlay?: string}*/) {
        if(this.activeDialogue()) throw new Error("Dialogue already in progress.");
        this.setActiveDialogue(rootNode);

        // TODO: Camera Hijack / Scene Overlay Logic
    }

    public endDialogue() {
        if (!this.activeDialogue()) return;

        // Add stuff to restore camera position / remove overlay...

        this.setActiveDialogue(null);
    }
}

export const DialogueService = DialogueManager.getInstance();