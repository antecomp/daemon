import { XYZNumberValues } from "lume";
import { onCleanup, onMount } from "solid-js";
import { Gimbal } from "../../extra.types";
import lerp from "../../util/lerp";

interface HeadCamProps {
    position: XYZNumberValues | string, 
    baseOrientation: Omit<Gimbal, "roll">, // making strictly XYZ number values 
    maxYaw: number, 
    maxPitch: number
}


/**
 * HeadCam is the main camera used for Scenes, it is positioned and orientated at some specified initial point. Then, it is rotated slightly within some small range corresponding with the mouse position over the containing scene canvas.
 * @param baseOrientation - Gimbal (omitting "roll"), a yaw and pitch to use as the initial camera angle that the motion is added to.
 * @param position - initial position of the camera.
 * @param maxYaw - maximum yaw (in both directions) from the baseOrientation's yaw.
 * @param maxPitch - maximum pitch (in both directions) from the baseOrientation's pitch.
 * @returns 
 */
export default function HeadCam(props: HeadCamProps) {
    let camRef: any; 
    let bodyRef: any;
    let parentScene: HTMLElement;

    // Purposefully breaking reactivity - we just want a clone of initial.
    let currentPitch = props.baseOrientation.pitch;
    let targetPitch = props.baseOrientation.pitch;
    let currentYaw = props.baseOrientation.yaw;
    let targetYaw = props.baseOrientation.yaw;
    const smoothingFactor = 0.1;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!camRef || !parentScene) return;
    
      const rect = parentScene.getBoundingClientRect();
      const { left, top, width, height } = rect;
    
      const relativeX = event.clientX - left;
      const relativeY = event.clientY - top;
    
      // Puts x,y in a [-1,1] range to easily use as pitch and yaw scale :)
      const normalizedX = (relativeX / width) * 2 - 1;
      const normalizedY = (relativeY / height) * 2 - 1;
    
      targetYaw = -normalizedX * props.maxYaw + props.baseOrientation.yaw;
      targetPitch = normalizedY * props.maxPitch + props.baseOrientation.pitch;
    };
    
    // Tweening function using requestAnimationFrame
    const updateCameraRotation = () => {
      if (!camRef) return;
    
      currentYaw = lerp(currentYaw, targetYaw, smoothingFactor);
      currentPitch = lerp(currentPitch, targetPitch, smoothingFactor);
    
      bodyRef.rotation.y = currentYaw;
      camRef.rotation.x = currentPitch;
    
      requestAnimationFrame(updateCameraRotation);
    };

    onMount(() => {
        if(bodyRef && bodyRef.parentElement) {
            console.log(bodyRef.parentElement);
            parentScene = bodyRef.parentElement;

            parentScene.addEventListener('mousemove', handleMouseMove);
            requestAnimationFrame(updateCameraRotation);
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
            rotation={`0 ${props.baseOrientation.yaw} 0`}
        >
            <lume-perspective-camera 
                ref={camRef} 
                active
                rotation={`${props.baseOrientation.pitch} 0 0`}
            ></lume-perspective-camera>
        </lume-element3d>
    )
}