import { OpponentAI, OpponentStats } from "@/core/battlenew/ai/opponentAI.types";
import { createBattleEngine } from "@/core/battlenew/engine/battleEngine";
import { BattleReactions } from "@/core/battlenew/events/battleEvent.types";
import { DamageMultipliers } from "@/core/battlenew/model/battle";
import { createSignal } from "solid-js";

export enum BattleUIState {
    WAITING, READY, EXECUTING, 
    END // Temporary state when animating the UI closing on battle end.    
}

export function createUIBridedBattleEngine(opponentAI: OpponentAI, opponentStats: OpponentStats) {
    // Gonna do a very messy translation layer first for testing then we can refine the whole UI to better work with the enging.

    const [playerMults, setPlayerMults] = createSignal<DamageMultipliers>({incoming: 0, outgoing: 0});
    const [opponentMults, setOpponentMults] = createSignal<DamageMultipliers>({incoming: 0, outgoing: 0});
    const [battleUIState, setBattleUIState] = createSignal<BattleUIState>(BattleUIState.WAITING);
    const [playerHealthPercentage, setPlayerHealthPercentage] = createSignal(100);
    const [opponentHealthPercentage, setOpponentHealthPercentage] = createSignal(100);
    const [opponentPlanPreview, setOpponentPlanPreview] = createSignal<string[]>([]); // will just do names until we have proper mapping code.

    // holding off on the current statuses thing until I have more mapping info.

    // Make reactions here! Will likely split up into smaller helpers later.
    const reactions: BattleReactions = {

    };


    const engine = createBattleEngine(opponentAI, opponentStats, reactions);

    return {
        playerMults, opponentMults, battleUIState, playerHealthPercentage, opponentHealthPercentage, opponentPlanPreview, engine
    }


}