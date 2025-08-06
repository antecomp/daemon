import { MusicManager } from "@/core/audio/musicManager";
import { startBattle } from "@/core/battle/battleManager";
import { DialogueService } from "@/core/dialogue/dialogueService";
import { OPPONENT_ANTHOUSAI } from "@/data/battles/anthousai";
import { OPPONENT_DEBUG_ANGEL } from "@/data/battles/debugangel";
import { OPPONENT_MIMICRY } from "@/data/battles/mimicry";
import { OPPONENT_NEWPORTS } from "@/data/battles/newports";
import { OPPONENT_PANOPTES } from "@/data/battles/panoptes";
import { playTextOverlay, TextOverlaySequence } from "@/layers/textoverlay/TextOverlay";
import root from "@/scenes/BarScene/dialogues/man_dialogue";
import { setCurrentScene } from "@/views/main/ui/SceneContainer";
import { For } from "solid-js";

const eggggg: TextOverlaySequence = [
    {text: [{word: "This is the first line, one color", color: "red"}]}, 
    {text: [{word: "This uses the default colour"}]},
    {text: [{word: "Now we split into "}, {word: "Two colours", color: "red"}]}
]
eggggg[0].sideEffect = () => console.log("Side Effect Triggered");

export default function DebugMenu() {

    return (
        <div id="debug-menu">
            <h2>Scenes</h2>
            <For each={[
                "Liminality", "Porch", "AnotherScene", "DefaultScene", "Sponza", "Doors", "BarScene"
            ]}>
                {sceneName => <button onClick={() => setCurrentScene(sceneName)}>{sceneName}</button>}
            </For>
            <h2>Battles</h2>
            <For each={[
                OPPONENT_DEBUG_ANGEL, OPPONENT_NEWPORTS, OPPONENT_PANOPTES, OPPONENT_MIMICRY, OPPONENT_ANTHOUSAI
            ]}>
                {opp => <button onClick={() => startBattle(opp)}>{opp.name}</button>}
            </For>
            <h2>MUSIC STACK</h2>
            <button onClick={() => MusicManager.pushTrack({src: "PWL/erokia-496757.wav"})}>SONG 1</button>
            <button onClick={() => MusicManager.pushTrack({src: "PWL/erokia-786215.wav"})}>SONG 2</button>
            <button onClick={() => MusicManager.wipeTracks()}>Stop All Music</button>
            <button onclick={() => MusicManager._debug_pop()}>Pop Song</button>
            <h2>TEXT SCENE</h2>
            <button onclick={() => playTextOverlay(eggggg)}>egg</button>
            <h2>DIALOGUE</h2>
            <button onClick={() => DialogueService.startDialogue(root)}>Man Dialogue</button>
        </div>
    )
}