import { Actor } from "../engine/actor";
import { ActionMessageAppender, MultiplierSet } from "../engine/battle.types";

/**
 * Represents the type of a move, which determines its behavior (base multipliers) and interaction
 * with other moves during a battle sequence.
 */
export enum MoveType {
    Aggressive,
    Passive,
    Defensive,
    Overwhelming
}

/**
 * Temporary data storage for a sequence of moves, indexed by the move's position
 * in the sequence. Used for inter-move references during a battle.
 */
interface SequenceBuffer {
    [index: number]: Record<string, any>;
}

/**
 * Enum representing the perspective from which a move is being executed.
 * Used for animations.
 */
export enum MovePerspective {
    Player,
    Opponent
}

/**
 * Contextual information provided during the execution of a move. This includes
 * details about the actors involved, the sequence of moves, and utility functions
 * for appending action messages.
 */
export interface MoveContext {
    self: Actor; // The actor performing the move.
    opponent: Actor; // The opposing actor.
    movePerspective: MovePerspective; // Perspective of the move (Player or Opponent).
    index: number; // Index of the move in the sequence.
    sequence: Move[]; // The sequence of moves being executed. <- revise note my dumbass juist use self.currentSequence. lol
    sequenceBuffer: SequenceBuffer; // Temporary data storage for the sequence.
    appendActionMessage: ActionMessageAppender; // Function to append action messages.
}

/**
 * Represents the result of a move after it has been executed, including damage dealt,
 * damage taken, and the multipliers applied during the move.
 */
export interface MoveResolution {
    damageDealt: number; // Amount of damage dealt to the opponent.
    damageTaken: number; // Amount of damage taken by the actor.
    ourMults: MultiplierSet; // Multipliers applied to the actor's move.
    theirMults: MultiplierSet; // Multipliers applied to the opponent's move.
}

/**
 * Combines the context of a move with its resolution, providing a complete
 * picture of the move's execution and its effects.
 */
export type PostMoveContext = MoveContext & MoveResolution;

/**
 * Represents a side effect function that is executed during a move. These
 * functions can modify the state of the battle or apply statuses.
 */
export type MoveSideEffect = (context: MoveContext) => void;

/**
 * Represents a side effect function that is executed after a move has been
 * resolved. These functions can modify the state of the battle or apply
 * statuses based on the move's resolution.
 */
export type PostMoveSideEffect = (context: PostMoveContext) => void;

/**
 * Represents a function that modifies the multipliers applied during a move.
 * These functions are reduced over to calculate the final multipliers.
 */
export type MultiplierPipelineStep = (prevMultipliers: MultiplierSet, context: MoveContext) => MultiplierSet;

/**
 * A wrapper function that conditionally applies a side effect to a move.
 * This can be used to add conditional logic to side effects.
 */
export type MoveSEConditionalWrapper<T = MoveSideEffect | PostMoveSideEffect> = (effect: T) => T;

/**
 * A wrapper function that conditionally applies a multiplier pipeline step.
 * This can be used to add conditional logic to multiplier calculations.
 */
export type MovePLStepConditionalWrapper = (pls: MultiplierPipelineStep) => MultiplierPipelineStep;

/**
 * Represents a function that validates whether a sequence of moves is valid.
 * This is used to enforce rules or conditions on move sequences.
 */
export type MoveValidator = (workingSeq: MoveMeta[]) => boolean;


export interface moveAnimationStep<contextType = MoveContext | PostMoveContext> {
    execute: (ctx: contextType) => Promise<void>; // Function to execute the animation.
    soundEffect?: (ctx: contextType) => Promise<void>; // Function to conditionally attach a sound effect player to the animation.
}

/**
 * Represents animation data for a move, including its priority and the function
 * to execute the animation. The animation function is asynchronous.
 */
export interface animationData<T = MoveContext | PostMoveContext> extends moveAnimationStep<T> {
    priority: number; // Priority of the animation.
};

/**
 * Represents a move in the battle system, including its type, behaviors, and
 * optional animations. Moves define the core mechanics of a battle.
 */
export interface Move {
    name: string; // Internal name of the move.
    type: MoveType; // Type of the move (e.g., Aggressive, Defensive).
    behaviors: {
        preEffects?: MoveSideEffect[]; // Side effects executed before multiplier/damage calculation.
        multpipeline?: MultiplierPipelineStep[]; // Functions to calculate damage multipliers.
        immediatePostEffects?: PostMoveSideEffect[]; // Side effects executed immediately after damage calculation.
        postEffects?: PostMoveSideEffect[]; // Side effects executed after all other logic.
    };
    animations?: {
        pre?: animationData<MoveContext>[]; // Animations executed before the move.
        post?: animationData<PostMoveContext>[]; // Animations executed after the move.
    };
}

/**
 * Wrapper for a move that includes additional metadata for UI and conditional/eval logic.
 * Can be used to dynamically generate a move (f.e mirror/repeat utilize this).
 */
export interface MoveMeta {
    displayName: string; // Display name of the move for UI purposes.
    icon: string; // Icon representing the move in the UI.
    getMove: Move | ((context: { self: Actor; opponent: Actor; seq: MoveMeta[]; opponentSeq: MoveMeta[]; index: number }) => Move); // Move or function to dynamically generate a move.
    canPerform?: MoveValidator; // Validator function to determine if the move can be performed.
    description?: string; // Description of the move for tooltips.
}

/**
 * Specialized version of MoveMeta for player moves, including additional
 * metadata for the runebuilder UI and a mandatory description.
 */
export interface PlayerMoveMeta extends MoveMeta {
    rbIcon: string; // Icon used in the runebuilder UI.
    description: string; // Description of the move (mandatory for player moves).
}