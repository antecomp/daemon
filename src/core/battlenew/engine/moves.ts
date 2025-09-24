/**
 * Represents the type of a move, which determines its behavior (base multipliers) and interaction
 * with other moves during a battle sequence.
 */
export enum MoveType {
    Aggressive, Passive, Defensive, Overwhelming
}

export interface Move {

    name: string; // Used for internal tracking / comparison. Not UI.
    type: MoveType;

    // dont forget that through each behavior now, we
    // want moves to carry a transient outcome that can be used
    // to communicate status between stages.
    behaviors: {
        // preEffects
        // multiplierPipeline
        // postEffects
    }

    // Should animations go here or can we coerce that info into MoveMeta?
    // Issue is that the animations are context-based, change depending on move outcome.
    // consider just having *another* export of moves in the behavior pipeline that
    // communicates some general state. Then the sound, animation, etc handler maps those
    // results to visuals. Keeps the responsibilities clear.
}

type MoveValidator = (workingSequence: DynamicMove[]) => boolean;

export interface DynamicMove {
    canPerform?: MoveValidator;
    resolveMove: Move | ((/* context goes here */) => Move);
}