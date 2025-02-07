import {createSignal, Suspense} from "solid-js";
import { scenes } from "../scenes/sceneRegistry";
import { Dynamic } from "solid-js/web";
import { INITIAL_SCENE, SCENE_DIMENSIONS } from "@/config";
import { currentInteractionMode, setCurrentInteractionMode } from "./ui/InteractionModePicker";

/**
 * Use this atom to change/view the active rendered scene. Changing the scene will completely unmount the previous scene and 
 * immediately load the new one.
 */
export const [currentScene, setCurrentScene] = createSignal(INITIAL_SCENE);

/**
 * Scene container is responsible for the dynamic lazy loading of scenes from the scene registry. It listens to the public
 * currentScene atom to load and switch between the active scenes.
 * 
 * To change a scene, import setCurrentScene atom and call it by name. (You can also get the active scene by import.)
 * 
 * To register a scene, reference sceneRegistry.
 * @returns 
 */
export default function SceneContainer() {

    // Used to cycle interaction mode if you right click the scene.
    function cycleInteractionMode() {
        setCurrentInteractionMode(
            (currentInteractionMode() + 1) % 3
        )
    }

    return (
        <div id="scene-container" onContextMenu={cycleInteractionMode} style={{width: `${SCENE_DIMENSIONS.width}px`, height: `${SCENE_DIMENSIONS.height}px`}}>
        <Suspense fallback={<p>Loading scene...</p>}>
            <Dynamic component={scenes[currentScene()]} />
        </Suspense>
        </div>
    )
}