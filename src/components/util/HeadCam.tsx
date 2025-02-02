import { Element3D, PerspectiveCamera, XYZNumberValues } from "lume";
import { createEffect, onCleanup, onMount } from "solid-js";
import { Gimbal } from "../../extra.types";
import lerp from "../../util/lerp";
import * as THREE from 'three';

interface HeadCamProps {
    position: XYZNumberValues | string,
    baseOrientation: Omit<Gimbal, "roll">, // making strictly XYZ number values 
    maxYaw: number,
    maxPitch: number
}


/**
 * HeadCam is the main camera used for Scenes, it is positioned and orientated at some specified initial point. Then, it is rotated slightly within some small range corresponding with the mouse position over the containing scene canvas.
 * 
 * Headcam is also responsible for the raycasting and invoking Interactables onClick/onHover CBs.
 * @param baseOrientation - Gimbal (omitting "roll"), a yaw and pitch to use as the initial camera angle that the motion is added to.
 * @param position - initial position of the camera.
 * @param maxYaw - maximum yaw (in both directions) from the baseOrientation's yaw.
 * @param maxPitch - maximum pitch (in both directions) from the baseOrientation's pitch.
 * @returns 
 */
export default function HeadCam(props: HeadCamProps) {
    // TODO: For some reason I get a use before assign error if I make these Element3D instead of any?
    let camRef: PerspectiveCamera | undefined;
    let bodyRef: Element3D | undefined;
    let parentScene: Element3D;

    let animationFrameId: number;  // Store the ID for killing camera tween.

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

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



        // Raycasting
        mouse.x = normalizedX;
        mouse.y = -normalizedY;

        raycaster.setFromCamera(mouse, camRef.three);
        const intersects = raycaster.intersectObjects(parentScene.three.children, true);

        if(intersects.length > 0) {
            let clickedObject: THREE.Object3D<THREE.Object3DEventMap> | null = intersects[0].object;

            clickedObject?.traverseAncestors(a => {
                if (a.userData.onHover) {a.userData.onHover()}
            })
        }

    };

    // Interaction Click
    const handleClick = () => {
        const intersects = raycaster.intersectObjects(parentScene.three.children, true);

        if(intersects.length > 0) {
            let clickedObject: THREE.Object3D<THREE.Object3DEventMap> | null = intersects[0].object;

            // Need to bubble up to blank lume-element3d container.
            clickedObject?.traverseAncestors(a => {
                if (a.userData.onClick) {a.userData.onClick()}
            });
        }
    }

    // Tweening function using requestAnimationFrame
    const updateCameraRotation = () => {
        if (!camRef || !bodyRef) return;

        currentYaw = lerp(currentYaw, targetYaw, smoothingFactor);
        currentPitch = lerp(currentPitch, targetPitch, smoothingFactor);

        bodyRef.rotation.y = currentYaw;
        camRef.rotation.x = currentPitch;

        animationFrameId = requestAnimationFrame(updateCameraRotation);
    };

    // Reset target orientation when props.baseOrientation changes
    createEffect(() => {
        targetYaw = props.baseOrientation.yaw;
        targetPitch = props.baseOrientation.pitch;
    });

    onMount(() => {
        if (bodyRef && bodyRef.parentElement) {
            parentScene = bodyRef.parentElement as Element3D;

            parentScene.addEventListener('mousemove', handleMouseMove);
            parentScene.addEventListener('click', handleClick);
            animationFrameId = requestAnimationFrame(updateCameraRotation);
        }
    });

    onCleanup(() => {
        parentScene?.removeEventListener('mousemove', handleMouseMove);
        parentScene?.removeEventListener('click', handleClick);
        cancelAnimationFrame(animationFrameId); // kills updateCameraRotation.
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