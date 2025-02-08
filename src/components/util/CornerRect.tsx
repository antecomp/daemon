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
    // Soley used for SceneContainer, feel free to add support for other event listeners l8r tho.
    onContextMenu?: () => void;
}

/**
 * Decorative div that places images at each corner.
 * @prop width: width in pixels
 * @prop height: height in pixels
 * @prop corners array of four image urls. To skip a corner, pass undefined.
 * @prop borderSize: thickness of the border in pixels
 * @prop borderType: a border type (f.e 'solid') followed by a colour string
 * @returns 
 */
export default function CornerRect(props: CornerRecProps) {
    return (
        <div class={`cornerRec ${props.className ?? ""}`} id={props.id ?? undefined}
            style={{
                "--borderSize": `${-1 * props.borderSize}px`,
                width: props.width ?? 'inherit',
                height: props.height ?? 'inherit',
                border: `${props.borderSize}px ${props.borderType}`,
                ...props.style
            } as JSX.CSSProperties}
            onContextMenu={props.onContextMenu}
        >
            {props.children}
            {props.corners[0] && <img src={props.corners[0]} class="tl" alt="" />} {props.corners[1] && <img src={props.corners[1]} alt="" class="tr" />}
            {props.corners[2] && <img src={props.corners[2]} alt="" class="bl" />} {props.corners[3] && <img src={props.corners[3]} alt="" class="br" />}
        </div>
    )
}