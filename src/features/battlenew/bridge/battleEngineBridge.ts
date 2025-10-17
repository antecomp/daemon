import { OpponentAI, OpponentStats } from "@/core/battlenew/ai/opponentAI.types";
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
import { MOVE_DELAY, MOVE_INIT_DELAY, PRE_ANIMATION_DELAY } from "./timings.config";
import { OverlayAnimationRequester } from "../animation/overlayAnimations/overlayAnimations.types";
import { runClashReactionsByPlacement } from "../clash/clashReaction";
import { OPPONENT_CLASH_REACTIONS, PLAYER_CLASH_REACTIONS } from "../clash/clashReactionDefinitions";

export enum BattleUIState {
    WAITING, READY, EXECUTING, 
    END // Temporary state when animating the UI closing on battle end.    
}

export const HINT_AMOUNT = 3;

const emptyMults = makeSidesMap({incoming: 0, outgoing: 0}, {incoming: 0, outgoing: 0});

export function createUIBridedBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats, startMeltAnimation: MeltAnimationFn, requestOverlayAnimation: OverlayAnimationRequester) {

    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.WAITING);

    // Keeping these seperate instead of using Sides as they are forwarded to different UI components.
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(100);
    const [opponentHealthPercentage, setOpponentHealthPercentage] = createSignal(100);

    const [opponentPlanPreview, setOpponentPlanPreview] = createSignal<(string | null)[]>([]); // will just do names until we have proper mapping code.
    const [currentlyExecutingMoveIndex, setCurrentlyExecutingMoveIndex] = createSignal<null | number>(null);

    const [displayMults, setDisplayMults] = createSignal<Sides<DamageMultipliers>>(emptyMults);
    const [currentStatusIcons, setCurrentStatusIcons] = createSignal<Sides<AssetURL[]>>({player: [], opponent: []});

    const {refRegistry, attachToRegistry} = createRefRegistry<BattleRefNames>();

    const reactions: BattleReactions = {

        async RoundPrepared({opponentPlan}) {
            setBattleUIState(BattleUIState.WAITING);
            await fadeElementOut(refRegistry.sequenceViewOpponent);
            setOpponentPlanPreview(generateHint(opponentPlan));
            await fadeElementIn(refRegistry.sequenceViewOpponent);

            console.log(opponentPlan.map(plan => plan.name));
        },

        async RoundStart({plans}) {
            setBattleUIState(BattleUIState.EXECUTING);
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
            setCurrentStatusIcons(
                mapSides(combatants, combatant => getStatusIconsOfCombatant(combatant))
            );
        },

        async MultipliersComputed({damageMultipliers, plannedMoves, preEffectOutcomes, combatants}) {

            const moveNames = mapSides(plannedMoves, plan => plan.name);

            setDisplayMults(damageMultipliers);

            await sleep(PRE_ANIMATION_DELAY);

            // May have custom clash reactions per opponent later, but for now we can just use a constant one.
            await runClashReactionsByPlacement(PLAYER_CLASH_REACTIONS[moveNames.player], OPPONENT_CLASH_REACTIONS[moveNames.opponent], {requestOverlayAnimation}, {mults: damageMultipliers, outcomes: preEffectOutcomes, moveNames, combatants})

        },

        async DamagesApplied({combatants, damagesDealt}) {

            setPlayerHealthPercentage(combatants.player.healthPercent);
            setOpponentHealthPercentage(combatants.opponent.healthPercent);

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
            // In case of events like healing + status damage
            setPlayerHealthPercentage(combatants.player.healthPercent);
            setOpponentHealthPercentage(combatants.opponent.healthPercent);

            // Old code also had an animation resolver here. But I am not sure if I ever used it.
        },

        async MoveEnd({combatants}) {

            setDisplayMults(emptyMults)

            setCurrentStatusIcons(
                mapSides(combatants, combatant => getStatusIconsOfCombatant(combatant))
            );

            await sleep(MOVE_DELAY);
        },

        RoundEnd() {
            setBattleUIState(BattleUIState.WAITING);
            setCurrentlyExecutingMoveIndex(null);

            engine.setupRound();
        },

        async BattleEnd({outcome, combatants}) {
            setBattleUIState(BattleUIState.END);
            setDisplayMults(emptyMults);
            setPlayerHealthPercentage(combatants.player.healthPercent);
            setOpponentHealthPercentage(combatants.opponent.healthPercent);   
            
            switch(outcome) {
                case BattleOutcome.PlayerVictory:
                    // Play opponent death sound here.
                    await animateOpponentDeathFade(refRegistry.opponentSprite);
                break;
                case BattleOutcome.OpponentVictory:
                    // Player death sound here.
                    startMeltAnimation(false, 20, 5);
                    // no longer await ui fade out, instead that should happen as a natural reaction to the END state in css.
                break;
                case BattleOutcome.Draw:
                    animateOpponentDeathFade(refRegistry.opponentSprite);
                    // Do some sort of unique other animation or event in case of draw here.
            }
        }
    };


    const engine = createBattleEngine(opponentAI, opponentStats, reactions);

    return {
        displayMults,
        battleUIState, setBattleUIState,
        playerHealthPercentage, opponentHealthPercentage, 
        opponentPlanPreview, 
        currentlyExecutingMoveIndex,
        attachToRegistry,
        currentStatusIcons,
        engine,
    }
}