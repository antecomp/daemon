import { JSX } from "solid-js";
import "./s-window.css"
import top_corner from "../assets/swindow-top.png";
import swindow_button_frame from "../assets/swindow_button_frame.png"
import swindow_slopcorner from "../assets/swindow-slopborder.png"
import swindow_button from "../assets/swindow_button.png"
import swindow_bot_corner from "../assets/swindow_bot_corner.png"

export function Swindow(props: {
    anchorRef: HTMLElement;
    children: JSX.Element;
    offset: number;
    closeWindow: () => void;
}) {
    return (
        <div 
            class="s-window"
            style={{
                position: 'absolute',
                "z-index": 5,
                "left": "46px",
                "translate": `0px ${props.offset}px`
            }}
        >
            <div class="swindow-hb">
                <img class="swindow-topcorner" src={top_corner}/>
                <span/>
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