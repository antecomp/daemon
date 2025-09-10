import { ParentProps, createSignal } from "solid-js";
import { SCENE_DIMENSIONS } from "@/config";
import { MenuOption, SceneContextMenu } from "./scenemenu.types";
import { SceneMenuContext } from "./SceneMenuContext";
import SceneMenu from "./SceneMenu";
import { Vector2 } from "three";

/**
 * SceneMenuWrapper manages the scene menu state and context, and renders the menu.
 * Wrap main scene content with this so children can call `useSceneMenu`.
 */
export default function SceneMenuWrapper(props: ParentProps) {
    const [currentMenu, setCurrentMenu] = createSignal<SceneContextMenu>(null);

    const spawnMenu = (prompt: string, options: MenuOption[], mouse: Vector2, width?: number) =>
        setCurrentMenu({
            prompt,
            options,
            width,
            position: {
                x: ((mouse.x + 1) / 2) * SCENE_DIMENSIONS.width,
                y: ((mouse.y + 1) / 2) * SCENE_DIMENSIONS.height,
            },
        });

    const closeMenu = () => setCurrentMenu(null);

    return (
        <SceneMenuContext.Provider value={{ spawnMenu, closeMenu }}>
            {props.children}
            <SceneMenu currentMenu={currentMenu()} />
        </SceneMenuContext.Provider>
    );
}

