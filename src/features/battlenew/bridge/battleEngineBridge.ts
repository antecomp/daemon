import { OpponentAI, OpponentStats } from "@/core/battlenew/ai/opponentAI.types";
import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/events/battleEvent.types";
import { DamageMultipliers } from "@/core/battlenew/model/battle";
import { PlannedMove } from "@/core/battlenew/model/plannedmove";
import sleep from "@/shared/utils/sleep";
import { createSignal } from "solid-js";

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

export function createUIBridedBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats) {
    // Gonna do a very messy translation layer first for testing then we can refine the whole UI to better work with the enging.

    const [playerMults, setPlayerMults] = createSignal<DamageMultipliers>({incoming: 0, outgoing: 0});
    const [opponentMults, setOpponentMults] = createSignal<DamageMultipliers>({incoming: 0, outgoing: 0});
    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.WAITING);
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(100);
    const [opponentHealthPercentage, setOpponentHealthPercentage] = createSignal(100);
    const [opponentPlanPreview, setOpponentPlanPreview] = createSignal<(string | null)[]>([]); // will just do names until we have proper mapping code.
    const [currentlyExecutingMoveIndex, setCurrentlyExecutingMoveIndex] = createSignal<null | number>(null);

    // holding off on the current statuses thing until I have more mapping info.

    // Make reactions here! Will likely split up into smaller helpers later.
    const reactions: BattleReactions = {
        RoundPrepared({opponentPlan}) {
            setBattleUIState(BattleUIState.WAITING);
            setOpponentPlanPreview(generateHint(opponentPlan));
        },

        RoundStart({plans}) {
            setBattleUIState(BattleUIState.EXECUTING);
            setOpponentPlanPreview(plans.opponent.map(plan => plan.name));
        },

        MoveStart({moveIndex}){
            setCurrentlyExecutingMoveIndex(moveIndex);
        },

        MultipliersComputed({damageMultipliers}) {
            setPlayerMults(damageMultipliers.player);
            setOpponentMults(damageMultipliers.opponent);
        },

        async DamagesApplied({combatants}) {

            // Animations here?
            await sleep(1000);

            setPlayerHealthPercentage(combatants.player.healthPercent);
            setOpponentHealthPercentage(combatants.opponent.healthPercent)
        },

        PostEffectResolved({combatants}) {
            // In case of events like healing + status damage
            setPlayerHealthPercentage(combatants.player.healthPercent);
            setOpponentHealthPercentage(combatants.opponent.healthPercent)
        },

        MoveEnd() {
            setPlayerMults({incoming: 0, outgoing: 0});
            setOpponentMults({incoming: 0, outgoing: 0});
        },

        RoundEnd() {
            setBattleUIState(BattleUIState.WAITING);
            setCurrentlyExecutingMoveIndex(null);

            engine.setupRound();
        }
    };


    const engine = createBattleEngine(opponentAI, opponentStats, reactions);

    return {
        playerMults, opponentMults, 
        battleUIState, setBattleUIState,
        playerHealthPercentage, opponentHealthPercentage, 
        opponentPlanPreview, 
        currentlyExecutingMoveIndex,
        engine,
    }
}