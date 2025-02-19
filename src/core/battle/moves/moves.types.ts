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
export type MoveValidator = (self: Actor, workingSequence: Move[]) => boolean;
export type MultiplierPipelineStep = (prevMultipliers: MultiplierSet, context: MoveContext) => MultiplierSet;
export type MoveSEConditionalWrapper = (effect: MoveSideEffect) => MoveSideEffect;


export interface Move {
    name: string,
    type: movetype,
    behaviors: {
        preEffects?: (MoveSideEffect)[]
        multpipeline?: (MultiplierPipelineStep)[]
        postEffects?: (MoveSideEffect)[]
    },
    canPerform?: MoveValidator
}