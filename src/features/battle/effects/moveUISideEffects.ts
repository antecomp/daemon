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

export type MoveUISideEffectDeps = {requestOverlayAnimation: OverlayAnimationRequester}
export type MoveUISideEffectCTX = {
        combatants: Sides<Combatant>,
        mults: Sides<DamageMultipliers>,
        outcomes: Sides<MoveSideEffectOutcome | undefined>,
        plannedMoveNames: Sides<string>,
        plannedSequences: Sides<PlannedSequence>,
        moveIndex: number,
        moveTags: Sides<MoveTags>
}

export type MoveUISideEffect = (
    deps: MoveUISideEffectDeps,
    ctx: MoveUISideEffectCTX
) => Promise<void>;

export type MoveUISideEffectEntry = {
    perform: MoveUISideEffect,
    place: number
}

export interface MoveUISideEffectMap {
    [moveName: string]: MoveUISideEffectEntry
}

// Messy but good enough for now.
export async function runMoveUISideEffectsByPlacement(player: MoveUISideEffectEntry | undefined, opponent: MoveUISideEffectEntry | undefined, deps: MoveUISideEffectDeps, ctx: MoveUISideEffectCTX) {
    if(!player) { return opponent?.perform(deps, ctx); }
    if(!opponent) {return player.perform(deps, ctx); }

    if(player.place == opponent.place) {
        // Should run simultaneously.
        const p1 = player.perform(deps, ctx);
        const p2 = opponent.perform(deps,ctx)
        await Promise.all([p1, p2]);
        return;
    }

    const [first, second] = player.place < opponent.place ? [player, opponent] : [opponent, player];

    await first.perform(deps, ctx);
    await second.perform(deps, ctx);
}