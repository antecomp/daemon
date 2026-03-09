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

/** Move side effects can emit an outcome as an indicator of their result (f.e if evade rolled successfully). 
 * Passed as part of context to subsequent evaluation stages (multiplierPipeline, postEffect, move end emitter)
 * 
 * This outcome can also be tagged with a generic reason which can be used to hint to UI (or other handlers) the cause of the outcome setting.
 */
export type MoveSideEffectOutcome = {
    status: 'success' | 'failure' | 'meaningless',
    reason: "focus" | "rng" | "clash" | "mechanic" // add more as needed. consider merging focus as mechanic.
    //meta: unknown // extend this type with additional metadata if necessary. Try to avoid though.
}

/** Factory function to shorthand the creation of a new MoveSideEffectOutcome. */
export function reportMoveOutcome(status: MoveSideEffectOutcome['status'], reason: MoveSideEffectOutcome['reason']): MoveSideEffectOutcome {
    return { status, reason }
}

/** Required context for a Moves PreEffects (before mult calc) to run. */
export interface PreMoveContext {
    deps: BattleEngineDependencies;

    self: Combatant;
    them: Combatant;
    moves: {
        ours: Move,
        theirs: Move
    }
}

/** Required context for a moves damage multiplier computations. */
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


/** Wrapper for {@link DamageMultiplierFunction}, used to add common conditionals/modifications. */
export type MoveMultiplierWrapper = (pipelineStep: DamageMultiplierFunction) => DamageMultiplierFunction;
/** Wrapper for {@link PreMoveSideEffect} or {@link PostMoveSideEffect}, used to add common conditions/modifications. */
export type MoveSideEffectWrapper<SEType = PreMoveSideEffect | PostMoveSideEffect> = (effect: SEType) => SEType;


/**
 * Represents a battle move with a unique name, type, and associated behaviors.
 */
export interface Move {
    /** Move name used for internal tracking, comparison, and event mapping. */
    name: string;
    /** The type/category of the move. Used for logical checks and to set initial damage multipliers. */
    type: MoveType;
    /** Optional tagging of the move when it is the result of special instantiation (e.g mirror, repeat). */
    tags?: MoveTags
    /**
     * Optional hooks for move side effects and damage calculation:
     *   @method preEffect: Function executed before the move's main effect, i.e before the main "clash."
     *   @method damageMultipliers: Function to calculate damage multipliers. Multiplied with it's initial damage multipliers.
     *   @method postEffect: Function executed after the move's main effect and damages are dealt out.
     */
    behaviors: {
        preEffect?: PreMoveSideEffect;
        damageMultipliers?: DamageMultiplierFunction;
        postEffect?: PostMoveSideEffect;
    }
}