import { JSX } from "solid-js";
import "./s-window.css"

export function Swindow(props: {
    anchorRef: HTMLElement;
    children: JSX.Element;
    offset: number;
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
            {props.children}
        </div>
    )
}