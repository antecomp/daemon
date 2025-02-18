import { Actor } from "../engine/actor";
import { MultiplierSet } from "../engine/battle.types";

export type movetype = "Aggressive" | "Passive";

export type MoveSideEffect = (self: Actor, opponent: Actor, index: number) => void
export type MultiplierPipelineStep = (prevMultipliers: MultiplierSet, self: Actor, /* opponent: Actor, */ index: number) => MultiplierSet
export type MoveValidator = (self: Actor, workingSequence: Move[]) => boolean;
export type MoveSEConditionalWrapper = (self: Actor, opponent: Actor, index: number, SE: MoveSideEffect) => MoveSideEffect | undefined

export interface Move {
    name: string;
    type: movetype;
    behaviors: {
        preEffect?: (MoveSideEffect | undefined)[];
        multipliers?: MultiplierPipelineStep[];
        postEffect?: (MoveSideEffect | undefined)[];
    };
    canPerform?: MoveValidator
}

// Move this to engine.
export function getBaseMultipliers(type: movetype): MultiplierSet {
    return {
        "Aggressive":   {incoming: 1, outgoing: 1},
        "Passive":      {incoming: 1, outgoing: 0}
    }[type]
}