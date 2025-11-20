import { Move } from "./move.types";

/**
 * A function type that validates a planned move within a list of planned moves.
 * Used to prevent illegal move plans (e.g using 'repeat' at the start of a sequence.)
 *
 * @param workingPlan - The array of current planned moves.
 * @returns `true` if the move at the specified index is valid, otherwise `false`.
 */
export type MoveValidator = (workingPlan: PlannedMove[]) => boolean;

/**
 * A function type that creates a `Move` instance based on the provided planning context.
*/
export type PlannedMoveInstantiator = (
    context: {
        myPlan: PlannedMove[];
        theirPlan: PlannedMove[];
        index: number;
    }
) => Move;

/**
 * Represents a move that is planned to be executed in the battle system.
 * Dynamically instantiating using battle context for unique behaviors.
 *
 * @property name - A unique identifier for the move, used for logical checks, internal tracking, and mapping in BattleEvent emissions.
 * @property canPerform - (Optional) A function that validates whether the move can be performed under current conditions. 
 *                        When undefined this defaults to being seen as true.
 * @property instantiate - A function that creates an instance of the planned move.
 */
export interface PlannedMove {
    /** Similar to the name for a plain Move, just used for logical checks and internal tracking. Can be used for mappings in BattleEvent emissions. */
    name: string;
    canPerform?: MoveValidator;
    instantiate: PlannedMoveInstantiator; // Always using a function to reduce typechecking mess. More consistent code.
}

export type PlannedSequence = PlannedMove[];