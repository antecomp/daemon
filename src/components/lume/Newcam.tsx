import { Gimbal } from "@/extra.types";
import { isSceneLocked } from "@/layers/UILayerStore";
import lerp from "@/utils/lerp";
import { onCleanup, onMount, Scene } from "lume";
import { Vector2 } from "three";

type XYZ = [number, number, number];

function updateCameraTransform(
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

    const mouse = new Vector2();
    const mouseOffset = {yaw: 0, pitch: 0};

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
    });

    onCleanup(() => {
        props.sceneRef.removeEventListener("mousemove", handleMouseMove);
    });


    return (
        <lume-element3d 
            id="cam_body" align-point="0.5 0.5"

            //@ts-expect-error
            position={(prevX, prevY, prevZ, _t, dt) => {
                const targetPosition = props.overridePos ?? props.basePos;
                return updateCameraTransform(
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
                return updateCameraTransform(
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

                //@ts-expect-error
                rotation={(prevX, prevY, prevZ, _t, dt) => {
                    const basePitch = props.baseOri.pitch;
                    const effectivePitch = props.overrideOri
                      ? props.overrideOri.pitch
                      : basePitch + mouseOffset.pitch;
                    return updateCameraTransform(
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