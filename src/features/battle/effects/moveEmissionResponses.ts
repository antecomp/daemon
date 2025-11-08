import { MoveSignal, MoveSignalOf } from "@/core/battle/model/move.types"
import { ActionMessageAppender } from "../bridge/actionMessages";
import { Side, Sides } from "@/core/battle/utils/sides.utils";
import { MoveLexemes, MoveLexicon } from "../lexicon/moveLexicon";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { capitalizeFirstLetter } from "@/shared/utils/stringUtils";

export type EmissionSEDeps = {
    appendActionMessage: ActionMessageAppender,
    requestOverlayAnimation: OverlayAnimationRequester
}

export type EmissionSECTX = {
            perspective: Side, 
            moveName: string, 
            nameOfAffected(flip?: true): string, 
            lexicons: Sides<MoveLexicon>
            // opponentProfile?
}

export type EmissionSEMap<T extends keyof MoveSignalMap = keyof MoveSignalMap> = Partial<{
    [K in T]: (
        payload: MoveSignalOf<K>['payload'], 
        deps: EmissionSEDeps, 
        ctx: EmissionSECTX
    ) => void;
}>;

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
                capitalizeFirstLetter(lexicons[perspective][moveName as MoveLexemes].label)
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


// fucked up evil helper to get the types to be compat.
// I have no idea why this works.
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