import {createSignal, For, Suspense} from "solid-js";
import { scenes } from "../scenes/sceneRegistry";
import { Dynamic } from "solid-js/web";

export const [currentScene, setSceneName] = createSignal("AnotherScene");

export default function SceneContainer() {

    return (
        <>
            <div id="scene-container">
            <Suspense fallback={<p>Loading scene...</p>}>
                <Dynamic component={scenes[currentScene()]} />
            </Suspense>
            </div>
            <p>{currentScene()}</p>
            <div id="scene-switcher">
                <For each={Object.keys(scenes)}>
                    {(scene) => (
                        <button onClick={() => setSceneName(scene)}>
                            {scene}
                        </button>
                    )}
                </For>
            </div>
        </>
    )
}