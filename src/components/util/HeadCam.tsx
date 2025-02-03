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
    let camRef: PerspectiveCamera | undefined;
    let bodyRef: Element3D | undefined;
    let parentScene: Element3D;
    let animationFrameId: number;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Side note, I probably won't do this for position
    // Or ill make it optional by some prop. Often we may want to "snap" to a location,
    // not interpolate there.
    let currentPitch = props.baseOrientation.pitch;
    let targetPitch = props.baseOrientation.pitch;
    let currentYaw = props.baseOrientation.yaw;
    let targetYaw = props.baseOrientation.yaw;
    const smoothingFactor = 0.1;

    // diff this for onHoverLeave check
    let previouslyHoveredObject: THREE.Object3D | null = null;

    const handleMouseMove = (event: MouseEvent) => {
        if (!camRef || !parentScene) return;

        const rect = parentScene.getBoundingClientRect();
        const { left, top, width, height } = rect;

        const normalizedX = ((event.clientX - left) / width) * 2 - 1;
        const normalizedY = ((event.clientY - top) / height) * 2 - 1;

        targetYaw = -normalizedX * props.maxYaw + props.baseOrientation.yaw;
        targetPitch = normalizedY * props.maxPitch + props.baseOrientation.pitch;

        // Raycasting
        mouse.set(normalizedX, -normalizedY);
        raycaster.setFromCamera(mouse, camRef.three);

        const intersects = raycaster.intersectObjects(parentScene.three.children, true);
        const hoveredObject = intersects.length > 0 ? intersects[0].object : null;

        if (hoveredObject !== previouslyHoveredObject) {
            if (previouslyHoveredObject) {
                previouslyHoveredObject.traverseAncestors(a => {
                    if (a.userData.onHoverLeave) a.userData.onHoverLeave();
                });
            }

            if (hoveredObject) {
                hoveredObject.traverseAncestors(a => {
                    if (a.userData.onHover) a.userData.onHover();
                });
            }

            previouslyHoveredObject = hoveredObject;
        }
    };

    const handleClick = () => {
        const intersects = raycaster.intersectObjects(parentScene.three.children, true);
        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            clickedObject.traverseAncestors(a => {
                if (a.userData.onClick) a.userData.onClick();
            });
        }
    };

    const updateCameraRotation = () => {
        if (!camRef || !bodyRef) return;

        currentYaw = lerp(currentYaw, targetYaw, smoothingFactor);
        currentPitch = lerp(currentPitch, targetPitch, smoothingFactor);

        bodyRef.rotation.y = currentYaw;
        camRef.rotation.x = currentPitch;

        animationFrameId = requestAnimationFrame(updateCameraRotation);
    };

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
        cancelAnimationFrame(animationFrameId);
    });

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
    );
}