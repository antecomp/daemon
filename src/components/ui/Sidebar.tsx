import { scenes } from "@/scenes/sceneRegistry";
import { For } from "solid-js";
import { currentScene, setCurrentScene } from "../SceneContainer";

export default function Sidebar() {
    return (
        <div id="sidebar">
            to implement.
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
        </div>
    )
}