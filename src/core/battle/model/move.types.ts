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

/** Tags attached to a move when instantiated (formed from PlannedMove). Used to indicate additional context. 
 * For example if the move is the result of special plans such as "mirror" or "repeat" */
export type MoveTags = ('mirrored' | 'repeated')[];

// Declare global interface that we can extend from anywhere 
// (allowing us to easily append new information as part of move effects)
declare global {
    /** 
     * MoveSignalMap is a mapping of some named signal that a move can emit, and the expected payload for that signal. 
     * This is the type used by the MoveEmission battle event (@ref battleReactions.ts). 
     * Thus, these signals are captured and handled by the MoveEmission method in a battle reactions map.
     * 
     * It is declared in the global scope so this interface can be extended from other sources. 
     * To add additional signal types, do the following;
     * @example
     * ```typescript
     * declare global {
        interface MoveSignalMap {
        'signalname': {something: number, somethingElse: boolean},
        }
    }
    ```    
     * */
    interface MoveSignalMap {
        'example': {x: number}
    }
}

// Helper type, see below.
export type MoveSignalOf<K extends keyof MoveSignalMap> = {
    type: K;
    payload: MoveSignalMap[K];
}

// Distributed union over all keys - to actually correlate type to payload for narrowing to work.
export type MoveSignal = {
    [K in keyof MoveSignalMap]: MoveSignalOf<K>
}[keyof MoveSignalMap];

/** Move side effects can emit an outcome as an indicator of their result (f.e if evade rolled successfully). 
 * Passed as part of context to subsequent evaluation stages (multiplierPipeline, postEffect, move end emitter)
 * 
 * Feel free to extend this enum if additional outcome indicators are needed.  */
// export enum MoveSideEffectOutcome {
//     Success, Failure,
// }

export type MoveSideEffectOutcome = {
    status: 'success' | 'failure',
    reason: "focus" | "rng" | "clash" | "mechanic" // add more as needed. consider merging focus as mechanic.
    //meta: unknown // extend this type with additional metadata if necessary. Try to avoid though.
}

export function reportMoveOutcome(status: MoveSideEffectOutcome['status'], reason: MoveSideEffectOutcome['reason']): MoveSideEffectOutcome {
    return {status, reason}
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

export type PreMoveSideEffect = (context: PreMoveContext) => MoveSideEffectOutcome | void;
export type DamageMultiplierFunction = (context: DamageMultiplierContext) => DamageMultipliers;
export type PostMoveSideEffect = (context: PostMoveContext) => MoveSideEffectOutcome | void;

// Wrapper methods for DamageMultiplierFunction and MoveSideEffect to add common conditionals.
export type MoveMultiplierWrapper = (pipelineStep: DamageMultiplierFunction) => DamageMultiplierFunction;
export type MoveSideEffectWrapper<SEType = PreMoveSideEffect | PostMoveSideEffect> = (effect: SEType) => SEType;


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
    tags?: MoveTags
    behaviors: {
        preEffect?: PreMoveSideEffect;
        damageMultipliers?: DamageMultiplierFunction;
        postEffect?: PostMoveSideEffect;
    }
}