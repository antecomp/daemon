import { BattleEventPayload } from "@/core/battle/model/battleReactions"
import { RefRegistry } from "@/shared/utils/refRegistry";
import { BattleRefNames } from "../animation/uiAnimations/battleUIRefRegistry";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { ActionMessageAppender } from "../ui/ActionMessages";
import { OpponentProfile, PlayerProfile } from "../bridge/battleProfiles";

/** Indicates the type of data that is handed to the drama to make decisions / branch responses */
type DramaData = BattleEventPayload['MoveEnd'] & {
    opponentProfile: OpponentProfile
    playerProfile: PlayerProfile
}; // TODO: Indicate Game End State? Diff Drama for death.

/** Obligated UI actions. These can be executed early, or will be automatically done at the end of the drama if no drama code runs them. */
type DramaObligations = {
    opponentDamage: () => void;
    playerDamage: () => void;
}

/** Utilities handed to the drama runner to perform various UI effects and animations */
type DramaDependancies = {
    refRegistry: RefRegistry<BattleRefNames>
    requestOverlayAnimation: OverlayAnimationRequester,
    appendActionMessage: ActionMessageAppender
    dramaObligations: DramaObligations
}

/** A DramaEntry represents a single "case" of a Dramatization action
 * 
 * It has a when clause to determine if it should run (predicate run given battle state through DramaData)
 * It has a run clause to perform the dramatization action.
 * It has a place clause to determine when to run this dramatization relative to others.
 * - NOTE TO SELF: MAKE SURE YOU ADD 1000N CONSTANTS FOR EASY SETTING OF WHEN TO RUN THESE DRAMAS.
 */
export interface DramaEntry {
    place: number,
    when: (data: DramaData) => boolean | undefined,
    run: (deps: DramaDependancies, data: DramaData) => Promise<unknown> | void;
}

export interface Drama {
    [id: string]: DramaEntry;
}

// Place constants for common placements.
// export const CLASH_ONE = 100;
// export const CLASH_TWO = 200;
// export const PRE_CLASH = 50;

export enum PLACES {
    /** Default "clash" point where attacks merge */
    CLASH_ONE = 100,
    /** Uncommon counter attack-style animation */
    CLASH_TWO = 200,
    /** Windup/Pre-clash animations. */
    PRE_CLASH = 50,
    /** Animations after any clashes */
    POST_CLASH = 300
}

// Maybe I can make POST_CLASH not play on death?