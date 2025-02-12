import { scenes } from "@/scenes/sceneRegistry";
import { For } from "solid-js";
import { currentScene, setCurrentScene } from "../scene-container/SceneContainer";
import CornerRect from "@/components/util/corner-rect/CornerRect";
import tl from '@/assets/ui/corners/s5/tl.png'
import tr from '@/assets/ui/corners/s5/tr.png'
import bl from '@/assets/ui/corners/s5/bl.png'
import br from '@/assets/ui/corners/s5/br.png'

export default function Sidebar() {

    // TODO (When sidebar has more content): Have this subscribe to the dialogue signal and gray itself out when there's dialogue.

    return (
        <CornerRect id="sidebar" borderSize={1} borderType="solid white" corners={[tl, tr, bl, undefined]} style={{width: 'inherit', height: 'inherit'}}>
            <CornerRect id="debug-menu" borderSize={1} borderType="solid white" corners={[tl, tr, bl, br]} style={{margin: '4px', height: 'fit-content', padding: '5px'}}>
                <h3>DEBUG MENU</h3>
                <h4>Change scene:</h4>
                <p>Current scene: {currentScene()}</p>
                <For each={Object.keys(scenes)}>
                    {(scene) => (
                        <button onClick={() => setCurrentScene(scene)}>
                            {scene}
                        </button>
                    )}
                </For>
            </CornerRect>
        </CornerRect>
    )
}