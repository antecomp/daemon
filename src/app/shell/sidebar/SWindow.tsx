import { JSX } from "solid-js";
import "./s-window.css"
import top_corner from "./assets/swindow-top.png";
import swindow_button_frame from "./assets/swindow_button_frame.png"
import swindow_slopcorner from "./assets/swindow-slopborder.png"
import swindow_button from "./assets/swindow_button.png"
import swindow_bot_corner from "./assets/swindow_bot_corner.png"
import { SIDEBAR_WIDTH } from "@/config/ui.config";

export function Swindow(props: {
    children: JSX.Element;
    offset: number;
    title?: string
    closeWindow: () => void;
}) {
    return (
        <div 
            class="s-window"
            style={{
                position: 'absolute',
                "z-index": 5,
                "left": `${SIDEBAR_WIDTH + 1}px`,
                "translate": `0px ${props.offset}px`
            }}
        >
            <div class="swindow-hb">
                <img class="swindow-topcorner" src={top_corner}/>
                <span class="swindow-title">{props.title}</span>
                <img src={swindow_button_frame} />
                <img 
                    class="swindow-button" 
                    src={swindow_button}
                    onClick={props.closeWindow}
                />
            </div>
            <div class="swindow-hm">
                <span/>
                <img src={swindow_slopcorner}/>
            </div>
            <div class="swindow-content">
                {props.children}
            </div>
            <footer>
                <span/>
                <img src={swindow_bot_corner}/>
            </footer>
        </div>
    )
}