import { createBattleEngine } from "@/core/battle/engine/battleEngine";
import { BattleReactions } from "@/core/battle/model/battleReactions";
import { BattleOutcome, DamageMultipliers, ZERO_MULTIPLIERS_BY_SIDE } from "@/core/battle/model/battle";
import { createRefRegistry } from "@/shared/utils/refRegistry";
import sleep from "@/shared/utils/sleep";
import { Accessor, createContext, createSignal, onMount, useContext } from "solid-js";
import { BattleRefNames } from "../animation/uiAnimations/battleUIRefRegistry";
import battleUIAnimations from "../animation/uiAnimations/battleUIAnimations";
import { playSound } from "@/shared/utils/playSound";
import { MeltAnimationFn } from "@/shared/hooks/createMeltEffect";

import opponent_pain_sfx from "@/assets/sfx/battle/pain.wav";
import player_pain_sfx from "@/assets/sfx/battle/player_pain.wav"
import { mapSides, Sides } from "@/core/battle/utils/sides.utils";
import { AssetURL } from "@/shared/types/misc.types";
import { generateHint, getStatusIconsOfCombatant } from "./battleEngineBridge.util";
import { BATTLE_END_SLEEP_TIME, MOVE_DELAY, MOVE_INIT_DELAY, PRE_ANIMATION_DELAY } from "../config/timings.config";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { applyMoveUISEOverrides, runMoveUISideEffects } from "../effects/moveUISideEffects";
import { DEFAULT_OPPONENT_MOVE_UI_EFFECTS, PLAYER_MOVE_UI_EFFECTS } from "../effects/moveUISideEffectDefinitions";
import { MoveLexeme } from "../lexicon/moveLexicon";
import { OpponentDisplayBehaviorDeps, OpponentDisplayPredicateArgs, OpponentProfile } from "./battleProfiles";

import opponent_death_sound from '@/assets/sfx/battle/opponent_death.wav'
//import opponent_death_sound from '@/assets/sfx/battle/yeouch.ogg'
import { Combatant } from "@/core/battle/model/combatant";
import attachToConsole from "@/devtools/attachToConsole";
import { MoveTags } from "@/core/battle/model/move.types";
import { createActionMessageStack } from "../ui/ActionMessages";
import battleOpeningAnimation from "../animation/battle-opening-animation";
import pickRandom from "@/shared/utils/pickRandom";

