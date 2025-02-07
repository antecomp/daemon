import '@/style/util/CornerRect.css'
import { JSX } from 'solid-js';

type BorderType = "none" | "hidden" | "dotted" | "dashed" | "solid" | "double" | "groove" | "ridge" | "inset" | "outset";

interface CornerRecProps {
    children: JSX.Element;
    width?: number,
    height?: number,
    corners: [string?, string?, string?, string?], /* image imports Going top LR, bottom LR */
    borderSize: number
    borderType: `${BorderType} ${string}` // Final string for colour.
    className?: string
    style?: React.CSSProperties
    id?: string
}

export default function CornerRect(props: CornerRecProps) {
    return (
        <div class={`cornerRec ${props.className ?? ""}`} id={props.id ?? undefined}
            style={{
                "--borderSize": `${-1 * props.borderSize}px`,
                width: props.width ?? '100%',
                height: props.height ?? '100%',
                border: `${props.borderSize}px ${props.borderType}`,
                ...props.style
            } as JSX.CSSProperties}
        >
            {props.children}
            {props.corners[0] && <img src={props.corners[0]} class="tl" alt="" />} {props.corners[1] && <img src={props.corners[1]} alt="" class="tr" />}
            {props.corners[2] && <img src={props.corners[2]} alt="" class="bl" />} {props.corners[3] && <img src={props.corners[3]} alt="" class="br" />}
        </div>
    )
}