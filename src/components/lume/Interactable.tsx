import { Element3D } from "lume";
import {onMount, createSignal, createEffect} from "solid-js"
import { Object3D, Object3DEventMap } from "three";
import { currentInteractionMode } from "@/core/interaction/interaction";
import { InteractionMap } from "../../core/interaction/interactable.types";
import { InteractableObject3D, interactionCB } from "../../core/interaction/interactable.types";

interface InteractiveElementProps {
    onClick?: interactionCB
    onHover?: interactionCB
    interactions?: InteractionMap
    onHoverLeave?: () => void,
    children: any, // change this?
    showHoverBorder?: boolean    
}

export const [hoveredItem, setHoveredItem] = createSignal<Object3D<Object3DEventMap> | null>(null);

/** TODO ADD DOCUMENTATION */
export default function Interactable(props: InteractiveElementProps) {
    let containerRef: Element3D | undefined; // Keeping undefined as potential state to remind myself of potential races with mounting.

    // Live disable hover border if prop changes.
    // TODO - Might want to check if we're still hovering over this during that change, so we don't turn off another persons hover border.
    createEffect(() => {
        if(!props.showHoverBorder) {
            setHoveredItem(null);
        }
    })
    
    onMount(() => {
        if(containerRef && containerRef.three) {
            (containerRef.three as InteractableObject3D).userData.onClick = (uv, mouse) => {
                props.onClick?.(uv, mouse);
                
                if(props.interactions) {
                    props.interactions[currentInteractionMode()]?.(uv, mouse); 
                 }
            };
            (containerRef.three as InteractableObject3D).userData.onHover = (uv, mouse) => {
                props.onHover?.(uv, mouse);

                // We want to make the direct child of the interact container to be the receiver of the 
                // glow effect - this often differs from the Three object calling onHover.
                // Ref HeadCam implementation but tldr we check every ancestor of raycast target for method in case of grouping.
                if(containerRef.children.length > 0 && props.showHoverBorder) setHoveredItem((containerRef.children[0] as Element3D).three);
            };
            containerRef.three.userData.onHoverLeave = () => {
                props.onHoverLeave?.();
                setHoveredItem(null);
            }
        }
    });

    return (
        <lume-element3d 
            ref={containerRef}
            align-point="0.5 0.5"
        >
            {props.children}
        </lume-element3d>
    )
    
}
