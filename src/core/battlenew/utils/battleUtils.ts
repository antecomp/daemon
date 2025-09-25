// TODO: EVENTUALLY YOU WILL WANT TO SPLIT THIS INTO SEPERATE UTILITY FUNCTION BY ROUGH DOMAIN PURPOSE. JUST GROUPING FOR NOW FOR ROUGH PROTOTYPING.

import { DamageMultipliers } from "../types/battle.types";
import { EffectOutcome, Move, MoveType, MultiplierPipelineContext, MultiplierPipelineStep, PreMoveContext } from "../types/move";

export function runMovePreEffects(move: Move, ctx: PreMoveContext): EffectOutcome | undefined {
    // If we hit any outcome while moving through the effect stream, we update this
    // last hit OUTCOME is what we'll actually return, or, if nobody had an outcome, we just spit out undefined.
    let rtnOutcome: EffectOutcome | undefined = undefined;

    // an idea is to have a transient outcome between effects in the stream (i.e use reduce)
    // so preEffects can communicate their result downstream
    // for now I am omitting this for simplicity, as I do not have a use case for such an idea (yet)
    move.behaviors.preEffects?.forEach(effect => {
        // run effect, if it has an output other than undefined, we update rtnOutcome, otherwise keep it the same.
        rtnOutcome = effect(ctx) ?? rtnOutcome;
    })

    return rtnOutcome;
}

/** Helper function to multiply "incoming" and "outgoing" for multiple multiplier sets. 
 * @param sets - The multiplier sets to combine.
 * @returns A single `DamageMultipliers` set with combined "incoming" and "outgoing" values.
*/
export function combineMultiplierSets(...sets: DamageMultipliers[]) {
    return sets.reduce((acc: DamageMultipliers, set) => {
        return {
            outgoing: acc.outgoing * set.outgoing,
            incoming: acc.incoming * set.incoming
        }
    }, {incoming: 1, outgoing: 1})
}

/** Base multiplier registry, these are used as the initial values for the multipliers in the mult pipeline (reduce).
 * 
 * If you create a new MoveType, you must add it here.
 */
const BASE_MULTIPLIERS: Record<MoveType, DamageMultipliers> = {
    [MoveType.Aggressive]: { incoming: 1, outgoing: 1 },
    [MoveType.Passive]: { incoming: 1, outgoing: 0 },
    [MoveType.Defensive]: { incoming: 1, outgoing: 0 },
    [MoveType.Overwhelming]: { incoming: 1, outgoing: 1 },
};

/** Get the base multipliers associated with a MoveType (aggressive, passive, defensive etc)
 * Used to get the initialMultipliers pushed to computeMoveMultipliers.
 */
export function getBaseMultipliers(type: MoveType): DamageMultipliers {
    return BASE_MULTIPLIERS[type];
}

function runMultiplierPipeline(pipeline: MultiplierPipelineStep[] | undefined, initialMultipliers: DamageMultipliers, ctx: MultiplierPipelineContext) {
    if(!pipeline) return initialMultipliers; // no pipeline to evaluate, just initial.

    return pipeline.reduce(
        (multAcc, step) => step(multAcc, ctx),
        initialMultipliers
    )
}

function computeStatusMultipliers(hvafaen?: unknown) {
    // do that lol
}

// goofy name cuz we can also just get the status mults here also
export function getPhaseMultipliers(move: Move, ctx: MultiplierPipelineContext) {
    const initialMultipliers = getBaseMultipliers(move.type);
    const moveMultipliers = runMultiplierPipeline(move.behaviors.multiplierPipeline, initialMultipliers, ctx);
    const statusMultipliers = computeStatusMultipliers();
}