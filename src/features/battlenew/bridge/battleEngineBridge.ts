import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/events/battleEvent.types";
import { BattleOutcome, DamageMultipliers } from "@/core/battlenew/model/battle";
import { createRefRegistry } from "@/shared/utils/refRegistry";
import sleep from "@/shared/utils/sleep";
import { createSignal } from "solid-js";
import { BattleRefNames } from "../animation/uiAnimations/battleUIRefRegistry";
import { animateOpponentDamageFlash, animateOpponentDeathFade, fadeElementIn, fadeElementOut } from "../animation/uiAnimations/uiAnimations";
import { playSound } from "@/shared/utils/playSound";
import { MeltAnimationFn } from "@/shared/hooks/createMeltEffect";

import opponent_pain_sfx from "@/assets/sfx/battle/pain.wav";
import player_pain_sfx from "@/assets/sfx/battle/player_pain.wav"
import { makeSidesMap, mapSides, Sides } from "@/core/battlenew/utils/sides.utils";
import { AssetURL } from "@/shared/types/misc.types";
import { generateHint, getStatusIconsOfCombatant } from "./battleEngineBridge.util";
import { BATTLE_END_SLEEP_TIME, MOVE_DELAY, MOVE_INIT_DELAY, NOTIFICATION_LIFESPAN, PRE_ANIMATION_DELAY } from "./timings.config";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { runClashReactionsByPlacement } from "../clash/clashReaction";
import { OPPONENT_CLASH_REACTIONS, PLAYER_CLASH_REACTIONS } from "../clash/clashReactionDefinitions";
import { ActionMessage, ActionMessageAppender, generateActionMessageFromMoveEmission } from "./actionMessages";
import { MoveLexicon } from "../lexicon/lexicon.types";
import { OpponentDisplayBehavior, OpponentDisplayBehaviorDeps, OpponentDisplayPredicateArgs, OpponentProfile } from "./battleProfiles";

import opponent_death_sound from '@/assets/sfx/battle/opponent_death.wav'
import { Combatant } from "@/core/battlenew/model/combatant";

export enum BattleUIState {
    WAITING, READY, EXECUTING, 
    END // Temporary state when animating the UI closing on battle end.    
}

export const HINT_AMOUNT = 3;

const emptyMults = makeSidesMap({incoming: 0, outgoing: 0}, {incoming: 0, outgoing: 0});

export function createUIBridgedBattleEngine(opponentProfile: OpponentProfile, lexicons: Sides<MoveLexicon>, onEnd: (res: BattleOutcome) => void, startMeltAnimation: MeltAnimationFn, requestOverlayAnimation: OverlayAnimationRequester) {

    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.WAITING);

    // Keeping these seperate instead of using Sides as they are forwarded to different UI components.
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(100);
    const [opponentHealthPercentage, setOpponentHealthPercentage] = createSignal(100);

    const [currentStatusIcons, setCurrentStatusIcons] = createSignal<Sides<AssetURL[]>>({player: [], opponent: []});

    function refreshCombatantInfo(combatants: Sides<Combatant>) {
        setOpponentHealthPercentage(combatants.opponent.healthPercent);
        setPlayerHealthPercentage(combatants.player.healthPercent);
        setCurrentStatusIcons(
            mapSides(combatants, combatant => getStatusIconsOfCombatant(combatant))
        );
    }

    const [opponentPlanPreview, setOpponentPlanPreview] = createSignal<(string | null)[]>([]);
    const [currentlyExecutingMoveIndex, setCurrentlyExecutingMoveIndex] = createSignal<null | number>(null);

    const [displayMults, setDisplayMults] = createSignal<Sides<DamageMultipliers>>(emptyMults);

    const {refRegistry, attachToRegistry} = createRefRegistry<BattleRefNames>();

    const [actionMessages, setActionMessages] = createSignal<ActionMessage[]>([]);
    const appendActionMessage: ActionMessageAppender = (text, iconName) => {
        setActionMessages(prev => [...prev, { text, iconName}]);
        setTimeout(() => setActionMessages(prev => prev.slice(1)), NOTIFICATION_LIFESPAN)
    }

    const opponentRanBehaviors = {
        pre: new Set<string>(),
        post: new Set<string>()
    }

    function handleOpponentBehaviors(
            stage: 'pre' | 'post', 
            behaviors: OpponentDisplayBehavior[] | undefined, 
            predicateArgs: OpponentDisplayPredicateArgs, 
            runnerDeps: OpponentDisplayBehaviorDeps
    ) {
        if(!behaviors) return;
        behaviors.filter(behavior => (behavior.when === undefined) || behavior.when(predicateArgs)).forEach(behavior => {
            if(behavior.once) {
                if(opponentRanBehaviors[stage].has(behavior.key)) return;
                opponentRanBehaviors[stage].add(behavior.key);
            }
            behavior.run(runnerDeps);
        })
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
            handleOpponentBehaviors('pre', opponentProfile.display.behaviors?.preRound, {combatants}, {appendActionMessage});
            refreshCombatantInfo(combatants); // Opponent Preround Behaviors can update Combatants state!
            await fadeElementOut(refRegistry.sequenceViewOpponent);
            setOpponentPlanPreview(plans.opponent.map(plan => plan.name));
            await fadeElementIn(refRegistry.sequenceViewOpponent);
        },

        async MoveStart({moveIndex}){
            setCurrentlyExecutingMoveIndex(moveIndex);

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

            // May have custom clash reactions per opponent later, but for now we can just use a constant one.
            await runClashReactionsByPlacement(PLAYER_CLASH_REACTIONS[moveNames.player], OPPONENT_CLASH_REACTIONS[moveNames.opponent], {requestOverlayAnimation}, {mults: damageMultipliers, outcomes: preEffectOutcomes, plannedMoveNames: moveNames, combatants, plannedSequences, moveIndex, moveTags})

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

            // Old code also had an animation resolver here. But I am not sure if I ever used it.
        },

        async MoveEnd({combatants}) {

            setDisplayMults(emptyMults)

            refreshCombatantInfo(combatants);

            await sleep(MOVE_DELAY);
        },

        RoundEnd({combatants}) {
            setBattleUIState(BattleUIState.WAITING);
            setCurrentlyExecutingMoveIndex(null);
            handleOpponentBehaviors('post', opponentProfile.display.behaviors?.postRound, {combatants}, {appendActionMessage});
            refreshCombatantInfo(combatants);
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
            generateActionMessageFromMoveEmission(data, opponentProfile, lexicons, appendActionMessage);
        }
    };


    const engine = createBattleEngine(opponentProfile.logic.ai, opponentProfile.logic.stats, reactions, {logger(m) {appendActionMessage(m, 'default')}});

    return {
        displayMults,
        battleUIState, setBattleUIState,
        playerHealthPercentage, opponentHealthPercentage, 
        opponentPlanPreview, 
        currentlyExecutingMoveIndex,
        attachToRegistry,
        currentStatusIcons,
        engine,
        actionMessages
    }
}