import { Move } from "./move";

export type MoveValidator = (workingPlan: PlannedMove[], index: number) => boolean;

export type PlannedMoveInstantiator = (
    context: {
        myPlan: PlannedMove[];
        theirPlan: PlannedMove[];
        index: number;
    }
) => Move;

export interface PlannedMove {
    /** Similar to the name for a plain Move, just used for logical checks and internal tracking. Can be used for mappings in BattleEvent emissions. */
    name: string;
    canPerform?: MoveValidator;
    instantiate: PlannedMoveInstantiator; // Always using a function to reduce typechecking mess. More consistent code.
}

export type PlannedSequence = PlannedMove[];