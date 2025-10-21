import { DamageMultipliers, PASSTHROUGH_MULTPLIERS } from "../model/battle";
import { Combatant } from "../model/combatant";
import { Move, MoveType, DamageMultiplierContext, PreMoveContext, PostMoveContext, MoveSideEffectOutcome } from "../model/move";
import { PlannedSequence } from "../model/plannedmove";
import { Status } from "../model/status";
import { Sides } from "./sides.utils";

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
    }, PASSTHROUGH_MULTPLIERS)
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


/**
 * Computes the combined status multipliers from a list of status-level pairs.
 *
 * Iterates through each `[Status, number]` tuple in the provided `statusList`,
 * retrieves the multipliers for each status at the given level using `getStatusMultipliers`,
 * and combines them using `combineMultiplierSets`. The combination starts from
 * the `PASSTHROUGH_MULTPLIERS` as the initial accumulator.
 *
 * @param statusList - An array of tuples, where each tuple contains a `Status` object and a corresponding level (`number`). <- this is returned by combatant's `getStatuses()` method.
 * @returns The resulting combined multipliers after applying all statuses in the list.
 */
export function computeStatusMultipliers(statusList: [Status, number][]) {
    return statusList.reduce(
        (multacc, [status, level]) => combineMultiplierSets(multacc, status.getStatusMultipliers(level)),
        PASSTHROUGH_MULTPLIERS
    )
}

/* Simple method to group and combine all multiplier calculations together. */
export function getPhaseMultipliers(move: Move, ctx: DamageMultiplierContext) {
    const initialMultipliers = getBaseMultipliers(move.type);
    const moveMulitpliers = move.behaviors.damageMultipliers?.(ctx) ?? PASSTHROUGH_MULTPLIERS;
    const statusMultipliers = computeStatusMultipliers(ctx.self.activeStatuses);

    return combineMultiplierSets(initialMultipliers, moveMulitpliers, statusMultipliers)
}


/**
 * Cross-multiplies player and opponent multipliers and performs corresponding .takeDamage on each actor.
 */
export function calculateAndApplyDamage({player, opponent}: Sides<Combatant>, multipliers:{opponent: DamageMultipliers, player: DamageMultipliers}) {
    const playerDamageDealt = multipliers.player.outgoing * multipliers.opponent.incoming;
    const opponentDamageDealt = multipliers.opponent.outgoing * multipliers.player.incoming;

    opponent.takeDamage(playerDamageDealt);
    player.takeDamage(opponentDamageDealt);

    return {player: playerDamageDealt, opponent: opponentDamageDealt};
}


// Move these below to a move utils file?
export function runMovePreEffect(move: Move, context: PreMoveContext): MoveSideEffectOutcome | undefined {
    return move.behaviors.preEffect?.(context) ?? undefined;
}

export function runMovePostEffect(move: Move, context: PostMoveContext): MoveSideEffectOutcome | undefined {
    return move.behaviors.postEffect?.(context) ?? undefined;
}

export function initializePlannedMoves(myPlan: PlannedSequence, theirPlan: PlannedSequence) {
    if(myPlan.some((plannedMove) => !(plannedMove.canPerform?.(myPlan) ?? true))) throw new Error("Plan contains illegal move by canPerform ruleset " + myPlan);
    return myPlan.map((plannedMove, index) => plannedMove.instantiate({ myPlan, theirPlan, index }));
}