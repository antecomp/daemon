import { InteractableObject3D } from "@/core/interaction/interactable.types";
import { Gimbal } from "@/extra.types";
import { isSceneLocked } from "@/layers/UILayerStore";
import lerp from "@/utils/lerp";
import { onCleanup, onMount, Scene, PerspectiveCamera, createEffect } from "lume";
import { Object3D, Raycaster, Vector2 } from "three";

type XYZ = [number, number, number];

function getCameraTransform(
    prev: [number, number, number],
    target: [number, number, number],
    dt: number,
    animate: boolean,
    speed: number
  ): [number, number, number] {
    if (animate) {
        const dtInSec = dt / 1000;
        const factor = 1 - Math.exp(-speed * dtInSec);
      return [
        lerp(prev[0], target[0], factor),
        lerp(prev[1], target[1], factor),
        lerp(prev[2], target[2], factor),
      ];
    } else {
      return target;
    }
}


export default function NewCam(props: {
    basePos: XYZ, baseOri: Omit<Gimbal, "roll">, 
    overridePos?: XYZ, overrideOri?: Omit<Gimbal, "roll">
    animate?: boolean;
    speed?: number

    // playercam
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
        if(props.overrideOri || props.overridePos || isSceneLocked()) return;
        
        const rect = props.sceneRef.getBoundingClientRect();
        const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        mouseOffset.yaw = -xNorm * props.maxYaw + props.baseOri.yaw;
        mouseOffset.pitch = yNorm * props.maxPitch + props.baseOri.pitch;

        mouse.set(xNorm, -yNorm);
    }

    onMount(() => {
        props.sceneRef.addEventListener("mousemove", handleMouseMove);
        props.sceneRef.addEventListener("click", handleClick);
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
        <lume-element3d 
            id="cam_body" align-point="0.5 0.5"

            //@ts-expect-error
            position={(prevX, prevY, prevZ, _t, dt) => {
                const targetPosition = props.overridePos ?? props.basePos;
                return getCameraTransform(
                    [prevX, prevY, prevZ],
                    targetPosition,
                    dt,
                    props.animate ?? false,
                    props.speed ?? 10
                )
            }}

            //@ts-expect-error
            rotation={(prevX, prevY, prevZ, _t, dt) => {
                const baseYaw = props.baseOri.yaw;
                const effectiveYaw = props.overrideOri
                  ? props.overrideOri.yaw
                  : baseYaw + mouseOffset.yaw;
                return getCameraTransform(
                    [prevX, prevY, prevZ],
                    [prevX, effectiveYaw, prevZ],
                    dt,
                    //props.animate ?? false,
                    ((props.overrideOri == undefined) || (props.animate ?? false)),
                    props.speed ?? 10
                )
            }}

        >
            <lume-perspective-camera 
                id="cam_head" active 
                ref={camRef}

                //@ts-expect-error
                rotation={(prevX, prevY, prevZ, _t, dt) => {

                    // lazy, may be a better place for this
                    runHoverRaycast();

                    const basePitch = props.baseOri.pitch;
                    const effectivePitch = props.overrideOri
                      ? props.overrideOri.pitch
                      : basePitch + mouseOffset.pitch;
                    return getCameraTransform(
                        [prevX, prevY, prevZ],
                        [effectivePitch, prevY, prevZ],
                        dt,
                        //props.animate ?? false,
                        ((props.overrideOri == undefined) || (props.animate ?? false)),
                        props.speed ?? 10
                    )
                }}
            />
        </lume-element3d>
    )
}