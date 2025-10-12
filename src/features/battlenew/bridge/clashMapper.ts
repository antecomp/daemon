import { DamageMultipliers } from "@/core/battlenew/model/battle"
import { MoveSideEffectOutcome } from "@/core/battlenew/model/move"
import { oppositeSide, Side, Sides } from "@/core/battlenew/utils/sides.utils"
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";

// Runs side effects like playing animations, sounds, whatever.
export type ClashReaction = (deps: {requestOverlayAnimation: OverlayAnimationRequester}, mults: Sides<DamageMultipliers>, outcomes: Sides<MoveSideEffectOutcome | undefined>) => void | Promise<void>;

export interface ClashMap {
    [myMove: string]: {
        [theirMove: string]: ClashReaction
        // will probably have a "_" default key for reaction to always happen regardless of interaction
    } | undefined
}

// Consider taking an input map later.
export async function runClashReaction(map: ClashMap, perspective: Side, moveNames: Sides<string>, mults: Sides<DamageMultipliers>, outcomes: Sides<MoveSideEffectOutcome | undefined>, deps: {requestOverlayAnimation: OverlayAnimationRequester}) {
    const ourTable = map[moveNames[perspective]];
    if (!ourTable) return;
    
    await ourTable["_"]?.(deps, mults, outcomes); // Default behavior tagged with "_"
    await ourTable[moveNames[oppositeSide(perspective)]]?.(deps, mults, outcomes);
}

export function hasClashReaction(map: ClashMap, perspective: Side, moveNames: Sides<string>) {
    const ourTable = map[moveNames[perspective]];
    if (!ourTable) return false;

    const defaultReaction = ourTable['_'];
    const pairReaction = ourTable[moveNames[oppositeSide(perspective)]];

    return (defaultReaction != undefined) || (pairReaction != undefined);
}