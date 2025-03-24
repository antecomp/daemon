import { currentBattle } from "@/core/battle/battleManager";
import { currentUIState, UIState } from "@/core/ui/uiState";
import { Show } from "solid-js";
import Battle from "./Battle";

export default function BattleOverlay() {
    return (
        // Should be able to put the overlay effect here, just fade in the battle with a pure CSS delay after.
        <Show when={currentUIState() == UIState.Battle && currentBattle()}>
            <div id="battle-overlay">
                <Battle opponentData={currentBattle()!.opponent}/>
            </div>
        </Show>
    );
}