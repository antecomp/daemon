import { JSX } from "solid-js";
import "./s-window.css"

export function Swindow(props: {
    anchorRef: HTMLElement;
    children: JSX.Element
}) {
    return (
        <div 
            class="s-window"
            style={{
                position: 'absolute',
                "z-index": 5,
                "left": "46px",
            }}
        >
            {props.children}
        </div>
    )
}