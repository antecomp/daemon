import { startBattle } from "@/core/battle/battleManager";
import { OPPONENT_DEBUG_ANGEL } from "@/data/battles/debugangel";
import { OPPONENT_MIMICRY } from "@/data/battles/mimicry";
import { OPPONENT_NEWPORTS } from "@/data/battles/newports";
import { OPPONENT_PANOPTES } from "@/data/battles/panoptes";
import { setCurrentScene } from "@/views/main/ui/SceneContainer";
import { For } from "solid-js";

export default function DebugMenu() {
    return (
        <div id="debug-menu">
            <h2>Scenes</h2>
            <For each={[
                "Liminality", "Porch", "AnotherScene", "DefaultScene", "Sponza"
            ]}>
                {sceneName => <button onClick={() => setCurrentScene(sceneName)}>{sceneName}</button>}
            </For>
            <h2>Battles</h2>
            <For each={[
                OPPONENT_DEBUG_ANGEL,
                OPPONENT_NEWPORTS,
                OPPONENT_PANOPTES,
                OPPONENT_MIMICRY
            ]}>
                {opp => <button onClick={() => startBattle(opp)}>{opp.name}</button>}
            </For>
        </div>
    )
}