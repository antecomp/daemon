import { InteractableObject3D } from "@/core/interaction/interactable.types";
import { Gimbal } from "@/extra.types";
import { isSceneLocked } from "@/layers/UILayerStore";
import lerp from "@/utils/lerp";
import { onCleanup, onMount, Scene, PerspectiveCamera, createEffect, Element3D } from "lume";
import { Object3D, Raycaster, Vector2 } from "three";

export type XYZ = [number, number, number]; // just a lazy local type for the tuple.

const DEFAULT_CAMERA_SPEED = 7;

// Helper function to return updated x,y,z values given current and target.
// will either lerp or snap (based on animate bool).
function getCameraTransform(
    prev: [number, number, number],
    target: [number, number, number],
    dt: number,
    animate: boolean,
    speed: number
  ): [number, number, number] {
    if (animate) {
        const dtInSec = dt / 1000;
        const factor = 1 - Math.exp(-speed * dtInSec); // Change me later probably.
      return [
        lerp(prev[0], target[0], factor),
        lerp(prev[1], target[1], factor),
        lerp(prev[2], target[2], factor),
      ];
    } else {
      return target;
    }
}

/**
 * The main camera system for the game. Has an initial "base" setting for the point-and-click player camera,
 * which runs and performs all the raycast/interaction logic + head movement on mouse move. This camera can then 
 * be temporarily overridden (disabling the interaction/mouse logic) by setting override position/orientation paramaters.
 * These override params can be used for cinematic sequences, in-dialogue VN cameras, etc.
 *
 * @param props.basePos - The base position of the camera in the 3D space. [x,y,z]
 * @param props.baseOri - The base orientation of the camera. {yaw: #, pitch: #}
 * @param props.overridePos - An optional override for the camera's position.
 * @param props.overrideOri - An optional override for the camera's orientation.
 * @param props.animate - Whether the camera's movements should be animated (lerp from current value to new base/override values). Defaults to `false`. 
 * @param props.speed - The speed of the camera's animation. Defaults to `10`.
 * @param props.maxYaw - The maximum yaw offset for mouse movement. As in, how far can we look left/right from base ori
 * @param props.maxPitch - The maximum pitch offset for mouse movement. As in, how far can we tilt our head up/down from base ori.
 * @param props.sceneRef - A reference to the 3D scene containing the camera, used to attach event listeners.
 *
 * @remarks
 * - The camera uses raycasting to detect hover and click interactions with objects in the scene.
 * - Mouse movements adjust the camera's yaw and pitch within the specified limits.
 * - The camera's position and orientation can be overridden programmatically.
 * - Cleanup is performed on component unmount to remove event listeners.
 * - The camera system live-reads the value of input props, meaning transitions and updates are performed simply
 * - by updating the props (typically by using signals for prop inputs and changing those as needed.)
 *
 * @returns A JSX element representing the camera system.
 */
export default function PlayerCam(props: {
    basePos: XYZ, baseOri: Omit<Gimbal, "roll">, 
    overridePos?: XYZ, overrideOri?: Omit<Gimbal, "roll">
    animate?: boolean;
    speed?: number
    maxYaw: number,
    maxPitch: number,
    sceneRef: Scene
}) {

    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const mouseOffset = {yaw: 0, pitch: 0};

    let previouslyHoveredObject: Object3D | null = null;
    let previousUV: Vector2 | null = null;

    let camRef!: PerspectiveCamera;
    let bodyRef!: Element3D

    function runHoverRaycast() {
        if( props.overrideOri || props.overridePos || isSceneLocked()) return;
        raycaster.setFromCamera(mouse, camRef.three);

        const intersects = raycaster.intersectObjects(props.sceneRef.three.children, true);
        const hoveredIntersection = intersects.length > 0 ? intersects[0] : null;
        const hoveredObject: (InteractableObject3D | null) = hoveredIntersection?.object ?? null;
        const uv = hoveredIntersection?.uv ? hoveredIntersection.uv.clone() : new Vector2();

        // If the object and UV are unchanged, skip updates
        if (hoveredObject === previouslyHoveredObject && previousUV?.equals(uv)) return;

        if (previouslyHoveredObject && hoveredObject !== previouslyHoveredObject) {
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
        previousUV = uv;
    }

    function handleClick() {
        if(isSceneLocked() || props.overrideOri || props.overridePos) return;
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
        // Omitting override from guard on purpose, we want to lerp back to the most recent mouse position on end.
        if(isSceneLocked()) return;
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

        bodyRef.rotation = (prevX, prevY, prevZ, _t, dt) => {
            const baseYaw = props.baseOri.yaw;
            const effectiveYaw = props.overrideOri
              ? props.overrideOri.yaw
              : baseYaw + mouseOffset.yaw;
            return getCameraTransform(
                [prevX, prevY, prevZ],
                [prevX, effectiveYaw, prevZ],
                dt,
                ((props.overrideOri == undefined) || (props.animate ?? false)),
                props.speed ?? DEFAULT_CAMERA_SPEED
            )
        }

        camRef.rotation = (prevX, prevY, prevZ, _t, dt) => {
            // Side effect, also run raycast when we update rotation. Only needed in one place.
            runHoverRaycast();

            const basePitch = props.baseOri.pitch;
            const effectivePitch = props.overrideOri
              ? props.overrideOri.pitch
              : basePitch + mouseOffset.pitch;
            return getCameraTransform(
                [prevX, prevY, prevZ],
                [effectivePitch, prevY, prevZ],
                dt,
                ((props.overrideOri == undefined) || (props.animate ?? false)),
                props.speed ?? DEFAULT_CAMERA_SPEED
            )
        }
    });

    onCleanup(() => {
        props.sceneRef.removeEventListener("mousemove", handleMouseMove);
        props.sceneRef.removeEventListener("click", handleClick);
    });

    createEffect(() => {
        if((props.overrideOri || props.overridePos) && previouslyHoveredObject) {
            if (previouslyHoveredObject) {
                previouslyHoveredObject.traverseAncestors(a => {
                    if (a.userData.onHoverLeave) a.userData.onHoverLeave();
                });
            }

            previouslyHoveredObject = null;
            previousUV = null;
        }
    })

    return (
        <lume-element3d id="cam_body" align-point="0.5 0.5" ref={bodyRef}>
            <lume-perspective-camera id="cam_head" active ref={camRef} />
        </lume-element3d>
    )
}