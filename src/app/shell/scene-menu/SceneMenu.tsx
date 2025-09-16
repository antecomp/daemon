import { SceneContextMenu } from "./scenemenu.types";
import scenemenubody_left from "./assets/scenemenubody_left.png"
import scenemenubody_right from "./assets/scenemenubody_right.png"
import './scene-menu.css'
import { For, Show } from "solid-js";
import { useSceneMenu } from "./SceneMenuContext";

import default_option_icon from "./assets/option_icon_circle.png"
import x_option_icon from "./assets/option_icon_x.png"

const MENU_OFFSET = 26;

/**
 * SceneMenu component displays a context menu at a specified position within a scene.
 * This component is never added manually; to actually use SceneMenu, reference useSceneMenu in SceneMenuContext.tsx (useSceneMenu + spawnMenu)
 *
 * @prop `currentMenu` - The current context menu state, including its position, width, prompt, and options.
 *
 * The menu is rendered only when `currentMenu` is defined. It positions itself based on the provided coordinates,
 * displays a prompt, and lists selectable options. Each option can trigger a callback when selected, and the menu
 * automatically closes when the mouse leaves its area.
 */
export default function SceneMenu(props: {
    currentMenu: SceneContextMenu,
}) {

    const { closeMenu } = useSceneMenu();

    return (
        <Show when={props.currentMenu}>
            <div class="scenemenu-container"
                onMouseLeave={closeMenu}
                style={{
                    translate: `${Math.floor(props.currentMenu!.position.x) - MENU_OFFSET}px -${Math.floor(props.currentMenu!.position.y) + MENU_OFFSET}px`,
                }}
            >
                <div class="scenemenu-prompt-body">
                    <img src={scenemenubody_left} />
                    <p style={{ width: `${props.currentMenu?.width ?? 125}px` }}>
                        <span>{props.currentMenu!.prompt}</span>
                    </p>
                    <img src={scenemenubody_right} />
                </div>
                <div class="scenemenu-options">
                    <For each={props.currentMenu?.options ?? []}>
                        {(option, index) =>
                            <div
                                class="scenemenu-option"
                                style={{ "--n": index() }}
                                onClick={() => { option.onSelect?.(); closeMenu() }}
                            >
                                <img src={option.onSelect ? default_option_icon : x_option_icon}/>
                                <span>{option.label}</span>
                            </div>
                        }
                    </For>
                </div>
            </div>
        </Show>
    )
}