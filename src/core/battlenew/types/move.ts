import { AssetURL } from "@/shared/types/misc.types";
import { Combatant } from "./combatant";
import { DamageMultipliers } from "./battle.types";

/**
 * Represents the type of a move, which determines its behavior (base multipliers) and interaction
 * with other moves during a battle sequence.
 */
export enum MoveType {
    Aggressive, Passive, Defensive, Overwhelming
}

export enum MoveOutcome {
    Attempted, Success, Failure
}

export interface MoveContext {
    self: Combatant;
    opponent: Combatant;
    sequence: Move[];
    index: number;
    // new idea in testing - communicate outcome instead of using sequenceBuffer. This will be mutated by pre/post effects
    // Can be read by mult pipeline to (purely) change move outcomes (instead of gambling direcrly inside evades pipeline step and running side effects!!!)
    // Also will be forwarded to appropriate hooks (i.e animations/sounds) so they can use that for conditional changes.
    outcome?: MoveOutcome
    // perspective only needed by animations - we can engineer a better system. Shouldn't be in the basic interface.
    // since animator pulled out anyways, we could just have a PlayerAnimator and OpponentAnimator that takes in the respective contexts and
    // discerns by nature that they only get one context and serve different purposes. Could get messy with lining up animation timing tho...
}

// Is this a good name? Maybe change;
export interface ClashResult {
    damageDealt: number; 
    damageTaken: number; 
    ourMults: DamageMultipliers;
    theirMults: DamageMultipliers;
}

// consider changing this PostMove___ naming scheme, its hard to intuit what that actually means.
export type PostMoveContext = MoveContext & ClashResult;
export type MoveSideEffect = (context: MoveContext) => void;
export type PostMoveSideEffect = (context: MoveContext) => void;

export type MultiplierPipelineStep = (prevMultipliers: DamageMultipliers, context: MoveContext) => DamageMultipliers;

export type MovePipelineStepConditionalWrapper = (pipelineStep: MultiplierPipelineStep) => MultiplierPipelineStep;
export type MoveSideEffectConditionalWrapper<SEType = MoveSideEffect | PostMoveSideEffect> = (effect: SEType) => SEType;

export interface Move {
    name: string; // Used for internal tracking / comparison. Not UI. Should rarely be used.
    type: MoveType;

    // dont forget that through each behavior now, we
    // want moves to carry a transient outcome that can be used
    // to communicate status between stages.
    // no need for immediate post effects.
    behaviors: {
        preEffects?: MoveSideEffect[];
        multiplierPipeline: MultiplierPipelineStep[];
        postEffects?: PostMoveSideEffect[];
    }
    // do not put animations here. We should instead have a reactionary animation system, instead of encoding the logic into the move itself.
    // these should remain relative primitive to just perform battle LOGIC!
}

export type MoveValidator = (workingSequence: DynamicMove[]) => boolean;
export type DynamicMoveInstantiator = (
    context: {
        mySequence: DynamicMove[],
        theirSequence: DynamicMove[]
        // Feel free to add more. But this is all we need for now.
    }
) => Move;

export interface DynamicMove {
    // used so DynamicMoves can communicate what they are for logical checks. Also not the display name. Consider changing this property name to something else.
    name: string;
    canPerform?: MoveValidator;
    // consider just DynamicMoveInstantiator and just
    // having generic moves just () => Move.
    // slightly more boilerplatey look but meh.
    //instantiate: Move | DynamicMoveInstantiator
    instantiate: DynamicMoveInstantiator
}

export interface MoveMeta extends DynamicMove {
    displayName: string;
    icon: AssetURL;
    description?: AssetURL;
}

export interface PlayerMoveMeta extends MoveMeta {
    rbIcon: string;
    description: string; // required
}