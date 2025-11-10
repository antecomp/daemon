import { MoveSignal, MoveSignalOf } from "@/core/battle/model/move.types"
import { ActionMessageAppender } from "../bridge/actionMessages";
import { Side, Sides } from "@/core/battle/utils/sides.utils";
import { MoveLexeme, MoveLexicon } from "../lexicon/moveLexicon";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { capitalizeFirstLetter } from "@/shared/utils/stringUtils";

export type EmissionSEDeps = {
    appendActionMessage: ActionMessageAppender,
    requestOverlayAnimation: OverlayAnimationRequester,
    /** Optional hook that replays the default emission behavior for the signal currently being handled.
     * Namely used for opponentProfiles override with moveEmissionHandlers. Can be used to conditionally override (fallback to default).
     */
    defaultSE?: () => void
}

export type EmissionSECTX = {
            perspective: Side, 
            moveName: string, 
            nameOfAffected(flip?: true): string, 
            lexicons: Sides<MoveLexicon>
            // opponentProfile?
}

/** A record that maps different potential move emisissions to a method for running various UI-based side effects.
 * Each method takes
 * - `payload` : payload associated with that emission (ref: moves.types.ts)
 * - `deps` : Dependencies for running UI side effects (action messages and animation requester)
 * - `ctx` : Additional context for side effect logic.
 */
export type EmissionSEMap<T extends keyof MoveSignalMap = keyof MoveSignalMap> = Partial<{
    [K in T]: (
        payload: MoveSignalOf<K>['payload'], 
        deps: EmissionSEDeps, 
        ctx: EmissionSECTX
    ) => void;
}>;


/**
 * A read-only map of side-effect handlers keyed by emission identifiers. Each
 * handler is invoked when the corresponding emission is produced by a move
 * and is responsible for appending action messages and/or triggering minor
 * presentation-related side effects.
 *
 * General handler signature:
 * (payload, helpers, meta)
 * - payload: emission-specific data (shape varies per emission key).
 * - helpers: runtime utilities, e.g. `appendActionMessage(message: string, tag?: string)`.
 * - meta: contextual information about the move and affected entity, e.g.
 *   `nameOfAffected(): string`, `moveName`, `lexicons`, `perspective`.
 * Notes:
 * - Messages are created using the provided `nameOfAffected()` callback to ensure
 *   correct, lazily-evaluated entity naming and perspective handling.
 */
export const DEFAULT_MOVE_EMISSION_SIDE_EFFECTS = {
    'effect:heal'({amount, capped}, {appendActionMessage}, {nameOfAffected}) {
        if(capped) {
            appendActionMessage(`${nameOfAffected()}'s health is maxxed out!`, 'heal');
        } else {
            appendActionMessage(`${nameOfAffected()} healed for ${amount}`, 'heal');
        }
    },

    'mechanic:focus'({lost}, {appendActionMessage}, {moveName, lexicons, nameOfAffected, perspective}){
        if(lost) {
            appendActionMessage(
                `${nameOfAffected()} lost focus and was unable to use ` +
                capitalizeFirstLetter(lexicons[perspective][moveName as MoveLexeme].label)
            )
        }
    },

    'mechanic:mania'({manic}, {appendActionMessage}, {nameOfAffected}) {
        if(manic) {
            appendActionMessage(`${nameOfAffected()} dodges swiftly. ${nameOfAffected()} feels invigorated!`, 'mania');
        }
    },

    'status:prepare'({level}, {appendActionMessage}, {nameOfAffected}) {
        switch(level) {
            case 1: appendActionMessage(`${nameOfAffected()}'s vision narrows`, 'focus'); break;
            case 2: appendActionMessage(`${nameOfAffected()} is ready for anything`, 'focus'); break;
        }
    }
} as const satisfies EmissionSEMap


/** Need this evil helper because Typescript type narrowing is evil & broken sometimes.
 * Maps a Move Emission signal to it's associated side effect method and runs it.
 */
export function runEmissionSE<S extends MoveSignal>(
    map: EmissionSEMap,
    signal: S,
    deps: EmissionSEDeps,
    ctx: EmissionSECTX
) {
    const fn = map[signal.type] as
        | ((payload: S['payload'], d: EmissionSEDeps, c: EmissionSECTX) => void)
        | undefined;
    fn?.(signal.payload, deps, ctx);
}
