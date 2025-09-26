// TODO: EVENTUALLY YOU WILL WANT TO SPLIT THIS INTO SEPERATE UTILITY FUNCTION BY ROUGH DOMAIN PURPOSE. JUST GROUPING FOR NOW FOR ROUGH PROTOTYPING.

import { DamageMultipliers } from "../types/battle.types";
import { Combatant } from "../types/combatant";
import { Move, MoveType, DamageMultiplierContext, DamageMultiplierFunction, PreMoveContext, PostMoveContext, PlannedSequence } from "../types/move";
import { Status } from "../types/status";

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
function computeStatusMultipliers(statusList: [Status, number][]) {
    return statusList.reduce(
        (multacc, [status, level]) => combineMultiplierSets(multacc, status.getStatusMultipliers(level)),
        PASSTHROUGH_MULTPLIERS
    )
}

// goofy name cuz we can also just get the status mults here also
export function getPhaseMultipliers(move: Move, ctx: DamageMultiplierContext) {
    const initialMultipliers = getBaseMultipliers(move.type);
    const moveMulitpliers = move.behaviors.damageScaling?.(ctx) ?? {incoming: 1, outgoing: 1}; // <- make this a const later.
    const statusMultipliers = computeStatusMultipliers(ctx.self.activeStatuses);

    return combineMultiplierSets(initialMultipliers, moveMulitpliers, statusMultipliers)
}


/**
 * Cross-multiplies player and opponent multipliers and performs corresponding .takeDamage on each actor.
 */
export function calculateAndApplyDamage(player: Combatant, opponent: Combatant, multipliers:{opponent: DamageMultipliers, player: DamageMultipliers}) {
    const playerDamageDealt = multipliers.player.outgoing * multipliers.opponent.incoming;
    const opponentDamageDealt = multipliers.opponent.outgoing * multipliers.player.incoming;

    opponent.takeDamage(playerDamageDealt);
    player.takeDamage(opponentDamageDealt);

    return {player: playerDamageDealt, opponent: opponentDamageDealt};
}

export function runMovePreEffect(move: Move, context: PreMoveContext) {
    return move.behaviors.preEffect?.(context);
}

export function runMovePostEffect(move: Move, context: PostMoveContext) {
    return move.behaviors.postEffect?.(context);
}

// helpers here for laziness, ofc we will want to move this all (to probably a BattleUtils class as a bunch of static methods)
export function initializePlannedMoves(myPlan: PlannedSequence, theirPlan: PlannedSequence) {
    if(myPlan.some(plannedMove => !(plannedMove.canPerform?.(myPlan) ?? true))) throw new Error("Plan contains illegal move by canPerform ruleset " + myPlan);
    return myPlan.map((plannedMove, index) => plannedMove.instantiate({ myPlan, theirPlan, index }));
}
