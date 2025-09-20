import { Element3D } from "lume";
import {createSignal, createEffect, ParentProps} from "solid-js"
import { Object3D, Object3DEventMap } from "three";
import { InteractableComponent } from "@/core/interaction/interactable.types";
import { InteractableObject3D } from "@/core/interaction/interactable.types";
import { useInteractionContext } from "@/core/interaction/InteractionProvider";

interface InteractableProps extends InteractableComponent, ParentProps {
    /** boolean that indicates to the OutlinePass whether to highlight (draw white border) 
     * around the object when it is hovered. 
     * Remember: This prop is reactive so you can toggle this setting at runtime. */
    showHoverBorder?: boolean    
}

// Global signal so the OutlinePass in dgRender can easily observe who is actively being hovered.
// TODO/NOTE : Move this to DGRender or elsewhere? Interactable should only worry about itself not global state!
export const [hoveredItem, setHoveredItem] = createSignal<Object3D<Object3DEventMap> | null>(null);

/**
 * Interactable wraps around any lume element to attach interaction listeners (from player camera raycast). 
 * @prop onClick - interactionCB that runs regardless of interaction mode, for any user click.
 * @prop onHover - interactionCB that runs regardless of interaction mode, on mouse over (as in, raycast hit)
 * @prop interactions - InteractionMap, map of interaction modes to callbacks to run when this item is clicked with whatever interaction mode active.
 * @prop onHoverLeave - CB that runs regardless of interaction mode, when mouse leaves.
 * @prop showHoverBorder - boolean that indicates to the OutlinePass whether to highlight (draw white border) around the object when it is hovered. This prop is reactive so you can toggle this setting at runtime.
 * @ref interactable.types.ts for function signature of interactionCB, InteractionMap.
 * @returns 
 */
export default function Interactable(props: InteractableProps) {
    let containerRef: Element3D | undefined; // Keeping undefined as potential state to remind myself of potential races with mounting.

    const {currentInteractionMode} = useInteractionContext();

    // Live disable hover border if prop changes.
    createEffect(() => {
        if(!props.showHoverBorder) {
            const currentHovered = hoveredItem();
            const hoverTarget = containerRef?.children?.[0] as Element3D | undefined;
            if(currentHovered && currentHovered === hoverTarget?.three) {
                setHoveredItem(null);
            }
        }
    });
    
    createEffect(() => {
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