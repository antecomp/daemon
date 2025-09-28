import { AssetURL } from "@/shared/types/misc.types";
import { Combatant } from "./combatant";
import { DamageMultipliers } from "./battle.types";
import { Sides } from "../utils/sideUtils";

/**
 * Represents the type of a move, which determines its behavior (base multipliers) and interaction
 * with other moves during a battle sequence.
 */
export enum MoveType {
    Aggressive, Passive, Defensive, Overwhelming
}

// new idea in testing - communicate outcome instead of using sequenceBuffer. This will be set by the return of pre/post effects.
// Can be read by mult pipeline to (purely) change move outcomes (instead of gambling direcrly inside evades pipeline step and running side effects!!!)
// Also will be forwarded to appropriate hooks (i.e animations/sounds) so they can use that for conditional changes.
// perspective only needed by animations - we can engineer a better system. Shouldn't be in the basic interface.
// since animator pulled out anyways, we could just have a PlayerAnimator and OpponentAnimator that takes in the respective contexts and
// discerns by nature that they only get one context and serve different purposes. Could get messy with lining up animation timing tho...
export enum EffectOutcome {
    Attempted, Success, Failure
}

export interface PreMoveContext {
    self: Combatant;
    opponent: Combatant;
    moves: Sides<Move>
    //sequence: Move[];
}

export interface DamageMultiplierContext extends PreMoveContext {
    preEffectOutcome: EffectOutcome | undefined;
}

// Is this a good name? Maybe change;
export interface ClashResult {
    damageDealt: number; 
    damageTaken: number; 
    ourMults: DamageMultipliers;
    theirMults: DamageMultipliers;
}

export type PostMoveContext = DamageMultiplierContext & ClashResult;

export type EndOfMoveContext = PostMoveContext & {postEffectOutcome: EffectOutcome | undefined}

// consider changing this PostMove___ naming scheme, its hard to intuit what that actually means.
export type PreMoveSideEffect       = (context: PreMoveContext) => EffectOutcome | void; // have these saved to context as seperate outcomes!
export type DamageMultiplierFunction  = (context: DamageMultiplierContext) => DamageMultipliers;
export type PostMoveSideEffect      = (context: PostMoveContext) => EffectOutcome | void; // have these saved to context as seperate outcomes!

export type MoveMultiplierConditionalWrapper = (pipelineStep: DamageMultiplierFunction) => DamageMultiplierFunction;
export type MoveSideEffectConditionalWrapper<SEType = PreMoveSideEffect | PostMoveSideEffect> = (effect: SEType) => SEType;

export interface Move {
    name: string; // Used for internal tracking / comparison. Not UI. Should rarely be used.
    type: MoveType;

    // dont forget that through each behavior now, we
    // want moves to carry a transient outcome that can be used
    // to communicate status between stages.
    // no need for immediate post effects.
    // only need single function for each of these, if you need a pipeline reduce with a helper instead
    // all existing move implementations only had a single one of these (or could be coerced into requiring just a single of each)
    behaviors: {
        preEffect?: PreMoveSideEffect;
        damageMultipliers?: DamageMultiplierFunction;
        postEffect?: PostMoveSideEffect;
    }
    // do not put animations here. We should instead have a reactionary animation system, instead of encoding the logic into the move itself.
    // these should remain relative primitive to just perform battle LOGIC!
}

export type MoveValidator = (workingPlan: PlannedMove[], index: number) => boolean;
export type PlannedMoveInstantiator = (
    context: {
        myPlan: PlannedMove[],
        theirPlan: PlannedMove[]
        index: number
        // Feel free to add more. But this is all we need for now.
    }
) => Move;

export interface PlannedMove {
    // used so DynamicMoves can communicate what they are for logical checks. Also not the display name. Consider changing this property name to something else.
    name: string;
    canPerform?: MoveValidator;
    // consider just DynamicMoveInstantiator and just
    // having generic moves just () => Move.
    // slightly more boilerplatey look but meh.
    //instantiate: Move | DynamicMoveInstantiator
    instantiate: PlannedMoveInstantiator
}

export type PlannedSequence = PlannedMove[];

// For the UI, we will do a mapping of DynamicMove to presentation data (MoveMeta)
// keep it all as just logic!
// ^- this feels fucking stupid. How am I supposed to easily send off a sequence now?? I get the idea but you need to figure that shit all out again lol.

export interface MoveMeta {
    displayName: string;
    icon: AssetURL;
    description?: AssetURL;
}

export interface PlayerMoveMeta extends MoveMeta {
    rbIcon: string;
    description: string; // required
}