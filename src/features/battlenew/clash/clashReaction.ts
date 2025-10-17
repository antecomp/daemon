import { DamageMultipliers } from "@/core/battlenew/model/battle";
import { MoveSideEffectOutcome } from "@/core/battlenew/model/move";
import { Sides } from "@/core/battlenew/utils/sides.utils";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { Combatant } from "@/core/battlenew/model/combatant";

export type ClashReactionDeps = {requestOverlayAnimation: OverlayAnimationRequester}
export type ClashReactionCTX = {
        combatants: Sides<Combatant>,
        mults: Sides<DamageMultipliers>,
        outcomes: Sides<MoveSideEffectOutcome | undefined>,
        moveNames: Sides<string>
}

export type ClashReaction = (
    deps: ClashReactionDeps,
    ctx: ClashReactionCTX
) => Promise<void>;

export type ClashReactionEntry = {
    perform: ClashReaction,
    place: number
}

export interface ClashReactionMap {
    [moveName: string]: ClashReactionEntry
}

// Messy but good enough for now.
export async function runClashReactionsByPlacement(player: ClashReactionEntry | undefined, opponent: ClashReactionEntry | undefined, deps: ClashReactionDeps, ctx: ClashReactionCTX) {
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