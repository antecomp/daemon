import { Actor } from "../engine/actor";
import { MultiplierSet } from "../engine/battle.types";

export type movetype = "Aggressive" | "Passive";

/* Per-sequence temporary data, indexed by assigning move for inter-move ref. */
export interface SequenceBuffer {
    [index: number]: Record<string, any>;
}

export interface MoveContext {
    // move: Move; // Points to the move itself (used for pipeline stuff)
    self: Actor;
    opponent: Actor;
    index: number;
    sequence: Move[];
    sequenceBuffer: SequenceBuffer; 
}

export type MoveSideEffect = (context: MoveContext) => void;
export type MoveValidator = (/*self: Actor, */ workingSequence: Move[]) => boolean;
export type MultiplierPipelineStep = (prevMultipliers: MultiplierSet, context: MoveContext) => MultiplierSet;
export type MoveSEConditionalWrapper = (effect: MoveSideEffect) => MoveSideEffect;


export interface Move {
    /** Internally used name for the move. Generic. */
    name: string,
    /** Move type, used to calculate base multipliers, some moves also conditionally react to their/opposers type */
    type: movetype,
    /** A table of move behavior functions ("Side Effects" and "Pipeline Steps") that compose the moves actual behavior in a turn */
    behaviors: {
        /** Side Effects That Run *before* any multiplier/damage calculation. Namely used for applying in-turn statuses. */
        preEffects?: (MoveSideEffect)[]
        /** "pipeline steps", functions that are reduced over to calculate the final outgoing and incoming damage multipliers for this move. */
        multpipeline?: (MultiplierPipelineStep)[]
        /** Side effects that run *after* everything (including status tickdowns). Namely used to apply next-turn statuses */
        postEffects?: (MoveSideEffect)[]
    },
    canPerform?: MoveValidator
}


// COme up with a better name for this please.
export interface MoveData extends Move {
    displayName: string // Custom name in the UI for moves, different from general name we use internally.
    icon: string
    // description: string
}

export interface PlayerMoveData extends MoveData {
    rbIcon: string // Larger, uniquer icons used for runebuilder.
}