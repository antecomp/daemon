import { Element3D } from "lume";
import {onMount, children} from "solid-js"

interface InteractiveElementProps {
    onClick: () => void,
    onHover?: () => void,
    //children: any
    children: any,
}

export default function Interactable(props: InteractiveElementProps) {
    let childRef: Element3D | undefined;
    const resolved = children(() => props.children)
    // Todo: change this stupid typing
    onMount(() => {
        if(childRef && childRef.three) {
            (childRef as Element3D).three.userData.onClick = props.onClick;
            // Likely will add default behavior here too. e.g interactables will glow.
            (childRef as Element3D).three.userData.onHover = props.onHover;
        }
    });

    return (
        <lume-element3d 
            ref={childRef}
            align-point="0.5 0.5"
        >
            {resolved()}
        </lume-element3d>
    )
    
}
