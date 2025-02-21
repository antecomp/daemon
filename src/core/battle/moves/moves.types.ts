import { Actor } from "../engine/actor";
import { ActionMessageAppender, MultiplierSet } from "../engine/battle.types";

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
    appendActionMessage: ActionMessageAppender
}

export type MoveSideEffect = (context: MoveContext) => void;
export type MultiplierPipelineStep = (prevMultipliers: MultiplierSet, context: MoveContext) => MultiplierSet;
export type MoveSEConditionalWrapper = (effect: MoveSideEffect) => MoveSideEffect;
export type MoveValidator = (workingSeq: MoveMeta[]) => boolean;

export interface Move {
    /** Internally used name for the move. Generic. */
    name: string,
    /** Move type, used to calculate base multipliers, some moves also conditionally react to their/opposers type */
    type: movetype,
    /** A table of move behavior functions ("Side Effects" and "Pipeline Steps") that compose the moves actual behavior in a turn */
    behaviors: {
        /** Side Effects That Run *before* any multiplier/damage calculation. Namely used for applying in-turn statuses. */
        preEffects?: MoveSideEffect[]
        /** "pipeline steps", functions that are reduced over to calculate the final outgoing and incoming damage multipliers for this move. */
        multpipeline?: MultiplierPipelineStep[]
        /** Side effects that run *after* everything (including status tickdowns). Namely used to apply next-turn statuses */
        postEffects?: MoveSideEffect[]
    }
}


/** MoveMeta is a wrapper used for our actual moves. It provides additional information used by the UI (name, icon, etc)
 * 
 * However, MoveMeta also has some special logic in how it is "unwrapped." If we have Dynamic Moves, such as repeat,
 * the "getMove" property can instead be a function that returns a Move (instead of just a Move). This function is provided
 * a simple context of self, sequence and index.
 */
export interface MoveMeta {
    /** Different than move name, can be used to give cool distinct names for moves. F.e "candlelight" instead of "attack" */
    displayName: string,
    /** Small icon used in sequence visualization. Image url (import) */ 
    icon: string,
    /** Move or function that returns a move (conditional move return, i.e for repeat.) */
    getMove: Move | ((context: {self: Actor, seq: MoveMeta[], index: number}) => Move)
    /** Conditional for RB/AI-Get Sequence, logic indicating if the move is valid at a given step / given sequence.
     * 
     * For example, this is used in repeat to prevent it being the first move. */
    canPerform?: MoveValidator

    /** Used for tooltip */
    description: string
}

export interface PlayerMoveMeta extends MoveMeta {
    rbIcon: string // Larger, unique icons used for runebuilder.
}