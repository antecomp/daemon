import { createBattleEngine } from "@/core/battle/engine/battleEngine";
import { BattleReactions } from "@/core/battle/model/battleReactions";
import { BattleOutcome, DamageMultipliers } from "@/core/battle/model/battle";
import { createRefRegistry } from "@/shared/utils/refRegistry";
import sleep from "@/shared/utils/sleep";
import { createSignal } from "solid-js";
import { BattleRefNames } from "../animation/uiAnimations/battleUIRefRegistry";
import { animateOpponentDamageFlash, animateOpponentDeathFade, fadeElementIn, fadeElementOut } from "../animation/uiAnimations/uiAnimations";
import { playSound } from "@/shared/utils/playSound";
import { MeltAnimationFn } from "@/shared/hooks/createMeltEffect";

import opponent_pain_sfx from "@/assets/sfx/battle/pain.wav";
import player_pain_sfx from "@/assets/sfx/battle/player_pain.wav"
import { makeSidesMap, mapSides, oppositeSide, Sides } from "@/core/battle/utils/sides.utils";
import { AssetURL } from "@/shared/types/misc.types";
import { generateHint, getStatusIconsOfCombatant } from "./battleEngineBridge.util";
import { BATTLE_END_SLEEP_TIME, MOVE_DELAY, MOVE_INIT_DELAY, NOTIFICATION_CLEAR_STAGGER, NOTIFICATION_LIFESPAN, PRE_ANIMATION_DELAY } from "../config/timings.config";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { applyMoveUISEOverrides, runMoveUISideEffects } from "../effects/moveUISideEffects";
import { DEFAULT_OPPONENT_MOVE_UI_EFFECTS, PLAYER_MOVE_UI_EFFECTS } from "../effects/moveUISideEffectDefinitions";
import { MoveLexeme, MoveLexicon } from "../lexicon/moveLexicon";
import { OpponentDisplayBehaviorDeps, OpponentDisplayPredicateArgs, OpponentProfile } from "./battleProfiles";

import opponent_death_sound from '@/assets/sfx/battle/opponent_death.wav'
import { Combatant } from "@/core/battle/model/combatant";
import attachToConsole from "@/devtools/attachToConsole";
import { DEFAULT_MOVE_EMISSION_RESPONSES, runEmissionSE } from "../effects/moveEmissionResponses";
import { MAIN_CHARACTER_NAME } from "@/config/init.config";
import { capitalizeWords } from "@/shared/utils/stringUtils";
import { MoveTags } from "@/core/battle/model/move.types";
import { ActionMessage, ActionMessageAppender } from "../ui/ActionMessages";

export enum BattleUIState {
    WAITING, READY, EXECUTING, 
    END // Temporary state when animating the UI closing on battle end.    
}

const emptyMults = makeSidesMap({incoming: 0, outgoing: 0}, {incoming: 0, outgoing: 0});

