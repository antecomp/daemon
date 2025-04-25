import CornerRect from "@/components/util/corner-rect/CornerRect";
import bl_scene from "../assets/bl_scene.png"
import br from "@/assets/ui/corners/da/br.png"
import tl from "@/assets/ui/corners/da/tl.png"
import tr from "@/assets/ui/corners/da/tr.png"
import { INITIAL_SCENE, SCENE_DIMENSIONS } from "@/config";
import { createSignal, ErrorBoundary, Show, Suspense } from "solid-js";
import { Dynamic } from "solid-js/web";
import { DialogueService } from "@/core/dialogue/dialogueService";
import { cycleInteractionMode } from "@/core/interaction/interaction";
import { loadScene } from "@/scenes/loadScene";
import { MenuOption, SceneContextMenu } from "./SceneMenu/scenemenu.types";
import { MenuContext } from "./SceneMenu/SceneMenuContext";
import SceneMenu from "./SceneMenu/SceneMenu";
import { Vector2 } from "three";

// THis will move to some sort of game store (persistent) later.
export const [currentScene, setCurrentScene] = createSignal(INITIAL_SCENE);
(window as any).DG_setScene = setCurrentScene;

export default function SceneContainer() {

    const [currentMenu, setCurrentMenu] = createSignal<SceneContextMenu>(null);
    const spawnMenu = (prompt: string, options: MenuOption[], mouse: Vector2, width?: number) => setCurrentMenu(
        {
            prompt, options, width,
            position: {
                x: ((mouse.x + 1) / 2) * SCENE_DIMENSIONS.width,
                y: ((mouse.y + 1) / 2) * SCENE_DIMENSIONS.height
            }
        } 
    );
    const closeMenu = () => setCurrentMenu(null);

    return (
        <MenuContext.Provider value={{ spawnMenu, closeMenu }}>
            <CornerRect
                borderSize={2}
                borderType="solid white"
                corners={[tl, tr, bl_scene, br]}
                id="scene-container"
                width={`${SCENE_DIMENSIONS.width + 4}px`}
                height={`${SCENE_DIMENSIONS.height + 4}px`}

                onContextMenu={cycleInteractionMode}
            >

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
                <SceneMenu currentMenu={currentMenu()}/>
            </CornerRect>
        </MenuContext.Provider>
    )
}