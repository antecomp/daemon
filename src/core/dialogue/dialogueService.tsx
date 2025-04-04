import { Gimbal, LumePosition } from "../../extra.types";
import { DialogueNode } from "./dialogueNode.types";
import { popUILayer, pushUILayer } from "@/core/ui/UILayerStore";
import { MainUILock } from "@/core/ui/ui-layers.types";
import Hermes from "@/components/layers/hermes/Hermes";
import {createSignal} from "solid-js";
import { currentCameraController } from "@/components/lume/multicam/Multicam";
import { lerpTo, snapTo } from "@/components/lume/multicam/multicam-behaviors";
import { CameraTransformCache } from "@/components/lume/multicam/multicam.types";

let activeDialogueID: string | null = null;

/**
 * Interface representing the options for starting a dialogue.
 * 
 * @property overlay - The image overlay (url) to be displayed during the dialogue.
 * @property canCloseDialogueEarly - Indicates if the dialogue can be closed early.
 * @property lock - The lock state associated with the dialogue.
 * @property blockBehind - Indicates if interactions with layers behind this one are blocked.
 * @property cameraHijack - Subject to change. Contains information about camera hijacking.
 */
type StartDialogueOptions = {
    overlay?: string, 
    canCloseDialogueEarly?: boolean, 
    lock?: MainUILock,
    blockBehind?: boolean,
    // Subject to change
    cameraHijack?: {
        targetPosition: LumePosition, 
        targetOrientation: Omit<Gimbal, 'roll'>
        lerp?: boolean,
        lerpSpeed?: number
    }
};

const [currentDialogueOverlay, setCurrentDialogueOverlay] = createSignal<string | null>(null);
const [canCloseDialogueEarly, setCanCloseDialogueEarly] = createSignal(false);

// bruh
let originalCameraPosition = null as null | CameraTransformCache

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

    if (options?.cameraHijack) {
        const { targetPosition, targetOrientation, lerp, lerpSpeed } = options.cameraHijack;
        if(lerp) {
            originalCameraPosition = currentCameraController().currentTransform;
            currentCameraController().setTemporaryBehavior(
                lerpTo( targetPosition, targetOrientation.yaw, targetOrientation.pitch, lerpSpeed)
            );
        } else {
            originalCameraPosition = null; // Prevent lerp, reset.
            currentCameraController().setTemporaryBehavior(snapTo(targetPosition, targetOrientation.yaw, targetOrientation.pitch));
        }
    }
}

function endDialogue() {
    if (!activeDialogueID) throw new Error("No active dialogue to end.");

    setCurrentDialogueOverlay(null);
    setCanCloseDialogueEarly(false);
    popUILayer(activeDialogueID);

    if(originalCameraPosition) {
        currentCameraController().setTemporaryBehavior(
            lerpTo(
                originalCameraPosition.position, 
                originalCameraPosition.yaw, 
                originalCameraPosition.pitch,
                undefined, // Maybe get from camera hijack options (would need cache for interfunction)
                () => currentCameraController().stopTemporaryBehavior()
            )
        );
    } else {
        currentCameraController().stopTemporaryBehavior();
    }

    activeDialogueID = null;
}

const DialogueService = { 
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

export { DialogueService };