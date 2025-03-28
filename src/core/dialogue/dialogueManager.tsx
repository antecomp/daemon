import { Gimbal, LumePosition } from "../../extra.types";
import { Element3D, Scene } from "lume";
import { DialogueNode } from "./dialogueNode.types";
import { popUILayer, pushUILayer } from "@/components/layers/UILayerStore";
import { MainUILock } from "@/components/layers/ui-layers.types";
import Hermes from "@/components/layers/hermes/Hermes";
import hijackCamera from "@/components/lume/hijackCamera";
import {createSignal} from "solid-js";

let activeDialogueID: string | null = null;

// Subject to change
let hijackCameraBody: Element3D | undefined = undefined;

type StartDialogueOptions = {
    overlay?: string, 
    canCloseDialogueEarly?: boolean, 
    lock?: MainUILock,
    blockBehind?: boolean,
    // Subject to change
    cameraHijack?: {
        sceneRef: Scene  | undefined, 
        targetPosition: LumePosition, 
        targetOrientation: Omit<Gimbal, 'roll'>
    }
};

const [currentDialogueOverlay, setCurrentDialogueOverlay] = createSignal<string | null>(null);
const [canCloseDialogueEarly, setCanCloseDialogueEarly] = createSignal(false);

/**
 * Launch a new Hermes instance (new dialogue sequence).
 * @param rootNode, required param, a ref to the root node of the dialogue tree you want to render.
 * @param options - Start dialogue options (all optional), reference type definition for more details
 * @throws "Dialogue already in progress" error if there's already an active dialogue.
 */
function startDialogue(rootNode: DialogueNode, options?: StartDialogueOptions) {
    if(activeDialogueID) throw new Error("Dialogue already in progress.");

    const id = `dialogue-${Date.now()}`;
    activeDialogueID = id;

    pushUILayer({
        id,
        lock: options?.lock ?? MainUILock.All,
        blockBehind: options?.blockBehind,
        component: () => <Hermes root={rootNode} />,
        style: {right: 0}
    });

    if(options?.overlay) setCurrentDialogueOverlay(options.overlay);
    setCanCloseDialogueEarly(options?.canCloseDialogueEarly ?? false);

    // SUBJECT TO CHANGE.
    if (options?.cameraHijack) {
        hijackCameraBody = hijackCamera({ ...options.cameraHijack });
    }
}

/**
 * End the current dialogue instance.
 * @param options - End dialogue options (all optional), reference type definition for more details
 */
function endDialogue() {
    if (!activeDialogueID) throw new Error("No active dialogue to end.");

    setCurrentDialogueOverlay(null);
    setCanCloseDialogueEarly(false);
    popUILayer(activeDialogueID);

    if (hijackCameraBody) {
        hijackCameraBody.remove();
        hijackCameraBody = undefined;
    }

    activeDialogueID = null;
}

const DialogueService = { currentDialogueOverlay, canCloseDialogueEarly, startDialogue, endDialogue, setCurrentDialogueOverlay };
export { DialogueService };