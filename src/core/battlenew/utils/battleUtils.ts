// TODO: EVENTUALLY YOU WILL WANT TO SPLIT THIS INTO SEPERATE UTILITY FUNCTION BY ROUGH DOMAIN PURPOSE. JUST GROUPING FOR NOW FOR ROUGH PROTOTYPING.

import { DamageMultipliers } from "../types/battle.types";
import { Move, MoveType, DamageMultiplierContext, DamageMultiplierFunction } from "../types/move";

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

export const PASSTHROUGH_MULTPLIERS: DamageMultipliers = {incoming: 1, outgoing: 1};

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
function computeStatusMultipliers(hvafaen?: unknown) {
    // do that lol
}

// goofy name cuz we can also just get the status mults here also
export function getPhaseMultipliers(move: Move, ctx: DamageMultiplierContext) {
    const initialMultipliers = getBaseMultipliers(move.type);
    const moveMulitpliers = move.behaviors.damageScaling?.(ctx) ?? {incoming: 1, outgoing: 1}; // <- make this a const later.
    const statusMultipliers = computeStatusMultipliers();

    return combineMultiplierSets(initialMultipliers, moveMulitpliers, statusMultipliers)
}