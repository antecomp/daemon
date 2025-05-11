import { createMusicTrack } from "@/core/audio/createMusicTrack";
import { MusicManager } from "@/core/audio/musicManager";
import { startBattle } from "@/core/battle/battleManager";
import { OPPONENT_DEBUG_ANGEL } from "@/data/battles/debugangel";
import { OPPONENT_MIMICRY } from "@/data/battles/mimicry";
import { OPPONENT_NEWPORTS } from "@/data/battles/newports";
import { OPPONENT_PANOPTES } from "@/data/battles/panoptes";
import { setCurrentScene } from "@/views/main/ui/SceneContainer";
import { For } from "solid-js";

export default function DebugMenu() {

    //const testSong = MusicManager.pushTrack({src: "PWL/erokia-496757.wav"});

    //const testSong = createMusicTrack({src: "PWL/erokia-496757.wav"});
    //setTimeout(() => testSong.src = "PWL/loop_a.wav", 5000);

    return (
        <div id="debug-menu">
            <h2>Scenes</h2>
            <For each={[
                "Liminality", "Porch", "AnotherScene", "DefaultScene", "Sponza", "Doors"
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
            <h2>MUSIC STACK</h2>
            <button onClick={() => MusicManager.pushTrack({src: "PWL/erokia-496757.wav"})}>SONG 1</button>
            <button onClick={() => MusicManager.pushTrack({src: "PWL/erokia-786215.wav"})}>SONG 2</button>
            <button onClick={() => MusicManager.wipeTracks()}>Stop All Music</button>
            <button onclick={() => MusicManager.$debug_pop()}>Pop Song</button>
        </div>
    )
}