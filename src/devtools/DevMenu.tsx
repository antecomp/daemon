import { MusicManager } from "@/core/audio/musicManager";
import { DialogueService } from "@/core/dialogue/dialogueService";
import { playTextOverlay, TextOverlaySequence } from "@/features/text-overlay/TextOverlay";
import opening_text_scene from "@/scenes/Elevator/data/opening_textscene";
import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";
import { For } from "solid-js";

import { OPPONENT_MIMICRY as OPPONENT_MIMICRY_NEW } from "@/data/battles/mimic";
import { OPPONENT_ANGEL } from "@/data/battles/angel";
import { OPPONENT_CROW } from "@/data/battles/crow.ts";

import { startBattle as startNewBattle } from "@/features/battle/startBattle";
import { OPPONENT_SERPENT } from "@/data/battles/serpent";

const eggggg: TextOverlaySequence = [
    { segments: [{ text: "This is the first line, one color", color: "red" }], sideEffect: () => console.log("side effect triggered") },
    { segments: [{ text: "This uses the default colour" }] },
    { segments: [{ text: "Now we split into " }, { text: "Two colours", color: "red" }] }
]

import { default as loopbacktest } from '@/tests/dialogues/questionLoopback';
const loopBackRoot = loopbacktest as DialogueNode;
import dec_textscene from '../scenes/TheGem/data/decrypt_textscene.ts';
const dmnintro: TextOverlaySequence = [
    { segments: [{ text: "If the eye was given permission to see, no creature would be able to withstand the abundance and ubiquity of " }, { text: "THE DAEMONS", color: "red" }] },
    { segments: [{ text: "and continue to live unaffected by them." }] },
    { segments: [{ text: "They are more numerous than we are, and they stand over us like mounds of earth surrounding a pit." }] },
    { segments: [{ text: "Each and every one of us has a thousand daemons to his left and ten thousand to his right." }] },
    { segments: [{ text: "THE DAEMONVEIL ", color: "red" }, { text: "protects man from these daemons," }] },
    { segments: [{ text: "As it says in the verse:" }] },
    { segments: [{ text: 'A thousand may fall at your side and ten thousand at your right hand;' }] },
    { segments: [{ text: 'they will not approach you.' }] },
]

import tut1 from '@/assets/placeholders/tut_1.png'
import tut2 from '@/assets/placeholders/tut_2.png'
import tut3 from '@/assets/placeholders/tut_3.png'
import { createTutorialOverlay } from "@/shared/ui/extras/TutorialOverlay";

import bt1 from '@/assets/placeholders/battletut/tut1.png'
import bt2 from '@/assets/placeholders/battletut/tut2.png'
import bt3 from '@/assets/placeholders/battletut/tut3.png'
import bt4 from '@/assets/placeholders/battletut/tut4.png'
import bt5 from '@/assets/placeholders/battletut/tut5.png'
import bt6 from '@/assets/placeholders/battletut/tut6.png'
import sleep from "@/shared/utils/sleep";
import { OPPONENT_BNUY } from "@/data/battles/bnuy";
import { DialogueNode } from "@/core/dialogue/dialogueNode.types";
import Inventory from "@/core/inventory/inventory";
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import EnochPuzzle from "@/features/puzzles/enoch/EnochPuzzle";
import spawnPopup from "@/app/shell/popup/Popup";
import { BOTTOMBAR_HEIGHT } from "@/config/ui.config";
import { OPPONENT_FOX } from "@/data/battles/fox.ts";

export default function DevMenu() {

    return (
        <div id="debug-menu" style={{ width: '300px' }}>
            <h2>Scenes</h2>
            <For each={[
                "Islands",
                "Liminality",
                "Porch",
                "AnotherScene",
                "DefaultScene",
                "Sponza",
                "Doors",
                "BarScene",
                "Crumbling",
                "Elevator",
                "GemmaBar",
                "Bridge",
                "TheGem",
                "Test",
                "TestA"
            ]}>
                {sceneName => <button onClick={() => setCurrentScene(sceneName)}>{sceneName}</button>}
            </For>
            <h2>Battles</h2>
            <For each={[
                OPPONENT_MIMICRY_NEW, OPPONENT_ANGEL, OPPONENT_SERPENT, OPPONENT_BNUY, OPPONENT_CROW, OPPONENT_FOX
            ]}>
                {opp => <button onClick={() => startNewBattle(opp)}>{opp.display.name}</button>}
            </For>
            <h2>MUSIC STACK</h2>
            <button onClick={() => MusicManager.pushTrack({ src: "PWL/erokia-496757.wav" })}>SONG 1</button>
            <button onClick={() => MusicManager.pushTrack({ src: "PWL/erokia-786215.wav" })}>SONG 2</button>
            <button onClick={() => MusicManager.wipeTracks()}>Stop All Music</button>
            <button onclick={() => MusicManager._debug_pop()}>Pop Song</button>
            <h2>TEXT SCENE</h2>
            <button onclick={() => playTextOverlay(eggggg).then(() => alert("text end trigger."))}>egg</button>
            <button onclick={() => playTextOverlay(dmnintro)}>intro</button>
            <button onclick={() => playTextOverlay(opening_text_scene)}>sfdkjjsdfk</button>
            <h3>DIALOGUES</h3>
            <button onClick={() => DialogueService.startDialogue(loopBackRoot)}>Cool new question slop.</button>
            <h3>Tutorials</h3>
            <button onClick={() => createTutorialOverlay([tut1, tut2, tut3])}>sdjfh</button>
            <button onClick={() => {
                startNewBattle(OPPONENT_SERPENT);
                sleep(9000).then(() => createTutorialOverlay([bt1, bt2, bt3, bt4, bt5, bt6]))
            }}>Battle With Tutorial</button>
            <h3>Inventory</h3>
            <button onClick={() => Inventory.addItem('test')}>Add test item</button>
            <h3>Misc</h3>
            <button onClick={() => pushUILayer({
                id: 'test-puzzle',
                blockBehind: true,
                style: {display: 'flex', 'justify-content': 'center', 'align-items': 'center', 'padding-bottom': BOTTOMBAR_HEIGHT + "px"},
                component: () => <EnochPuzzle
                    target="ATHENA"
                    onCorrect={() => popUILayer('test-puzzle')}
                    onFail={() => popUILayer('test-puzzle')}
                />
            })}>Test Puzzle</button>
            <button onClick={() => playTextOverlay(dec_textscene)}>Dec TextScene</button>
            <button onclick={() => spawnPopup("HELLO")}>Popup</button>
            <button onclick={() => spawnPopup("Test", [
                {prompt: 'NC', action() {alert('action no close')}, dontClose: true},
                {prompt: 'CL', action() {alert('action, close')}}
                ])}>Popup 2</button>
        </div>
    )
}