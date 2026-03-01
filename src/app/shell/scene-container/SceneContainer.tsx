import CornerRect from "@/shared/ui/primitives/corner-rect/CornerRect";
import bl_scene from "./assets/bl_scene.png"
import br from "@/assets/ui/corners/da/br.png"
import tl from "@/assets/ui/corners/da/tl.png"
import tr from "@/assets/ui/corners/da/tr.png"
import { INITIAL_SCENE } from "@/config/init.config";
import { SCENE_DIMENSIONS } from "@/config/ui.config";
import { createEffect, ErrorBoundary, on, Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { loadScene } from "@/scenes/loadScene";
import SceneMenuWrapper from "../scene-menu/SceneMenuWrapper";
import { InteractionMode } from "@/core/interaction/interactable.types";

import SceneFadeOverlay from "../scene-fade-overlay/SceneFadeOverlay";
import SceneLoadError from "../fallbacks/SceneLoadError";
import SceneLoading from "../fallbacks/SceneLoading";
import { useInteractionContext } from "@/core/interaction/InteractionProvider";
import attachToConsole from "@/devtools/attachToConsole";
import {
    currentScene,
    hoverCursor,
    isSceneConsoleAttached,
    markSceneConsoleAttached,
    setCurrentScene,
    setHoverCursor,
} from "./sceneState";

export { currentScene, setCurrentScene, setHoverCursor };

if (!isSceneConsoleAttached()) {
    attachToConsole(setCurrentScene, "DG_setScene");
    markSceneConsoleAttached();
}

// Helper for scene to resolve the current cursor to display.

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

    const {currentInteractionMode, cycleInteractionMode} = useInteractionContext();

    /*
     * Scene-change side effects.
     * Currently just resets any transient hover cursor so the next scene starts clean.
     * Add further scene-change resets here as needed.
     */
    createEffect(on(currentScene, () => {
        setHoverCursor(undefined);
    }));

    const currentCursor = () => {
        if (hoverCursor()) return hoverCursor()!;
        switch (currentInteractionMode()) {
            case InteractionMode.Chat: return "cursor-chat";
            case InteractionMode.Interact: return "cursor-interact";
            case InteractionMode.Observe: return "cursor-observe";
        }
    };

    return (
        <CornerRect
            borderSize={2}
            borderType="solid white"
            corners={[tl, tr, bl_scene, br]}
            id="scene-container"
            width={`${SCENE_DIMENSIONS.width + 4}px`}
            height={`${SCENE_DIMENSIONS.height + 4}px`}

            onContextMenu={cycleInteractionMode}

            class={currentCursor()}
        >
            <SceneMenuWrapper>
                <ErrorBoundary
                    fallback={(err, retry) => <SceneLoadError err={err} retry={retry} reset={() => {setCurrentScene(INITIAL_SCENE); retry()}}/>}
                >
                    <Suspense fallback={<SceneLoading/>}>
                        <Dynamic component={loadScene(currentScene())} />
                    </Suspense>
                </ErrorBoundary>
                <SceneFadeOverlay />
            </SceneMenuWrapper>
        </CornerRect>
    )
}
