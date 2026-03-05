import { InteractableObject3D } from "@/core/interaction/interactable.types";
import lerp from "@/shared/utils/lerp";
import { setHoverCursor } from "@/app/shell/scene-container/SceneContainer";
import { Scene, PerspectiveCamera, Element3D } from "lume";
import { onCleanup, onMount, createEffect } from "solid-js";
import { Object3D, Raycaster, Vector2 } from "three";
import { sceneLock } from "@/app/shell/locks/UILockManager";
import { DEFAULT_CAMERA_SPEED } from "@/config/3d.config";
import { PlayerCameraControls } from "./camera.types";

/** 
 * Helper function to return updated x,y,z values given current and target.
 * will either lerp or snap (based on animate bool).
*/
function getCameraTransform(
    prev: [number, number, number],
    target: [number, number, number],
    dt: number,
    animate: boolean,
    speed: number
): [number, number, number] {
    if (animate) {
        const dtInSec = dt / 1000;
        return [
            lerp(prev[0], target[0], speed * dtInSec),
            lerp(prev[1], target[1], speed * dtInSec),
            lerp(prev[2], target[2], speed * dtInSec),
        ];
    } else {
        return target;
    }
}

/** Lerp angles in degrees along the shortest path to avoid unwinding spins. */
function lerpAngleDeg(prev: number, target: number, t: number) {
    const clampedT = Math.min(Math.max(t, 0), 1);
    let delta = ((target - prev + 180) % 360) - 180;
    if (delta < -180) delta += 360;
    return prev + delta * clampedT;
}

/**
 * The main camera system for the game. Has an initial "base" setting for the point-and-click player camera,
 * which runs and performs all the raycast/interaction logic + head movement on mouse move. This camera can then 
 * be temporarily overridden (disabling the interaction/mouse logic) by setting override position/orientation paramaters.
 * These override params can be used for cinematic sequences, in-dialogue VN cameras, etc.
 */
