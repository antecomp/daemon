import { createBattleEngine } from "@/core/battle/engine/battleEngine";
import { BattleEventPayload, BattleReactions } from "@/core/battle/model/battleReactions";
import { BattleOutcome, DamageMultipliers, ZERO_MULTIPLIERS_BY_SIDE } from "@/core/battle/model/battle";
import { createRefRegistry } from "@/shared/utils/refRegistry";
import sleep from "@/shared/utils/sleep";
import { createSignal, onMount } from "solid-js";
import { BattleRefNames } from "../animation/uiAnimations/battleUIRefRegistry";
import battleUIAnimations from "../animation/uiAnimations/battleUIAnimations";
import { playSound } from "@/shared/utils/playSound";
import { MeltAnimationFn } from "@/shared/hooks/createMeltEffect";

import { mapSides, Sides } from "@/core/battle/utils/sides.utils";
import { AssetURL } from "@/shared/types/misc.types";
import { generateHint, getStatusIconsOfCombatant } from "./battleEngineBridge.util";
import { BATTLE_END_SLEEP_TIME, MOVE_DELAY, MOVE_INIT_DELAY, PRE_ANIMATION_DELAY } from "../config/timings.config";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { MoveLexeme, MoveLexicon } from "../lexicon/moveLexicon";
import { OpponentDisplayBehaviorDeps, OpponentDisplayPredicateArgs, OpponentProfile, PlayerProfile } from "./battleProfiles";

import opponent_death_sound from '@/assets/sfx/battle/opponent_death.wav'
import { Combatant } from "@/core/battle/model/combatant";
import attachToConsole from "@/devtools/attachToConsole";
import { MoveTags } from "@/core/battle/model/move.types";
import { createActionMessageStack } from "../ui/ActionMessages";
import battleOpeningAnimation from "../animation/battle-opening-animation";
import { Obligations } from "@/shared/utils/obligation";
import COMMON_DRAMA_TABLE, { DEFAULT_DAMAGE_DRAMAS } from "../drama/commonDrama";
import { DamageDramaDependancies, DramaData, DramaDependancies, DramaEntry, DramaObligations } from "../drama/drama.types";
import { BattleUIState } from "./battleUIState";

/** Contained helper to manage a battleEngine instance and translate emissions to changes in Solid (UI) signals and other UI-based side effects. */
export function createUIBridgedBattleEngine(
    deps: {
        startMeltAnimation?: MeltAnimationFn,
        requestOverlayAnimation: OverlayAnimationRequester,
    },
    data: {
        lexicons: Sides<MoveLexicon>
        profiles: { player: PlayerProfile, opponent: OpponentProfile }
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
        const behaviors = data.profiles.opponent.display.behaviors?.[stage];
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
    });

    const dramaTable = { ...COMMON_DRAMA_TABLE, ...data.profiles.opponent.display.dramas };
    const damageDramaDeps: DamageDramaDependancies = { ...deps, refRegistry, appendActionMessage };

    // Defined here to capture all the config stuff in this scope easily.
    function makeDramaRunner(evdata: BattleEventPayload['MoveEnd']) {
        const dramaData: DramaData = {
            ...data,
            ...deps,
            ...evdata
        };

        // this fills me with contempt.
        const dramaObli = new Obligations({
            opponentDamage() {
                if (evdata.postCtx.opponent.damageTaken > 0) {
                    setOpponentHealthPercentage(evdata.combatants.opponent.healthPercent);
                    data.profiles.opponent.display.damageDrama ? data.profiles.opponent.display.damageDrama(damageDramaDeps) : DEFAULT_DAMAGE_DRAMAS.opponent(damageDramaDeps);
                }
            },

            playerDamage() {
                if (evdata.postCtx.player.damageTaken > 0) {
                    setPlayerHealthPercentage(evdata.combatants.player.healthPercent);
                    DEFAULT_DAMAGE_DRAMAS.player(damageDramaDeps);
                }
            }
        });

        const fufillDramaObligation: DramaObligations = {
            opponentDamage() { dramaObli.run('opponentDamage') },
            playerDamage() { dramaObli.run('playerDamage') }
        };

        return async () => {
            const dramaDeps: DramaDependancies = {
                ...damageDramaDeps,
                fufillDramaObligation
            }

            const activeDramas = Object.entries(dramaTable)
                .filter(([, dre]) => dre.when(dramaData));

            const byPlace = new Map<number, Array<{ id: string, dre: DramaEntry }>>();
            for (const [id, dre] of activeDramas) {
                const arr = byPlace.get(dre.place) ?? [];
                arr.push({ id, dre });
                byPlace.set(dre.place, arr);
            }

            const places = [...byPlace.keys()].sort((a, b) => a - b);
            let hasRunDrama = false;
            for (const place of places) {
                const batch = byPlace.get(place)!;
                await Promise.all(batch.map(async ({ dre }) => {
                    if (hasRunDrama && dre.preDelay) await sleep(dre.preDelay);
                    return dre.run(dramaDeps, dramaData);
                }));
                hasRunDrama = true;
            }

            dramaObli.resolveObligations();
            //dramaObli.resetCompleted(); // ready for next call.
            return places.length;
        }
    }

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

        async MultipliersComputed({ damageMultipliers }) {
            setDisplayMults(damageMultipliers);
            await sleep(PRE_ANIMATION_DELAY);
        },

        async MoveEnd(evdata) {

            const placesRan = await makeDramaRunner(evdata)();

            setDisplayMults(ZERO_MULTIPLIERS_BY_SIDE)
            refreshCombatantInfo(evdata.combatants);

            // If no dramas, advance faster (usually this is on meaningless move pairings)
            if (placesRan > 0) await sleep(MOVE_DELAY);
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

            // TODO: Also run dramas here.

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
                    break;
            }

            await sleep(BATTLE_END_SLEEP_TIME);
            config.onEnd(outcome);
        },

        async BattleForceEnd({ outcome }) {
            setBattleUIState(BattleUIState.END);
            setDisplayMults(ZERO_MULTIPLIERS_BY_SIDE);
            config.onEnd(outcome);
        }
    };

    const engine = createBattleEngine(data.profiles.opponent.logic.ai, data.profiles.opponent.logic.stats, reactions, { logger(m) { appendActionMessage(m, 'default') } });

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
