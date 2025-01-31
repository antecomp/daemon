import {createSignal, Suspense} from "solid-js";
import { scenes } from "./scenes/scenes";
import { Dynamic } from "solid-js/web";

export const [currentScene, setSceneName] = createSignal("DefaultScene");

export default function SceneContainer() {

    return (
        <>
            <div id="scene-container">
            <Suspense fallback={<p>Loading scene...</p>}>
                <Dynamic component={scenes[currentScene()]} />
            </Suspense>
            </div>
            <button onClick={() => setSceneName("AnotherScene")}>Load Another Scene</button>
            <p>{currentScene()}</p>
        </>
    )
}