export default function PlayerCam(props: PlayerCameraControls & {sceneRef: Scene}) {

    const raycaster = new Raycaster();
    createEffect(() => {
        raycaster.far = props.interactionDistance ?? Infinity;
    });
    const mouse = new Vector2();
    const mouseOffset = { yaw: 0, pitch: 0 };

    let previouslyHoveredObject: Object3D | null = null;
    let previousUV: Vector2 | null = null;

    let camRef!: PerspectiveCamera;
    let bodyRef!: Element3D

    function runHoverRaycast() {
        if (props.overrideOri || props.overridePos || sceneLock.isLocked()) {
            if (previouslyHoveredObject) {
                previouslyHoveredObject.userData.onHoverLeave?.();
                previouslyHoveredObject.traverseAncestors(a => {
                    a.userData.onHoverLeave?.();
                });
                previouslyHoveredObject = null;
                setHoverCursor(undefined);
                previousUV = null;
            }
            return;
        }

        raycaster.setFromCamera(mouse, camRef.three);

        const intersects = raycaster.intersectObjects(props.sceneRef.three.children, true);
        const hoveredIntersection = intersects.length > 0 ? intersects[0] : null;
        const hoveredObject: (InteractableObject3D | null) = hoveredIntersection?.object ?? null;
        const uv = hoveredIntersection?.uv ? hoveredIntersection.uv.clone() : new Vector2();

        // If the object and UV are unchanged, skip updates
        if (hoveredObject === previouslyHoveredObject && previousUV?.equals(uv)) return;

        if (previouslyHoveredObject && hoveredObject !== previouslyHoveredObject) {
            previouslyHoveredObject.userData.onHoverLeave?.();
            previouslyHoveredObject.traverseAncestors(a => {
                a.userData.onHoverLeave?.();
            });
        }

        if (hoveredObject) {
            hoveredObject.userData.onHover?.(uv, mouse);
            hoveredObject.traverseAncestors(a => {
                (a as InteractableObject3D).userData.onHover?.(uv, mouse);
            });
        }

        // Update previous tracking variables
        previouslyHoveredObject = hoveredObject;
        setHoverCursor(hoveredObject?.userData.cursor);
        previousUV = uv;
    }

    function handleClick() {
        if (sceneLock.isLocked() || props.overrideOri || props.overridePos) return;
        const intersects = raycaster.intersectObjects(props.sceneRef.three.children, true);
        if (intersects.length > 0) {
            const clickedIntersection = intersects[0];
            const clickedObject: InteractableObject3D = clickedIntersection.object;

            const uv = clickedIntersection.uv ? clickedIntersection.uv.clone() : new Vector2();

            clickedObject.userData.onClick?.(uv, mouse);
            clickedObject.traverseAncestors((a) => {
                (a as InteractableObject3D).userData.onClick?.(uv, mouse);
            });
        }
    }

    function handleMouseMove(e: MouseEvent) {
        // Keep guard - feels for natural that the camera moves after we move the mouse, not right when the lock is released.
        if (sceneLock.isLocked()) return;
        const rect = props.sceneRef.getBoundingClientRect();
        const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        mouseOffset.yaw = -xNorm * props.maxYaw;
        mouseOffset.pitch = yNorm * props.maxPitch;

        mouse.set(xNorm, -yNorm);
    }

    onMount(() => {
        props.sceneRef.addEventListener("mousemove", handleMouseMove);
        props.sceneRef.addEventListener("click", handleClick);

        // Imperative set of initial values, updater functions take off from here.
        bodyRef.position = props.overridePos ?? props.basePos
        bodyRef.rotation = props.overrideOri
            ? `0 ${props.overrideOri.yaw} 0`
            : `0 ${props.baseOri.yaw} 0`

        camRef.rotation = props.overrideOri
            ? `${props.overrideOri.pitch} 0 0`
            : `${props.baseOri.pitch} 0 0`


        // Updater Functions.
        bodyRef.position = (prevX, prevY, prevZ, _t, dt) => {
            const targetPosition = props.overridePos ?? props.basePos;
            return getCameraTransform(
                [prevX, prevY, prevZ],
                targetPosition,
                dt,
                props.animate ?? false,
                props.speed ?? DEFAULT_CAMERA_SPEED
            )
        }

        // stores the intermediate (lerped) state of the mouse offset for smooth camera movement.
        // it's used when animation is off and we need to lerp *just* the offset but not the base position.
        let mouseInter = { yaw: 0, pitch: 0 };

        bodyRef.rotation = (prevX, prevY, prevZ, _t, dt) => {

            // When animate on, let cameraControl handle joint lerping
            // otherwise we lerp just the mouse and add it static.
            mouseInter.yaw = (props.animate)
                ? mouseOffset.yaw
                : lerp(mouseInter.yaw, mouseOffset.yaw, (props.speed ?? DEFAULT_CAMERA_SPEED) * (dt / 1000));

            const baseYaw = props.baseOri.yaw;
            const effectiveYaw = props.overrideOri
                ? props.overrideOri.yaw
                : baseYaw + mouseInter.yaw;

            if (props.animate) {
                const dtInSec = dt / 1000;
                const t = (props.speed ?? DEFAULT_CAMERA_SPEED) * dtInSec;
                return [prevX, lerpAngleDeg(prevY, effectiveYaw, t), prevZ];
            }

            return [prevX, effectiveYaw, prevZ];
        }

        camRef.rotation = (prevX, prevY, prevZ, _t, dt) => {
            // Side effect, also run raycast when we update rotation. Only needed in one place.
            runHoverRaycast();

            // When animate on, let cameraControl handle joint lerping
            // otherwise we lerp just the mouse and add it static.
            mouseInter.pitch = (props.animate)
                ? mouseOffset.pitch
                : lerp(mouseInter.pitch, mouseOffset.pitch, (props.speed ?? DEFAULT_CAMERA_SPEED) * (dt / 1000));

            const basePitch = props.baseOri.pitch;
            const effectivePitch = (props.overrideOri)
                ? props.overrideOri.pitch
                : basePitch + mouseInter.pitch;

            if (props.animate) {
                const dtInSec = dt / 1000;
                const t = (props.speed ?? DEFAULT_CAMERA_SPEED) * dtInSec;
                return [lerpAngleDeg(prevX, effectivePitch, t), prevY, prevZ];
            }

            return [effectivePitch, prevY, prevZ];
        }
    });

    onCleanup(() => {
        props.sceneRef.removeEventListener("mousemove", handleMouseMove);
        props.sceneRef.removeEventListener("click", handleClick);
        setHoverCursor(undefined);
    });

    createEffect(() => {
        if ((props.overrideOri || props.overridePos) && previouslyHoveredObject) {
            if (previouslyHoveredObject) {
                previouslyHoveredObject.traverseAncestors(a => {
                    if (a.userData.onHoverLeave) a.userData.onHoverLeave();
                });
            }

            previouslyHoveredObject = null;
            setHoverCursor(undefined);
            previousUV = null;
        }
    });

    return (
        <lume-element3d id="cam_body" align-point="0.5 0.5" ref={bodyRef}>
            <lume-perspective-camera id="cam_head" active ref={camRef}
                far="9999" // for dev purposes, see everything. Remove for prod.
            />
        </lume-element3d>
    )
}