/** Contained helper to manage a battleEngine instance and translate emissions to changes in Solid (UI) signals and other UI-based side effects. */
export function createUIBridgedBattleEngine(opponentProfile: OpponentProfile, lexicons: Sides<MoveLexicon>, onEnd: (res: BattleOutcome) => void, startMeltAnimation: MeltAnimationFn, requestOverlayAnimation: OverlayAnimationRequester) {

    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.WAITING);

    // Keeping these seperate instead of using Sides as they are forwarded to different UI components.
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(100);
    const [opponentHealthPercentage, setOpponentHealthPercentage] = createSignal(100);

    const [currentStatusIcons, setCurrentStatusIcons] = createSignal<Sides<(AssetURL | undefined)[]>>({player: [], opponent: []});

    function refreshCombatantInfo(combatants: Sides<Combatant>) {
        setOpponentHealthPercentage(combatants.opponent.healthPercent);
        setPlayerHealthPercentage(combatants.player.healthPercent);
        setCurrentStatusIcons(
            mapSides(combatants, combatant => getStatusIconsOfCombatant(combatant))
        );
    }

    const [opponentPlanPreview, setOpponentPlanPreview] = createSignal<(string | null)[]>([]);

    const [currentlyExecutingMoveIndex, setCurrentlyExecutingMoveIndex] = createSignal<null | number>(null);
    const [currentMoveClash, setCurrentMoveClash] = createSignal<Sides<{moveName: MoveLexeme, tags: MoveTags | undefined}> | undefined>();

    const [displayMults, setDisplayMults] = createSignal<Sides<DamageMultipliers>>(emptyMults);

    const {refRegistry, attachToRegistry} = createRefRegistry<BattleRefNames>();

    const [actionMessages, setActionMessages] = createSignal<ActionMessage[]>([]);
    const appendActionMessage: ActionMessageAppender = (text, iconName) => {
        const currentLength = actionMessages().length;
        setActionMessages(prev => [...prev, { text, iconName}]);
        const removalDelay = NOTIFICATION_LIFESPAN + currentLength * NOTIFICATION_CLEAR_STAGGER;
        setTimeout(() => setActionMessages(prev => prev.slice(1)), removalDelay);
    }

    const opponentRanBehaviors = {
        preRound: new Set<string>(),
        postRound: new Set<string>()
    }
    const moveEmissionHandlers = opponentProfile.display.behaviors?.moveEmissionHandlers;

    async function handleOpponentUIBehaviors(stage: 'preRound' | 'postRound', predicateArgs: OpponentDisplayPredicateArgs, runnerDeps: OpponentDisplayBehaviorDeps) {
        const behaviors = opponentProfile.display.behaviors?.[stage];
        if(!behaviors) return;    

        // This is going to fire every SE at once, which is probably what you want but be aware that your 
        // array order will have no meaning on execution order.
        await Promise.all(
            behaviors
                .filter(behavior => behavior.when === undefined || behavior.when(predicateArgs))
                .map(async behavior => {
                    if(behavior.once) {
                        if(opponentRanBehaviors[stage].has(behavior.key)) return;
                        opponentRanBehaviors[stage].add(behavior.key);
                    }
                    await behavior.run(runnerDeps);
                })
        );
    }

    const reactions: BattleReactions = {

        async RoundPrepared({opponentPlan}) {
            setBattleUIState(BattleUIState.WAITING);
            await fadeElementOut(refRegistry.sequenceViewOpponent);
            setOpponentPlanPreview(generateHint(opponentPlan));
            await fadeElementIn(refRegistry.sequenceViewOpponent);
            console.log(opponentPlan.map(plan => plan.name));
        },

        async RoundStart({plans, combatants}) {
            setBattleUIState(BattleUIState.EXECUTING);
            await handleOpponentUIBehaviors('preRound', {combatants}, {appendActionMessage, requestOverlayAnimation});
            refreshCombatantInfo(combatants); // Opponent Preround Behaviors can update Combatants state!
            await fadeElementOut(refRegistry.sequenceViewOpponent);
            setOpponentPlanPreview(plans.opponent.map(plan => plan.name));
            await fadeElementIn(refRegistry.sequenceViewOpponent);
        },

        async MoveStart({moveIndex, sequences}){
            setCurrentlyExecutingMoveIndex(moveIndex);

            setCurrentMoveClash(mapSides(sequences, (s) => ({moveName: s[moveIndex].name as MoveLexeme, tags: s[moveIndex].tags})));

            // Short delay for index anim to play without anything else happening
            await sleep(MOVE_INIT_DELAY);
        },

        PreEffectResolved({combatants}) {
            refreshCombatantInfo(combatants);
        },

        async MultipliersComputed({damageMultipliers, preEffectOutcomes, combatants, plannedSequences, moves, moveIndex}) {
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

            await runMoveUISideEffects(
                mergedSEs, 
                {appendActionMessage, requestOverlayAnimation},
                {combatants, damageMultipliers, preEffectOutcomes, moveNames, plannedSequences, moveIndex, moveTags}
            )
        },

        async DamagesApplied({combatants, damagesDealt}) {

            refreshCombatantInfo(combatants);

            if(damagesDealt.player > 0) {
                playSound(opponent_pain_sfx);
                animateOpponentDamageFlash(refRegistry.opponentSprite);
            };

            if(damagesDealt.opponent > 0) {
                playSound(player_pain_sfx);
                startMeltAnimation?.(true, 20, 0.5);
            }

        },

        PostEffectResolved({combatants}) {
            refreshCombatantInfo(combatants)
        },

        async MoveEnd({combatants}) {
            setDisplayMults(emptyMults)
            refreshCombatantInfo(combatants);
            await sleep(MOVE_DELAY);
        },

        async RoundEnd({combatants}) {
            setBattleUIState(BattleUIState.WAITING);
            setCurrentlyExecutingMoveIndex(null);
            refreshCombatantInfo(combatants);
            setCurrentMoveClash(undefined);
            await handleOpponentUIBehaviors('postRound', {combatants}, {appendActionMessage, requestOverlayAnimation});
            engine.setupRound();
        },

        async BattleEnd({outcome, combatants}) {
            setBattleUIState(BattleUIState.END);
            setDisplayMults(emptyMults);
            refreshCombatantInfo(combatants);
            
            switch(outcome) {
                case BattleOutcome.PlayerVictory:
                    // Play opponent death sound here.
                    playSound(opponent_death_sound);
                    await animateOpponentDeathFade(refRegistry.opponentSprite);
                break;
                case BattleOutcome.OpponentVictory:
                    // Player death sound here.
                    startMeltAnimation(false, 20, 5);
                    // Consider switching back to fading with code animation so we can await it
                break;
                case BattleOutcome.Draw:
                    await animateOpponentDeathFade(refRegistry.opponentSprite);
                    // Do some sort of unique other animation or event in case of draw here.
            }
            
            await sleep(BATTLE_END_SLEEP_TIME);
            onEnd(outcome);
        },

        MoveEmission: (data) => {
            const emissionCtx = {
                perspective: data.perspective,
                moveName: data.moveName,
                lexicons,
                nameOfAffected: (flip: true | undefined) => {
                    const p = flip ? oppositeSide(data.perspective) : data.perspective;
                    return p === 'player' ? MAIN_CHARACTER_NAME : capitalizeWords(opponentProfile.display.name);
                }
            };

            const baseDeps = {appendActionMessage, requestOverlayAnimation};
            const defaultHandlerExists = Boolean(
                DEFAULT_MOVE_EMISSION_RESPONSES[data.signal.type as keyof typeof DEFAULT_MOVE_EMISSION_RESPONSES]
            );
            const emissionDeps = defaultHandlerExists
                ? {...baseDeps, defaultSE: () => runEmissionSE(DEFAULT_MOVE_EMISSION_RESPONSES, data.signal, baseDeps, emissionCtx)}
                : baseDeps;

            runEmissionSE(
                {...DEFAULT_MOVE_EMISSION_RESPONSES, ...moveEmissionHandlers?.replace},
                data.signal,
                emissionDeps,
                emissionCtx
            );

            if(moveEmissionHandlers?.add) {
                runEmissionSE(
                    moveEmissionHandlers.add,
                    data.signal,
                    emissionDeps,
                    emissionCtx
                );
            }
        }
    };


    const engine = createBattleEngine(opponentProfile.logic.ai, opponentProfile.logic.stats, reactions, {logger(m) {appendActionMessage(m, 'default')}});

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
