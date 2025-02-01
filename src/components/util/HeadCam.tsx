import { XYZNumberValues } from "lume";
import { onCleanup, onMount } from "solid-js";
import { Point } from "../../extra.types";
import lerp from "../../util/lerp";

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

    let currentPitch = props.baseOrientation.y;
    let targetPitch = props.baseOrientation.y;
    let currentYaw = props.baseOrientation.x;
    let targetYaw = props.baseOrientation.x;
    const smoothingFactor = 0.1;  // Adjust for more or less smoothness
    
    // Handle mouse movement and set target rotations
    const handleMouseMove = (event: MouseEvent) => {
      if (!camRef || !parentScene) return;
    
      const rect = parentScene.getBoundingClientRect();
      const { left, top, width, height } = rect;
    
      const relativeX = event.clientX - left;
      const relativeY = event.clientY - top;
    
      const normalizedX = (relativeX / width) * 2 - 1;
      const normalizedY = (relativeY / height) * 2 - 1;
    
      targetYaw = -normalizedX * props.maxYaw + props.baseOrientation.x;
      targetPitch = normalizedY * props.maxPitch + props.baseOrientation.y;
    };
    
    // Tweening function using requestAnimationFrame
    const updateCameraRotation = () => {
      if (!camRef) return;
    
      // Apply linear interpolation to pitch and yaw
      currentYaw = lerp(currentYaw, targetYaw, smoothingFactor);
      currentPitch = lerp(currentPitch, targetPitch, smoothingFactor);
    
      // Update the camera rotation
      bodyRef.rotation.y = currentYaw;
      camRef.rotation.x = currentPitch;
    
      // Continue updating on each frame
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
            rotation={`0 ${props.baseOrientation.x} 0`}
        >
            <lume-perspective-camera 
                ref={camRef} 
                active
                rotation={`${props.baseOrientation.y} 0 0`}
            ></lume-perspective-camera>
        </lume-element3d>
    )
}