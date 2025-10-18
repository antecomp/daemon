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

export enum MoveSideEffectOutcome {
    Success, Failure,
    /* Attempted */ // feel free to add more if needed.
}

export interface PreMoveContext {
    deps: BattleEngineDependencies;
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