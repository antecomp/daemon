import { SceneContextMenu } from "./scenemenu.types";
import scenemenubody_left from "./assets/scenemenubody_left.png"
import scenemenubody_right from "./assets/scenemenubody_right.png"
import './scene-menu.css'

export default function SceneMenu(props: {
    currentMenu: SceneContextMenu,
}) {
    return (
        <div class="scenemenu-container">
            <div class="scenemenu-prompt-body">
                    <img src={scenemenubody_left}/>
                    <p style={{width: `${props.currentMenu?.width ?? 125}px`}}>
                        <span>The text</span>
                    </p>
                    <img src={scenemenubody_right}/>
            </div>
            <div class="scenemenu-options">
                <div>egg</div>
                <div>egg2</div>
            </div>
        </div>
    )
}