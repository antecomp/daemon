import { XYZNumberValues } from "lume";
import { onCleanup, onMount } from "solid-js";
import { Point } from "../../extra.types";

interface HeadCamProps {
    position: XYZNumberValues | string, 
    baseOrientation: Point, // making strictly XYZ number values 
    maxYaw: number, 
    maxPitch: number
}

export default function HeadCam(props: HeadCamProps) {
    let camRef: any; 
    let bodyRef: any;
    let parentScene: HTMLElement;

    const handleMouseMove = (event: MouseEvent) => {
        if (!camRef) return;

        const rect = parentScene!.getBoundingClientRect();
        const {left, top, width, height} = rect;

        const relativeX = event.clientX - left;
        const relativeY = event.clientY - top;

        const normalizedX = (relativeX / width) * 2 - 1;
        const normalizedY = (relativeY / height) * 2 - 1;

        const yaw = -normalizedX * props.maxYaw
        const pitch = normalizedY * props.maxPitch;


        // NOTE: IF OUR AMOUNTS EVER GET INTENSE ENOUGH FOR GIMBAL LOCK SWITCH TO A BODY/TRIPOD MODEL!!!
        camRef.rotation.x = pitch + props.baseOrientation.x;
        bodyRef.rotation.y = yaw + props.baseOrientation.y;
    }

    onMount(() => {
        if(bodyRef && bodyRef.parentElement) {
            console.log(bodyRef.parentElement);
            parentScene = bodyRef.parentElement;

            parentScene.addEventListener('mousemove', handleMouseMove);
        }
    });

    onCleanup(() => {
        parentScene?.removeEventListener('mousemove', handleMouseMove);
    })

    return (
        <lume-element3d
            ref={bodyRef}
            align-point="0.5 0.5"
            position={props.position}
            rotation={`0 ${props.baseOrientation.y} 0`}
        >
            <lume-perspective-camera 
                ref={camRef} 
                active
                rotation={`${props.baseOrientation.x} 0 0`}
            ></lume-perspective-camera>
        </lume-element3d>
    )
}