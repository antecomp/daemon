import { createSignal } from "solid-js";
import { BattleOutcome, DVOpponentData } from "./engine/battle.types";
import { setUIState, UIState } from "../ui/uiState";

const [currentBattle, setCurrentBattle] = createSignal<{
    opponent: DVOpponentData, 
    outcomeCallback?: (outcome: BattleOutcome) => void
} | null>(null);

export function startBattle(opponent: DVOpponentData, outcomeCallback?: (outcome: BattleOutcome) => void): void {
    if(currentBattle()) {
        throw new Error("Battle already in progress");
        return;
    }
    setUIState(UIState.Battle);
    setCurrentBattle({ opponent, outcomeCallback });
}

export function endBattle(outcome: BattleOutcome) {
    setUIState(UIState.Normal);
    currentBattle()?.outcomeCallback?.(outcome);
    setCurrentBattle(null);
}

export {currentBattle};