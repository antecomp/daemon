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
import { OpponentProfile } from "../bridge/battleProfiles";
import { SparseRecord } from "@/shared/types/misc.types";

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

export type MoveUISideEffectMap = SparseRecord<string, MoveUISideEffectEntry[]>

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

export type MoveUISideEffectOverride = 
    | {replace: MoveUISideEffectEntry[] }    // full replacement
    | {add: MoveUISideEffectEntry[]};                       // append/merge


export type OpponentMoveOverrides = Record<string, MoveUISideEffectOverride>;

export function applyMoveUISEOverrides(
  base: MoveUISideEffectMap,
  opponent: OpponentProfile
): MoveUISideEffectMap {
  if (!opponent.display.moveUISideEffectOverrides) return base;

  const result: MoveUISideEffectMap = { ...base };
  for (const [move, ov] of Object.entries(opponent.display.moveUISideEffectOverrides)) {
    const baseEntries = result[move] ?? [];

    if ('replace' in ov) {
      result[move] = [...ov.replace];
    } else if ('add' in ov) {
      result[move] = [...baseEntries, ...ov.add];
    }
  }
  return result;
}