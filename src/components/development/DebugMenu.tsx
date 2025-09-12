import { MusicManager } from "@/core/audio/musicManager";
import { startBattle } from "@/core/battle/battleManager";
import { DialogueService } from "@/core/dialogue/dialogueService";
import { OPPONENT_ANTHOUSAI } from "@/data/battles/anthousai";
import { OPPONENT_DEBUG_ANGEL } from "@/data/battles/debugangel";
import { OPPONENT_MIMICRY } from "@/data/battles/mimicry";
import { OPPONENT_NEWPORTS } from "@/data/battles/newports";
import { OPPONENT_PANOPTES } from "@/data/battles/panoptes";
import { playTextOverlay, TextOverlaySequence } from "@/layers/textoverlay/TextOverlay";
import root from "@/tests/dialogues/intro_dia";
import { setCurrentScene } from "@/views/main/ui/SceneContainer";
import { For } from "solid-js";

const eggggg: TextOverlaySequence = [
    {line: [{text: "This is the first line, one color", color: "red"}]}, 
    {line: [{text: "This uses the default colour"}]},
    {line: [{text: "Now we split into "}, {text: "Two colours", color: "red"}]}
]
eggggg[0].sideEffect = () => console.log("Side Effect Triggered");

const dmnintro: TextOverlaySequence = [
    {line: [{text: "If the eye was given permission to see, no creature would be able to withstand the abundance and ubiquity of "}, {text: "THE DAEMONS", color: "red"}]},
    {line: [{text: "and continue to live unaffected by them."}]},
    {line: [{text: "They are more numerous than we are, and they stand over us like mounds of earth surrounding a pit."}]},
    {line: [{text: "Each and every one of us has a thousand daemons to his left and ten thousand to his right."}]},
    {line: [{text: "THE DAEMONVEIL ", color: "red"}, {text: "protects man from these daemons,"}]},
    {line: [{text: "As it says in the verse:"}]},
    {line: [{text: 'A thousand may fall at your side and ten thousand at your right hand;'}]},
    {line: [{text: 'they will not approach you.'}]},
]

export default function DebugMenu() {

    return (
        <div id="debug-menu">
            <h2>Scenes</h2>
            <For each={[
                "Liminality", "Porch", "AnotherScene", "DefaultScene", "Sponza", "Doors", "BarScene", "Crumbling", "Elevator"
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
            <button onclick={() => playTextOverlay(dmnintro)}>intro</button>
            <h3>DIALOGUES</h3>
            <button onClick={() => DialogueService.startDialogue(root)}>Intro</button>
        </div>
    )
}