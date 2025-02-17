import { Actor } from "../engine/actor";
import { MultiplierSet } from "../engine/battle.types";

export type movetype = "Aggressive" | "Passive";

export type MoveSideEffect = (self: Actor, opponent: Actor, index: number) => void
export type MultiplierPipelineStep = (prevMultipliers: MultiplierSet, self: Actor, /* opponent: Actor, */ index: number) => MultiplierSet
export type MoveValidator = (self: Actor, workingSequence: Move[]) => boolean;

export interface Move {
    name: string;
    type: movetype;
    behaviors: {
        preEffect?: MoveSideEffect[];
        counterEffect?: MoveSideEffect[];
        multipliers?: MultiplierPipelineStep[];
        postEffect?: MoveSideEffect[];
    };
    canPerform?: MoveValidator
}

export function getBaseMultipliers(type: movetype): MultiplierSet {
    return {
        "Aggressive":   {incoming: 1, outgoing: 1},
        "Passive":      {incoming: 1, outgoing: 0}
    }[type]
}