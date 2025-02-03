import { Element3D } from "lume";
import {onMount, children, createSignal} from "solid-js"
import { Object3D, Object3DEventMap } from "three";

interface InteractiveElementProps {
    onClick: () => void,
    onHover?: () => void,
    onHoverLeave?: () => void,
    //children: any
    children: any,
}

export const [hoveredItem, setHoveredItem] = createSignal<Object3D<Object3DEventMap> | null>(null);

export default function Interactable(props: InteractiveElementProps) {
    let containerRef: Element3D | undefined;
    const resolved = children(() => props.children)
    
    onMount(() => {
        if(containerRef && containerRef.three) {
            containerRef.three.userData.onClick = props.onClick;
            // Likely will add default behavior here too. e.g interactables will glow.
            containerRef.three.userData.onHover = () => {
                if(props.onHover) props.onHover();
                // We want to make the direct child of the interact container to be the receiver of the 
                // glow effect - this often differs from the Three object calling onHover.
                // Ref HeadCam implementation but tldr we check every ancestor of raycast target for method in case of grouping.
                if(containerRef.children.length > 0) setHoveredItem((containerRef.children[0] as Element3D).three);
            };
            containerRef.three.userData.onHoverLeave = () => {
                if(props.onHoverLeave) props.onHoverLeave();
                setHoveredItem(null);
            }
        }
    });

    return (
        <lume-element3d 
            ref={containerRef}
            align-point="0.5 0.5"
        >
            {resolved()}
        </lume-element3d>
    )
    
}
