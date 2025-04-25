import { SceneContextMenu } from "./scenemenu.types";
import scenemenubody_left from "./assets/scenemenubody_left.png"
import scenemenubody_right from "./assets/scenemenubody_right.png"
import './scene-menu.css'
import { For, Show } from "solid-js";
import { useSceneMenu } from "./SceneMenuContext";

export default function SceneMenu(props: {
    currentMenu: SceneContextMenu,
}) {

    const {closeMenu} = useSceneMenu()!;

    return (
        <Show when={props.currentMenu}>
            <div class="scenemenu-container" 
                onMouseLeave={closeMenu}
                style={{
                    translate: `${Math.floor(props.currentMenu!.position.x) - 26}px -${Math.floor(props.currentMenu!.position.y) + 26}px`,
                }}
            >
                <div class="scenemenu-prompt-body">
                        <img src={scenemenubody_left}/>
                        <p style={{width: `${props.currentMenu?.width ?? 125}px`}}>
                            <span>{props.currentMenu!.prompt}</span>
                        </p>
                        <img src={scenemenubody_right}/>
                </div>
                <div class="scenemenu-options">
                    {/* <div class="scenemenu-option" style={{"--n": 0}}>egg</div>
                    <div class="scenemenu-option" style={{"--n": 1}}>egg2</div> */}
                    <For each={props.currentMenu?.options ?? []}>
                        {(option, index) => 
                            <div 
                                class="scenemenu-option" 
                                style={{"--n": index()}}
                                onClick={() => {option.onSelect?.(closeMenu); closeMenu()}}
                            >
                                    {option.label}
                            </div>
                        }
                    </For>
                </div>
            </div>
        </Show>
    )
}