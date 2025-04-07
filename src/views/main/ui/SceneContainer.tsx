import CornerRect from "@/components/util/corner-rect/CornerRect";
import bl_scene from "../assets/bl_scene.png"
import br from "@/assets/ui/corners/da/br.png"
import tl from "@/assets/ui/corners/da/tl.png"
import tr from "@/assets/ui/corners/da/tr.png"
import { INITIAL_SCENE, SCENE_DIMENSIONS } from "@/config";
import { createSignal, Show, Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { scenes } from "@/scenes/sceneRegistry";
import { DialogueService } from "@/core/dialogue/dialogueService";
import { cycleInteractionMode } from "@/core/interaction/interaction";

// THis will move to some sort of game store (persistent) later.
export const [currentScene, setCurrentScene] = createSignal(INITIAL_SCENE);

export default function SceneContainer() {
    return (
        <CornerRect
            borderSize={2}
            borderType="solid white"
            corners={[tl, tr, bl_scene, br]}
            id="scene-container"
            width={`${SCENE_DIMENSIONS.width + 4}px`}
            height={`${SCENE_DIMENSIONS.height + 4}px`}

            onContextMenu={cycleInteractionMode}
        >
            <Suspense fallback={<p>Loading scene...</p>}>
                <Dynamic component={scenes[currentScene()]} />
            </Suspense>

            {/* TODO: Should we just make this a UI layer???? */}
            <Show when={DialogueService.currentDialogueOverlay()}>
                <div id="dialogue-overlay" style={{background: `url(${DialogueService.currentDialogueOverlay()})`}}></div>
            </Show>
        </CornerRect>
    )
}