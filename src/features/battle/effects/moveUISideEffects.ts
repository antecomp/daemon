/**@fileoverview
 * MoveUISideEffects UI-based side effects that are called when a certain move occurs.
 * This is used to inject stuff like animations, sound effects, and other events for moves.
 */

import { DamageMultipliers } from "@/core/battle/model/battle";
import { MoveSideEffectOutcome, MoveTags } from "@/core/battle/model/move";
import { Sides } from "@/core/battle/utils/sides.utils";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { Combatant } from "@/core/battle/model/combatant";
import { PlannedSequence } from "@/core/battle/model/plannedMove";
import { ActionMessageAppender } from "../bridge/actionMessages";

export type MoveUISideEffectDeps = {
    requestOverlayAnimation: OverlayAnimationRequester,
    appendActionMessage: ActionMessageAppender
}

export type MoveUISideEffectCTX = {
        combatants: Sides<Combatant>,
        damageMultipliers: Sides<DamageMultipliers>,
        preEffectOutcomes: Sides<MoveSideEffectOutcome | undefined>,
        moveNames: Sides<string>,
        plannedSequences: Sides<PlannedSequence>,
        moveIndex: number,
        moveTags: Sides<MoveTags>
}

export type MoveUISideEffect = (
    deps: MoveUISideEffectDeps,
    ctx: MoveUISideEffectCTX
) => Promise<void> | void;

export type MoveUISideEffectEntry = {
    place: number,
    run: MoveUISideEffect,
    when?: (ctx: MoveUISideEffectCTX) => boolean,
}

export type MoveUISideEffectMap = Record<string, MoveUISideEffectEntry[]>

// Messy but good enough for now.
// export async function runMoveUISideEffectsByPlacement(player: MoveUISideEffectEntry | undefined, opponent: MoveUISideEffectEntry | undefined, deps: MoveUISideEffectDeps, ctx: MoveUISideEffectCTX) {
//     if(!player) { return opponent?.run(deps, ctx); }
//     if(!opponent) {return player.run(deps, ctx); }

//     if(player.place == opponent.place) {
//         // Should run simultaneously.
//         const p1 = player.run(deps, ctx);
//         const p2 = opponent.run(deps,ctx)
//         await Promise.all([p1, p2]);
//         return;
//     }

//     const [first, second] = player.place < opponent.place ? [player, opponent] : [opponent, player];

//     await first.run(deps, ctx);
//     await second.run(deps, ctx);
// }

export async function runMoveUISideEffects(
    entries: MoveUISideEffectEntry[],
    deps: MoveUISideEffectDeps,
    ctx: MoveUISideEffectCTX
): Promise<void> {
    const filtered = entries.filter(e => (e.when ? e.when(ctx) : true));

    // group by placement
    const groups = new Map<number, MoveUISideEffectEntry[]>();
    for(const e of filtered) {
        const list = groups.get(e.place) ?? [];
        list.push(e);
        groups.set(e.place, list);
    }

    // ascending order of places.
    const orderedPlaces = [...groups.keys()].sort((a, b) => a - b);

    // sequential run; same placements run simultaneously.
    for(const p of orderedPlaces) {
        const samePlace = groups.get(p)!;
        await Promise.all(
            samePlace.map(async (e) => {
                try {
                    await e.run(deps, ctx);;
                } catch (err) {
                    // a side effect error is inconsequential to me. Log & Ignore :)
                    console.error('[MoveUISideEffects] Side Effect Failed.', {place: p, e, err});
                }
            })
        );
    }
}