const OPPONENT_PAIN_IMPORT = import.meta.glob<AssetURL>('@/assets/sfx/battle/yeah/*.ogg', {
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, AssetURL>

const OPPONENT_PAIN_SOUNDS: AssetURL[] = [];
for(const [_k, i] of Object.entries(OPPONENT_PAIN_IMPORT)) {
    OPPONENT_PAIN_SOUNDS.push(i)
} 

/** UI States for various stages in battle execution, used to conditionally lock some components. */
export enum BattleUIState {
    /** Openining Prompt */
    INIT,
    /** Opening Animation */
    OPENING,
    /** Waiting for user input (building sequence) */
    WAITING,
    /** User input of correct size, waiting for "execute" */
    READY,
    /** Running the clashes, animations and whatnot, (round execute) */
    EXECUTING,
    /** Battle end state, (temporary lock while closing animation plays) */
    END
}

interface BattleUIStateMachine {
    battleUIState: Accessor<BattleUIState>;
    setBattleUIState: (newState: BattleUIState) => void;
}

export const BattleUIStateContext = createContext<BattleUIStateMachine>();

/**
 * Hook that wraps useContext(BattleUIStateContext) to subscribe to current BattleUIState.
 *
 * Throws error if context cannot be obtained.
 */
export const useBattleUIState = () => {
    const context = useContext(BattleUIStateContext);
    if (!context) throw new Error("useBattleUIState must be within BattleUIState provider (Battle Component)");
    return context;
};

/** Contained helper to manage a battleEngine instance and translate emissions to changes in Solid (UI) signals and other UI-based side effects. */
export function createUIBridgedBattleEngine(
    opponentProfile: OpponentProfile,
    deps: {
        startMeltAnimation?: MeltAnimationFn,
        requestOverlayAnimation: OverlayAnimationRequester
    },
    config: {
        onEnd: (res: BattleOutcome) => void,
        skipOpeningAnimation?: boolean
    }
) {

    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.INIT);

    // Keeping these seperate instead of using Sides as they are forwarded to different UI components.
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(100);
    const [opponentHealthPercentage, setOpponentHealthPercentage] = createSignal(100);

    const [currentStatusIcons, setCurrentStatusIcons] = createSignal<Sides<(AssetURL | undefined)[]>>({ player: [], opponent: [] });

    function refreshCombatantInfo(combatants: Sides<Combatant>) {
        setOpponentHealthPercentage(combatants.opponent.healthPercent);
        setPlayerHealthPercentage(combatants.player.healthPercent);
        setCurrentStatusIcons(
            mapSides(combatants, combatant => getStatusIconsOfCombatant(combatant))
        );
    };

    const [opponentPlanPreview, setOpponentPlanPreview] = createSignal<(string | null)[]>([]);

    const [currentlyExecutingMoveIndex, setCurrentlyExecutingMoveIndex] = createSignal<null | number>(null);
    const [currentMoveClash, setCurrentMoveClash] = createSignal<Sides<{ moveName: MoveLexeme, tags: MoveTags | undefined }> | undefined>();

    const [displayMults, setDisplayMults] = createSignal<Sides<DamageMultipliers>>(ZERO_MULTIPLIERS_BY_SIDE);

    const { refRegistry, attachToRegistry } = createRefRegistry<BattleRefNames>();
    attachToConsole(refRegistry, "BATTLE_REF_REGISTRY");

    const { actionMessages, appendActionMessage } = createActionMessageStack();

    const opponentRanBehaviors = {
        preRound: new Set<string>(),
        postRound: new Set<string>()
    }

    async function handleOpponentUIBehaviors(stage: 'preRound' | 'postRound', predicateArgs: OpponentDisplayPredicateArgs, runnerDeps: OpponentDisplayBehaviorDeps) {
        const behaviors = opponentProfile.display.behaviors?.[stage];
        if (!behaviors) return;

        for (const behavior of behaviors) {
            if (behavior.when && !behavior.when(predicateArgs)) continue;
            if (behavior.once) {
                if (opponentRanBehaviors[stage].has(behavior.key)) continue;
                opponentRanBehaviors[stage].add(behavior.key);
            }
            await behavior.run(runnerDeps);
        }
    }

    onMount(async () => {
        console.log(refRegistry);
        if (!config.skipOpeningAnimation) await battleOpeningAnimation(refRegistry, setBattleUIState);
        engine.setupRound();
    })

    const reactions: BattleReactions = {

        async RoundPrepared({ opponentPlan }) {
            setBattleUIState(BattleUIState.WAITING);
            await battleUIAnimations.fadeElementOut(refRegistry.sequenceViewOpponent);
            setOpponentPlanPreview(generateHint(opponentPlan));
            await battleUIAnimations.fadeElementIn(refRegistry.sequenceViewOpponent);
            console.log(opponentPlan.map(plan => plan.name));
        },

        async RoundStart({ plans, combatants }) {
            setBattleUIState(BattleUIState.EXECUTING);
            await handleOpponentUIBehaviors('preRound', { combatants }, { appendActionMessage, ...deps });
            refreshCombatantInfo(combatants); // Opponent Preround Behaviors can update Combatants state!
            await battleUIAnimations.fadeElementOut(refRegistry.sequenceViewOpponent);
            setOpponentPlanPreview(plans.opponent.map(plan => plan.name));
            await battleUIAnimations.fadeElementIn(refRegistry.sequenceViewOpponent);
        },

        async MoveStart({ moveIndex, sequences }) {
            setCurrentlyExecutingMoveIndex(moveIndex);

            setCurrentMoveClash(mapSides(sequences, (s) => ({ moveName: s[moveIndex].name as MoveLexeme, tags: s[moveIndex].tags })));

            // Short delay for index anim to play without anything else happening
            await sleep(MOVE_INIT_DELAY);
        },

        PreEffectResolved({ combatants }) {
            refreshCombatantInfo(combatants);
        },

        async MultipliersComputed({ damageMultipliers, preEffectOutcomes, combatants, plannedSequences, moves, moveIndex }) {
            // Hacky but it works - If the move is the result of a mirror, play the mirror anim instead!
            const moveNames = mapSides(moves, x => (x.tags?.includes('mirrored')) ? 'mirror' : x.name);
            const moveTags = mapSides(moves, x => x.tags ?? []);

            setDisplayMults(damageMultipliers);

            await sleep(PRE_ANIMATION_DELAY);

            const opponentMoveSEs = applyMoveUISEOverrides(
                DEFAULT_OPPONENT_MOVE_UI_EFFECTS,
                opponentProfile
            )[moveNames.opponent] ?? [];

            // Just using defaults straight up for now -- I doubt I will have any weird overrides for player moves.
            const playerMoveSEs = PLAYER_MOVE_UI_EFFECTS[moveNames.player] ?? [];

            const mergedSEs = [...playerMoveSEs, ...opponentMoveSEs];

            // REPLACE THIS WITH DRAMA SYSTEM. OR, MORE LIKELY, MOVE THE DRAMA STUFF TO THE MOVE END.
            await runMoveUISideEffects(
                mergedSEs,
                { appendActionMessage, ...deps, refRegistry },
                { combatants, damageMultipliers, preEffectOutcomes, moveNames, plannedSequences, moveIndex, moveTags }
            )
        },

        async DamagesApplied({ combatants, damagesDealt }) {

            refreshCombatantInfo(combatants);

            if (damagesDealt.player > 0) {
                playSound(opponent_pain_sfx);
                //playSound(pickRandom(OPPONENT_PAIN_SOUNDS));
                battleUIAnimations.damageFlash(refRegistry.opponentSprite);
            };

            if (damagesDealt.opponent > 0) {
                playSound(player_pain_sfx);
                deps.startMeltAnimation?.(true, 20, 0.5);
            }

        },

        PostEffectResolved({ combatants }) {
            refreshCombatantInfo(combatants)
        },

        async MoveEnd({ combatants }) {
            setDisplayMults(ZERO_MULTIPLIERS_BY_SIDE)
            refreshCombatantInfo(combatants);
            await sleep(MOVE_DELAY);
        },

        async RoundEnd({ combatants }) {
            setBattleUIState(BattleUIState.WAITING);
            setCurrentlyExecutingMoveIndex(null);
            refreshCombatantInfo(combatants);
            setCurrentMoveClash(undefined);
            await handleOpponentUIBehaviors('postRound', { combatants }, { appendActionMessage, ...deps });
            engine.setupRound();
        },

        async BattleEnd({ outcome, combatants }) {
            setBattleUIState(BattleUIState.END);
            setDisplayMults(ZERO_MULTIPLIERS_BY_SIDE);
            refreshCombatantInfo(combatants);

            switch (outcome) {
                case BattleOutcome.PlayerVictory:
                    // Play opponent death sound here.
                    playSound(opponent_death_sound);
                    await battleUIAnimations.fadeToBlackAndTransparent(refRegistry.opponentSprite);
                    break;
                case BattleOutcome.OpponentVictory:
                    // Player death sound here.
                    deps.startMeltAnimation?.(false, 20, 5);
                    // Consider switching back to fading with code animation so we can await it
                    break;
                case BattleOutcome.Draw:
                    await battleUIAnimations.fadeToBlackAndTransparent(refRegistry.opponentSprite);
                // Do some sort of unique other animation or event in case of draw here.
            }

            await sleep(BATTLE_END_SLEEP_TIME);
            config.onEnd(outcome);
        }
    };

    const engine = createBattleEngine(opponentProfile.logic.ai, opponentProfile.logic.stats, reactions, { logger(m) { appendActionMessage(m, 'default') } });

    attachToConsole(engine, 'DG_BATTLE_ENGINE');

    return {
        displayMults,
        battleUIState, setBattleUIState,
        playerHealthPercentage, opponentHealthPercentage,
        opponentPlanPreview,
        currentlyExecutingMoveIndex, currentClash: currentMoveClash,
        attachToRegistry,
        currentStatusIcons,
        engine,
        actionMessages
    }
}
