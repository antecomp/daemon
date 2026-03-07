import { AssetURL } from "@/shared/types/misc.types";
import { Setter } from "solid-js";
import * as THREE from "three";
import { Vector2 } from "three";

/** Represents the key "interaction modes" the player can use when interfacing with the game scene. 
 * Interactable components and other pieces of game logic respond to the current interaction mode. See `InteractionProvider.tsx` */
export enum InteractionMode {
    Interact,
    Chat,
    Observe,
}

/** 
 * Size of InteractionMode enum, indicates number of interaction modes.
 *  @ref https://stackoverflow.com/questions/38034673/determine-the-number-of-enum-elements-typescript
*/
export const NUM_INTERACTION_MODES = Object.keys(InteractionMode).length / 2;

export interface InteractableObject3D extends THREE.Object3D {
    userData: {
        onHover?: InteractionCB;
        onHoverLeave?: () => void;
        onClick?: InteractionCB;
        cursor?: AssetURL;
    };
}

/** An interactionCB is a callback that fires for various interactions (see: Interactable, PlayerCam).
 * @argument uv: Vector2 - (u,v) indicating where the object was clicked (as a u,v point, however that is mapped).
 * @argument mouse: Vector2 - location of the mouse; relative to the entire scene container, in 2D space. The center of the screen is [0,0], ranging from [-1,-1] (bottom left) to [1,1] (top right).
 */
export type InteractionCB = (uv: Vector2, mouse: Vector2) => void;

/**
 * Map of interaction modes to a CB to run for handling that interaction type.
 * Used by YBillboard and Interactable
 * 
 * A map can either be an object that maps to the enum directly, or you can just shorthand as an array of [interact(), chat(), observe()]
 */
export type InteractionMap = {
    [mode in InteractionMode]?: InteractionCB
} | [InteractionCB?, InteractionCB?, InteractionCB?]


/**
 * Describes a component that can respond to user interactions (clicks, hover, and mode-specific actions).
 *
 * This interface exposes a set of optional callbacks and a flexible interaction map so a component can:
 * - react to any click (regardless of the current interaction mode),
 * - respond to hover begin/leave events (raycast hit semantics),
 * - and provide handlers for specific interaction modes (e.g., interact, chat, observe).
 *
 * Remarks:
 * - onClick and onHover are global handlers that run for any click or hover respectively.
 * - interactions is a mode-to-handler mapping that may be supplied either as an object keyed by the
 *   interaction enum or as a shorthand array form (for example: `[interact(), chat(), observe()]`).
 *
 * @property onClick - Optional callback invoked for any click interaction.
 * @property onHover - Optional callback invoked when the component is hovered (raycast detects it).
 * @property interactions - Optional mapping of interaction modes to handlers. Supports both
 *                          an enum-keyed object and an ordered shorthand array representation.
 * @property onHoverLeave - Optional callback invoked when the hover (raycast) ends / pointer leaves.
 */
export interface InteractableComponent {
    /** interactionCB that runs regardless of interaction mode, for any user click. */
    onClick?: InteractionCB
    /** interactionCB that runs regardless of interaction mode, on mouse over (as in, raycast hit) */
    onHover?: InteractionCB
    /** CB that runs regardless of interaction mode, when mouse leaves. */
    onHoverLeave?: () => void
    /**
     * Map of interaction modes to a CB to run for handling that interaction type.
     * Used by YBillboard and Interactable.
     * 
     * An InteractionMap can either be an object that maps to the enum directly, or you can just shorthand as an array of `[interact(), chat(), observe()]`
     */
    interactions?: InteractionMap
}

/** Context provided by InteractionProvider for reading and changing interaction mode state. */
export interface InteractionContextInt {
    currentInteractionMode(): InteractionMode;
    setCurrentInteractionMode: Setter<InteractionMode>;
    cycleInteractionMode(): void;
}