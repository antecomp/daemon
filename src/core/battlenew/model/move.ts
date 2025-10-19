import { Combatant } from "./combatant";
import { DamageMultipliers } from "./battle";
import { BattleEngineDependencies } from "../engine/battleEngine";

/**
 * Represents the type of a move, which determines its behavior (base multipliers) and interaction
 * with other moves during a battle sequence.
 */
export enum MoveType {
    Aggressive, Passive, Defensive, Overwhelming
}

// TODO: Make signal more robust/predictable than just a string

// Declare global interface that we can extend from anywhere (allowing us to easily append new information as part of move effects)
declare global {
    interface MoveSignalMap {
        'example': {x: number}
    } // For Third-Party Extension.
}

// export type MoveSignal<K extends keyof MoveSignalMap = keyof MoveSignalMap> = {
//     type: K,
//     payload: MoveSignalMap[K]
// }

export type MoveSignalOf<K extends keyof MoveSignalMap> = {
    type: K;
    payload: MoveSignalMap[K];
}

// Distributed union over all keys - to actually correlate type to payload for narrowing to work.
export type MoveSignal = {
    [K in keyof MoveSignalMap]: MoveSignalOf<K>
}[keyof MoveSignalMap];

export enum MoveSideEffectOutcome {
    Success, Failure,
    /* Attempted */ // feel free to add more if needed.
}

export interface PreMoveContext {
    deps: BattleEngineDependencies;
    emit: (signal: MoveSignal) => void;
    self: Combatant;
    them: Combatant;
    moves: {
        ours: Move,
        theirs: Move
    }
}

export interface DamageMultiplierContext extends PreMoveContext {
    preEffectOutcome: MoveSideEffectOutcome | undefined;
}

export interface ClashResult {
    damageDealt: number; 
    damageTaken: number; 
    ourMults: DamageMultipliers;
    theirMults: DamageMultipliers;
}

export type PostMoveContext = DamageMultiplierContext & ClashResult;

export type EndOfMoveContext = PostMoveContext & {postEffectOutcome: MoveSideEffectOutcome | undefined}

export type PreMoveSideEffect = (context: PreMoveContext) => MoveSideEffectOutcome | void; // have these saved to context as seperate outcomes!
export type DamageMultiplierFunction = (context: DamageMultiplierContext) => DamageMultipliers;
export type PostMoveSideEffect = (context: PostMoveContext) => MoveSideEffectOutcome | void; // have these saved to context as seperate outcomes!

export type MoveMultiplierConditionalWrapper = (pipelineStep: DamageMultiplierFunction) => DamageMultiplierFunction;
export type MoveSideEffectConditionalWrapper<SEType = PreMoveSideEffect | PostMoveSideEffect> = (effect: SEType) => SEType;


/**
 * Represents a battle move with a unique name, type, and associated behaviors.
 *
 * @property name - Move name used for internal tracking, comparison, and event mapping.
 * @property type - The type/category of the move. Used for logical checks and to set initial damage multipliers.
 * @property behaviors - Optional hooks for move side effects and damage calculation:
 *   - preEffect: Function executed before the move's main effect.
 *   - damageMultipliers: Function to calculate damage multipliers.
 *   - postEffect: Function executed after the move's main effect.
 */
export interface Move {
    /** Move name - used for internal tracking and comparison. Can be used for mapping in emitted events. Should rarely be used otherwise. */
    name: string;
    type: MoveType;

    behaviors: {
        preEffect?: PreMoveSideEffect;
        damageMultipliers?: DamageMultiplierFunction;
        postEffect?: PostMoveSideEffect;
    }
}