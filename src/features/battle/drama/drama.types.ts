import { BattleEventPayload } from "@/core/battle/model/battleReactions"
import { RefRegistry } from "@/shared/utils/refRegistry";
import { BattleRefNames } from "../animation/uiAnimations/battleUIRefRegistry";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { ActionMessageAppender } from "../ui/ActionMessages";
import { OpponentProfile, PlayerProfile } from "../bridge/battleProfiles";
import { MoveLexicon } from "../lexicon/moveLexicon";
import { Sides } from "@/core/battle/utils/sides.utils";
import { MeltAnimationFn } from "@/shared/hooks/createMeltEffect";

/** Indicates the type of data that is handed to the drama to make decisions / branch responses */
export type DramaData = BattleEventPayload['MoveEnd'] & {
    // opponentProfile: OpponentProfile
    // playerProfile: PlayerProfile,
    profiles: {player: PlayerProfile, opponent: OpponentProfile}
    // compiled lexicon.
    lexicons: Sides<MoveLexicon>
}; // TODO: Indicate Game End State? Diff Drama for death.

/** Obligated UI actions. These can be executed early, or will be automatically done at the end of the drama if no drama code runs them. */
export type DramaObligations = {
    opponentDamage: () => void;
    playerDamage: () => void;
}

/** Utilities handed to the drama runner to perform various UI effects and animations */
export type DramaDependancies = {
    refRegistry: RefRegistry<BattleRefNames>,
    requestOverlayAnimation: OverlayAnimationRequester,
    appendActionMessage: ActionMessageAppender,
    fufillDramaObligation: DramaObligations,
    startMeltAnimation?: MeltAnimationFn
}

/** A DramaEntry represents a single "case" of a Dramatization action */
export interface DramaEntry {
    /** Relative position to other drama entries that also trigger -- higher numbers play later.
     * Entries that share the same place play simultaneously.
     * 
     * Make sure to use the {@link PLACES} enum for common base position constants.
     */
    place: number,
    /** Predicate function that determines if the DramaEntry should run given move clash state provided through data. */
    when: (data: DramaData) => boolean | undefined,
    /** Actual side-effect executing function to perform the dramatization associated with the condition/place above. */
    run: (deps: DramaDependancies, data: DramaData) => Promise<unknown> | void;

    /** Delay (in ms) before this entry will run if and only if some entry has already run before it. */
    preDelay?: number
}

export interface DramaTable {
    [id: string]: DramaEntry;
}

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

/** Dramatization for damage taken */
export type DamageDramaDependancies = Omit<DramaDependancies, 'fufillDramaObligation'>;
export type DamageDrama = (deps: DamageDramaDependancies) => Promise<void> | void;