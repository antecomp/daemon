import { AssetURL } from "@/shared/types/misc.types";
import { Setter } from "solid-js";
import * as THREE from "three";
import { Vector2 } from "three";


export interface InteractableObject3D extends THREE.Object3D {
    userData: {
        onHover?: interactionCB;
        onHoverLeave?: () => void;
        onClick?: interactionCB;
        cursor?: AssetURL;
    };
}

/** An interactionCB is a callback that fires for various interactions (see: Interactable, PlayerCam).
 * @argument uv: Vector2 - (u,v) indicating where the object was clicked (as a u,v point, however that is mapped).
 * @argument mouse: Vector2 - location of the mouse; relative to the entire scene container, in 2D space. The center of the screen is [0,0], ranging from [-1,-1] (bottom left) to [1,1] (top right).
 */
export type interactionCB = (uv: Vector2, mouse: Vector2) => void;

export enum InteractionMode {
    Interact,
    Chat,
    Observe,
}

/**
 * Map of interaction modes to a CB to run for handling that interaction type.
 * Used by YBillboard and Interactable
 * 
 * A map can either be an object that maps to the enum directly, or you can just shorthand as an array of [interact(), chat(), observe()]
 */
export type InteractionMap = {
    [mode in InteractionMode]?: interactionCB
} | [interactionCB?, interactionCB?, interactionCB?]

export interface InteractableComponent {
    /** interactionCB that runs regardless of interaction mode, for any user click. */
    onClick?: interactionCB
    /** interactionCB that runs regardless of interaction mode, on mouse over (as in, raycast hit) */
    onHover?: interactionCB
    /**
     * Map of interaction modes to a CB to run for handling that interaction type.
     * Used by YBillboard and Interactable.
     * 
     * An InteractionMap can either be an object that maps to the enum directly, or you can just shorthand as an array of `[interact(), chat(), observe()]`
     */
    interactions?: InteractionMap
    /** CB that runs regardless of interaction mode, when mouse leaves. */
    onHoverLeave?: () => void,
}

/** Context provided by InteractionProvider for reading and changing interaction mode state. */
export interface InteractionContextInt {
    currentInteractionMode(): InteractionMode;
    setCurrentInteractionMode: Setter<InteractionMode>;
    cycleInteractionMode(): void;
}