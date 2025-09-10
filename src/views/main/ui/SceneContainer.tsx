import CornerRect from "@/components/util/corner-rect/CornerRect";
import bl_scene from "../assets/bl_scene.png"
import br from "@/assets/ui/corners/da/br.png"
import tl from "@/assets/ui/corners/da/tl.png"
import tr from "@/assets/ui/corners/da/tr.png"
import { INITIAL_SCENE, SCENE_DIMENSIONS } from "@/config";
import { createEffect, createSignal, ErrorBoundary, on, Show, Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { DialogueService } from "@/core/dialogue/dialogueService";
import { currentInteractionMode, cycleInteractionMode } from "@/core/interaction/interaction";
import { loadScene } from "@/scenes/loadScene";
import SceneMenuWrapper from "./SceneMenu/SceneMenuWrapper";
import { InteractionMode } from "@/core/interaction/interactable.types";
import { AssetURL } from "@/extra.types";

import pr_chat from "@/assets/ui/cursors/pr_chat.png"
import pr_obs from "@/assets/ui/cursors/pr_obs.png"
import pr_stock from "@/assets/ui/cursors/pra.png"

export const [currentScene, setCurrentScene] = createSignal(INITIAL_SCENE);
(window as any).DG_setScene = setCurrentScene;

// Changes triggered by PlayerCam
const [hoverCursor, setHoverCursor] = createSignal<AssetURL>();
export {setHoverCursor};

function currentCursor(): AssetURL {
    if(hoverCursor()) return hoverCursor()!;
    switch(currentInteractionMode()) {
        case InteractionMode.Chat:
            return pr_chat
        case InteractionMode.Interact:
            return pr_stock
        case InteractionMode.Observe:
            return pr_obs
    }
}

// Add any other side effects / resets that we should do when the scene changes here!
createEffect(on(currentScene, () => {
    setHoverCursor(undefined);
}))

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

                style={{
                    cursor: `url(${currentCursor()}), auto`
                }}
            >
                <SceneMenuWrapper>
                <ErrorBoundary
                    fallback={(err, reset) => (
                        <>
                            <p>Error loading scene: {err.message}</p>
                            <button onClick={reset}>Try again</button>
                            <button onClick={() => { setCurrentScene(INITIAL_SCENE); reset() }}>Return To Initial Scene</button>
                        </>
                    )}
                >
                        <Suspense fallback={<p>Loading scene...</p>}>
                            <Dynamic component={loadScene(currentScene())} />
                        </Suspense>
                </ErrorBoundary>

                <Show when={DialogueService.currentDialogueOverlay()}>
                    <div id="dialogue-overlay" style={{ background: `url(${DialogueService.currentDialogueOverlay()})` }}></div>
                </Show>
                </SceneMenuWrapper>
            </CornerRect>
    )
}
