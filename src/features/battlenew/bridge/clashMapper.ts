import { DamageMultipliers } from "@/core/battlenew/model/battle"
import { MoveSideEffectOutcome } from "@/core/battlenew/model/move"
import { Sides } from "@/core/battlenew/utils/sides.utils"
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { STOCK_CLASH_REACTIONS } from "./clashReactionDefinitions";

// Runs side effects like playing animations, sounds, whatever.
export type ClashReaction = (deps: {requestOverlayAnimation: OverlayAnimationRequester}, mults: Sides<DamageMultipliers>, outcomes: Sides<MoveSideEffectOutcome | undefined>) => void;

export interface ClashMap {
    [playerMove: string]: {
        [opponentMove: string]: ClashReaction
        // will probably have a "_" default key for reaction to always happen regardless of interaction
    } | undefined
}

// Consider taking an input map later.
export function runClashReaction(moveNames: Sides<string>, mults: Sides<DamageMultipliers>, outcomes: Sides<MoveSideEffectOutcome | undefined>, deps: {requestOverlayAnimation: OverlayAnimationRequester}) {
    const playerTable = STOCK_CLASH_REACTIONS[moveNames.player];
    if (!playerTable) return;
    playerTable["_"]?.(deps, mults, outcomes); // Default behavior tagged with "_"
    playerTable[moveNames.opponent]?.(deps, mults, outcomes);
}