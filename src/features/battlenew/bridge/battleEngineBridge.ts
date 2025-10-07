import { OpponentAI, OpponentStats } from "@/core/battlenew/ai/opponentAI.types";
import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/events/battleEvent.types";
import { BattleOutcome, DamageMultipliers } from "@/core/battlenew/model/battle";
import { PlannedMove } from "@/core/battlenew/model/plannedmove";
import { createRefRegistry } from "@/shared/utils/refRegistry";
import sleep from "@/shared/utils/sleep";
import { createSignal } from "solid-js";
import { BattleRefNames } from "../animation/battleRefRegistryCTX";
import { animateOpponentDamageFlash, animateOpponentDeathFade } from "../animation/uiAnimations";
import { playSound } from "@/shared/utils/playSound";
import { MeltAnimationFn } from "@/shared/hooks/createMeltEffect";

import opponent_pain_sfx from "@/assets/sfx/battle/pain.wav";
import player_pain_sfx from "@/assets/sfx/battle/player_pain.wav"
import { MoveLexicon } from "../lexicon/lexicon.types";
import { mapSides, Sides } from "@/core/battlenew/utils/sides.utils";
import { AssetURL } from "@/shared/types/misc.types";
import { STATUS_LEXICON } from "../lexicon/statusLexicon";

export enum BattleUIState {
    WAITING, READY, EXECUTING, 
    END // Temporary state when animating the UI closing on battle end.    
}

const HINT_AMOUNT = 3;

const generateHint = (seq: PlannedMove[]): (string | null)[] => { /* Later this should return some nicer interface. */
    const indices = new Set<number>

    while (indices.size < HINT_AMOUNT) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((plannedMove, index) => indices.has(index) ? null : plannedMove.name);
}

export function createUIBridedBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats, opponentLexicon: MoveLexicon, startMeltAnimation: MeltAnimationFn) {
    // Gonna do a very messy translation layer first for testing then we can refine the whole UI to better work with the enging.

    // TODO: Consider changing all these per-combatant related signals to a single Sides signal like you did for status icons!
    const [playerMults, setPlayerMults] = createSignal<DamageMultipliers>({incoming: 0, outgoing: 0});
    const [opponentMults, setOpponentMults] = createSignal<DamageMultipliers>({incoming: 0, outgoing: 0});
    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.WAITING);
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(100);
    const [opponentHealthPercentage, setOpponentHealthPercentage] = createSignal(100);
    const [opponentPlanPreview, setOpponentPlanPreview] = createSignal<(string | null)[]>([]); // will just do names until we have proper mapping code.
    const [currentlyExecutingMoveIndex, setCurrentlyExecutingMoveIndex] = createSignal<null | number>(null);
    const [currentStatusIcons, setCurrentStatusIcons] = createSignal<Sides<AssetURL[]>>({player: [], opponent: []});

    // holding off on the current statuses thing until I have more mapping info.

    const {refRegistry, attachToRegistry} = createRefRegistry<BattleRefNames>();

    // Make reactions here! Will likely split up into smaller helpers later.
    const reactions: BattleReactions = {
        RoundPrepared({opponentPlan}) {
            setBattleUIState(BattleUIState.WAITING);
            setOpponentPlanPreview(generateHint(opponentPlan));
        },

        RoundStart({plans}) {
            setBattleUIState(BattleUIState.EXECUTING);
            setOpponentPlanPreview(plans.opponent.map(plan => opponentLexicon[plan.name].label));
        },

        MoveStart({moveIndex}){
            setCurrentlyExecutingMoveIndex(moveIndex);
        },

        PreEffectResolved({combatants}) {
            // bro why.
            setCurrentStatusIcons(mapSides(combatants, (combatant) => combatant.activeStatuses.map(([status]) => STATUS_LEXICON[status.name].icon!)));
        },

        MultipliersComputed({damageMultipliers}) {
            setPlayerMults(damageMultipliers.player);
            setOpponentMults(damageMultipliers.opponent);
        },

        async DamagesApplied({combatants, damagesDealt}) {

            // Animations here?
            await sleep(1000);

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
        },

        MoveEnd() {
            setPlayerMults({incoming: 0, outgoing: 0});
            setOpponentMults({incoming: 0, outgoing: 0});
        },

        RoundEnd({combatants}) {
            setBattleUIState(BattleUIState.WAITING);
            setCurrentlyExecutingMoveIndex(null);
            // >:(
            setCurrentStatusIcons(mapSides(combatants, (combatant) => combatant.activeStatuses.map(([status]) => STATUS_LEXICON[status.name].icon!)));
            engine.setupRound();
        },

        BattleEnd({outcome, combatants}) {
            setBattleUIState(BattleUIState.END);
            setPlayerMults({incoming: 0, outgoing: 0});
            setOpponentMults({incoming: 0, outgoing: 0});      
            setPlayerHealthPercentage(combatants.player.healthPercent);
            setOpponentHealthPercentage(combatants.opponent.healthPercent);   
            
            switch(outcome) {
                case BattleOutcome.PlayerVictory:
                    // Play opponent death sound here.
                    animateOpponentDeathFade(refRegistry.opponentSprite);
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
        playerMults, opponentMults, 
        battleUIState, setBattleUIState,
        playerHealthPercentage, opponentHealthPercentage, 
        opponentPlanPreview, 
        currentlyExecutingMoveIndex,
        attachToRegistry,
        currentStatusIcons,
        engine,
    }
}