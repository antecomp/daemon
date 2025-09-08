import { AssetURL } from "@/extra.types";
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

/** TODO DOCUMENT */
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