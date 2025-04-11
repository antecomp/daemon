import { Gimbal, LumePosition } from "../../extra.types";
import { DialogueNode } from "./dialogueNode.types";
import { popUILayer, pushUILayer } from "@/layers/UILayerStore";
import { MainUILock } from "@/layers/ui-layers.types";
import Hermes from "@/layers/hermes/Hermes";
import {createSignal, JSX} from "solid-js";
import { currentCameraController } from "@/components/lume/multicam/Multicam";
import { lerpTo } from "@/components/lume/multicam/behaviors/lerpTo";
import { snapTo } from "@/components/lume/multicam/behaviors/snapTo";
import { CameraTransformCache } from "@/components/lume/multicam/multicam.types";

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
        lerpSpeed?: number,
        lerpBack?: boolean
    }
};

const [currentDialogueOverlay, setCurrentDialogueOverlay] = createSignal<string | null>(null);
const [canCloseDialogueEarly, setCanCloseDialogueEarly] = createSignal(false);

// Track information about current dialogue (used for active check, camera transforms)
const DialogueState = {
    activeDialogue: null as string | null,
    hijack: false,
    lerpData: null as {
        lerpSpeed?: number,
        lerpBack?: boolean,
        originalCameraPosition: CameraTransformCache
    } | null
}

function startDialogue(rootNode: DialogueNode, options?: StartDialogueOptions) {
    if(DialogueState.activeDialogue) throw new Error("Dialogue already in progress.");

    const id = `dialogue-${Date.now()}`;
    DialogueState.activeDialogue = id;

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
        const { targetPosition, targetOrientation, lerp, lerpSpeed, lerpBack } = options.cameraHijack;
        DialogueState.hijack = true;

        if(lerpBack) {
            DialogueState.lerpData = {
                originalCameraPosition: currentCameraController().currentTransform,
                lerpSpeed,
                lerpBack
            }
        } else {
            DialogueState.lerpData = null; // Prevent lerp, reset.
        }

        if(lerp) {
            currentCameraController().setTemporaryBehavior(
                lerpTo( targetPosition, targetOrientation.yaw, targetOrientation.pitch, lerpSpeed)
            );
        } else {
            currentCameraController().setTemporaryBehavior(snapTo(targetPosition, targetOrientation.yaw, targetOrientation.pitch));
        }
    } else {
        DialogueState.hijack = false;
    }
}

function endDialogue() {
    if (!DialogueState.activeDialogue) throw new Error("No active dialogue to end.");

    setCurrentDialogueOverlay(null);
    setCanCloseDialogueEarly(false);
    popUILayer(DialogueState.activeDialogue);

    if(DialogueState.lerpData?.lerpBack) {
        const {originalCameraPosition, lerpSpeed} = DialogueState.lerpData
        currentCameraController().setTemporaryBehavior(
            lerpTo(
                originalCameraPosition.position, 
                originalCameraPosition.yaw, 
                originalCameraPosition.pitch,
                lerpSpeed, // Maybe get from camera hijack options (would need cache for interfunction)
                () => currentCameraController().stopTemporaryBehavior()
            )
        );
    } else if (DialogueState.hijack) {
        currentCameraController().stopTemporaryBehavior();
    }

    DialogueState.activeDialogue = null;
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