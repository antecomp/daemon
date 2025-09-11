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
import SceneFadeOverlay from "./SceneFadeOverlay/SceneFadeOverlay";

export const [currentScene, setCurrentScene] = createSignal(INITIAL_SCENE);
(window as any).DG_setScene = setCurrentScene;

/**
 * Ephemeral hover cursor override set by scene elements (e.g., PlayerCam).
 *
 * When defined, this cursor takes precedence over the interaction-mode cursor.
 * It is cleared automatically when the scene changes.
 */
const [hoverCursor, setHoverCursor] = createSignal<AssetURL>();
export { setHoverCursor };

// Helper for scene to resolve the current cursor to display.
function currentCursor(): AssetURL {
    if (hoverCursor()) return hoverCursor()!;
    switch (currentInteractionMode()) {
        case InteractionMode.Chat:
            return pr_chat
        case InteractionMode.Interact:
            return pr_stock
        case InteractionMode.Observe:
            return pr_obs
    }
}

/*
 * Scene-change side effects.
 * Currently just resets any transient hover cursor so the next scene starts clean.
 * Add further scene-change resets here as needed.
 */
createEffect(on(currentScene, () => {
    setHoverCursor(undefined);
}))

/**
 * SceneContainer
 *
 * Provides the main scene viewport wrapper and related state:
 * - Renders the current scene component within a framed container
 * - Chooses cursor based on interaction mode or ephemeral hover state
 * - Exposes a scene setter to update active lume scene.
 * - Wraps scene rendering with Error/Suspense boundaries for lazy loading of scene components.
 */
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
                <SceneFadeOverlay />
            </SceneMenuWrapper>
        </CornerRect>
    )
}