import { Gimbal } from "@/extra.types";
import lerp from "@/utils/lerp";

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
}) {
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
                const targetYaw = props.overrideOri?.yaw ?? props.baseOri.yaw;
                return updateCameraTransform(
                    [prevX, prevY, prevZ],
                    [prevX, targetYaw, prevZ],
                    dt,
                    props.animate ?? false,
                    props.speed ?? 10
                )
            }}

        >
            <lume-perspective-camera 
                id="cam_head" active 

                //@ts-expect-error
                rotation={(prevX, prevY, prevZ, _t, dt) => {
                    const targetPitch = props.overrideOri?.pitch ?? props.baseOri.pitch;
                    return updateCameraTransform(
                        [prevX, prevY, prevZ],
                        [targetPitch, prevY, prevZ],
                        dt,
                        props.animate ?? false,
                        props.speed ?? 10
                    )
                }}
            />
        </lume-element3d>
    )
}