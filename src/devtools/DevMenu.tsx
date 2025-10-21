import { MusicManager } from "@/core/audio/musicManager";
import { DialogueService } from "@/core/dialogue/dialogueService";
import { playTextOverlay, TextOverlaySequence } from "@/features/text-overlay/TextOverlay";
import openingTextScene from "@/scenes/Elevator/data/opening_textscene";
import root from "@/tests/dialogues/intro_dia";
import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";
import { For } from "solid-js";

import { OPPONENT_MIMICRY as OPPONENT_MIMICRY_NEW } from "@/data/battles/mimic";
import { OPPONENT_ANGEL } from "@/data/battles/angel";

import { startBattle as startNewBattle } from "@/features/battlenew/startBattle";
import { OPPONENT_SERPENT } from "@/data/battles/serpent";

const eggggg: TextOverlaySequence = [
    {segments: [{text: "This is the first line, one color", color: "red"}], sideEffect: () => console.log("side effect triggered")}, 
    {segments: [{text: "This uses the default colour"}]},
    {segments: [{text: "Now we split into "}, {text: "Two colours", color: "red"}]}
]

const dmnintro: TextOverlaySequence = [
    {segments: [{text: "If the eye was given permission to see, no creature would be able to withstand the abundance and ubiquity of "}, {text: "THE DAEMONS", color: "red"}]},
    {segments: [{text: "and continue to live unaffected by them."}]},
    {segments: [{text: "They are more numerous than we are, and they stand over us like mounds of earth surrounding a pit."}]},
    {segments: [{text: "Each and every one of us has a thousand daemons to his left and ten thousand to his right."}]},
    {segments: [{text: "THE DAEMONVEIL ", color: "red"}, {text: "protects man from these daemons,"}]},
    {segments: [{text: "As it says in the verse:"}]},
    {segments: [{text: 'A thousand may fall at your side and ten thousand at your right hand;'}]},
    {segments: [{text: 'they will not approach you.'}]},
]

export default function DebugMenu() {

    return (
        <div id="debug-menu">
            <h2>Scenes</h2>
            <For each={[
                "Liminality", "Porch", "AnotherScene", "DefaultScene", "Sponza", "Doors", "BarScene", "Crumbling", "Elevator", "GemmaBar"
            ]}>
                {sceneName => <button onClick={() => setCurrentScene(sceneName)}>{sceneName}</button>}
            </For>
            <h2>Battles</h2>
            <For each={[
                OPPONENT_MIMICRY_NEW, OPPONENT_ANGEL, OPPONENT_SERPENT
            ]}>
                {opp => <button onClick={() => startNewBattle(opp)}>{opp.display.name}</button>}
            </For>
            <h2>MUSIC STACK</h2>
            <button onClick={() => MusicManager.pushTrack({src: "PWL/erokia-496757.wav"})}>SONG 1</button>
            <button onClick={() => MusicManager.pushTrack({src: "PWL/erokia-786215.wav"})}>SONG 2</button>
            <button onClick={() => MusicManager.wipeTracks()}>Stop All Music</button>
            <button onclick={() => MusicManager._debug_pop()}>Pop Song</button>
            <h2>TEXT SCENE</h2>
            <button onclick={() => playTextOverlay(eggggg).then(() => alert("text end trigger."))}>egg</button>
            <button onclick={() => playTextOverlay(dmnintro)}>intro</button>
            <button onclick={() => playTextOverlay(openingTextScene)}>sfdkjjsdfk</button>
            <h3>DIALOGUES</h3>
            <button onClick={() => DialogueService.startDialogue(root)}>Intro</button>
        </div>
    )
}