import { Actor } from "../engine/actor";
import { MultiplierSet } from "../engine/battle.types";


/**
 * Runs post-effects (if any) for each status instance on an actor.
 * Executes the post-effect of the first status in each stack, providing a "level" (stack depth) to the postEffect handler.
 * @param actor - The actor whose statuses are being processed.
 * @param opponent - The opposing actor.
 */
function performStatusPostEffects(actor: Actor, opponent: Actor) {
    for (const [_type, statusStack] of actor.statuses) {
        const stackCount = statusStack.length;
        if (stackCount > 0) {
            statusStack[0].applyPostEffect?.(actor, opponent, stackCount);
        }
    }
}

/**
 * Performs any post effects (as in, after main damage calculation) associated with the player and opponents statuses, then ticks the statuses down.
 */

export function resolveStatuses(player: Actor, opponent: Actor) {
    performStatusPostEffects(player, opponent);
    performStatusPostEffects(opponent, player);

    player.tickAndRemoveStatuses();
    opponent.tickAndRemoveStatuses();
}

/** Iterates through an actors current statuses, executing their getStatusMultipliers.
 * If multiple of the same status is applied, the multiplier function is still only run once, but it is passed
 * the number of duplicate instances of that current status at that time.
 */
export function computeStatusMultipliers(actor: Actor): MultiplierSet {
    let incoming = 1;
    let outgoing = 1;

    for (const [_type, statusStack] of actor.statuses) {
        const stackCount = statusStack.length;
        if (stackCount > 0) {
            const statusMults = statusStack[0].getStatusMultipliers(stackCount);
            incoming *= statusMults.incoming;
            outgoing *= statusMults.outgoing;
        }
    }

    return { incoming, outgoing };
}