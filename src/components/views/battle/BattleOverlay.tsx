import { currentBattle } from "@/core/battle/battleManager";
import { currentUIState, UIState } from "@/core/ui/uiState";
import { InkOverlay, TriWaveInfo } from "@/components/util/corner-rect/InkOverlay";
import { Show } from "solid-js";
import Battle from "./Battle";

const initial: TriWaveInfo = {
    width: 10,
    height: 0,
    phase: 10, // 180 degrees phase shift
    numWaves: 10,
    direction: "bottom"
  };

  const final: TriWaveInfo = {
    width: 10,
    height: 100,
    phase: 10, // 180 degrees phase shift
    numWaves: 10,
    direction: "bottom"
  };

export default function BattleOverlay() {
    return (
        // Should be able to put the overlay effect here, just fade in the battle with a pure CSS delay after.
        <Show when={currentUIState() == UIState.Battle && currentBattle()}>
            <div id="battle-overlay">
                <InkOverlay {...{initial, final}} />
                <Battle opponentData={currentBattle()!.opponent}/>
            </div>
        </Show>
    );
}