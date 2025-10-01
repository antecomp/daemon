import { OpponentAI, OpponentStats } from "@/core/battlenew/ai/opponentAI.types";
import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/events/battleEvent.types";
import { DamageMultipliers } from "@/core/battlenew/model/battle";
import { PlannedMove } from "@/core/battlenew/model/plannedmove";
import { createSignal } from "solid-js";

export enum BattleUIState {
    WAITING, READY, EXECUTING, 
    END // Temporary state when animating the UI closing on battle end.    
}

const HINT_AMOUNT = 3;

const generateHint = (seq: PlannedMove[]): (string | undefined)[] => { /* Later this should return some nicer interface. */
    const indices = new Set<number>

    while (indices.size < HINT_AMOUNT) {
        indices.add(Math.floor(Math.random() * seq.length));
    }

    return seq.map((item, index) => indices.has(index) ? undefined : item.name);
}

export function createUIBridedBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats) {
    // Gonna do a very messy translation layer first for testing then we can refine the whole UI to better work with the enging.

    const [playerMults, setPlayerMults] = createSignal<DamageMultipliers>({incoming: 0, outgoing: 0});
    const [opponentMults, setOpponentMults] = createSignal<DamageMultipliers>({incoming: 0, outgoing: 0});
    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.WAITING);
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(100);
    const [opponentHealthPercentage, setOpponentHealthPercentage] = createSignal(100);
    const [opponentPlanPreview, setOpponentPlanPreview] = createSignal<(string | undefined)[]>([]); // will just do names until we have proper mapping code.

    // holding off on the current statuses thing until I have more mapping info.

    // Make reactions here! Will likely split up into smaller helpers later.
    const reactions: BattleReactions = {
        RoundStart({plans}) {
            // will do a proper mapper later;
            // will add UI animations here.
            setOpponentPlanPreview(generateHint(plans.opponent))
        },

        MultipliersComputed({damageMultipliers}) {
            setPlayerMults(damageMultipliers.player);
            setOpponentMults(damageMultipliers.opponent);
        },

        DamagesApplied({combatants}) {
            setPlayerHealthPercentage(combatants.player.healthPercent);
            setOpponentHealthPercentage(combatants.opponent.healthPercent)
        }
    };


    const engine = createBattleEngine(opponentAI, opponentStats, reactions);

    return {
        playerMults, opponentMults, battleUIState, playerHealthPercentage, opponentHealthPercentage, opponentPlanPreview, engine,
        setBattleUIState
    }


}