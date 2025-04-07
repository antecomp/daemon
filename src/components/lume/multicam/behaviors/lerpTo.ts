import { LumePosition } from "@/extra.types";
import { isCloseTo } from "@/util/isCloseTo";
import lerp, { lerpAngle } from "@/util/lerp";
import { XYZNumberValues } from "lume";
import { CameraBehavior } from "../multicam.types";


export function lerpTo(posData: [number, number, number] | LumePosition | XYZNumberValues, yaw: number, pitch: number, speed?: number, onComplete?: () => void): CameraBehavior {

    const position = new XYZNumberValues(posData);

    speed = speed ?? 0.02;
    return {
        init({ body, cam }) {
            let lerpComplete = false;

            body.position = (x, y, z) => {
                if (lerpComplete) return [x, y, z];

                if (isCloseTo(x, position.x, 1) && isCloseTo(y, position.y, 1) && isCloseTo(z, position.z, 1)) {
                    lerpComplete = true;
                    onComplete?.();
                }

                return [
                    lerp(x, position.x, speed),
                    lerp(y, position.y, speed),
                    lerp(z, position.z, speed)
                ];
            };

            body.rotation = (_xPrev, yPrev) => {
                const newYaw = lerpAngle(yPrev, yaw, speed);
                return [0, newYaw, 0];
            };

            cam.rotation = (xPrev) => {
                const newPitch = lerpAngle(xPrev, pitch, speed);
                return [newPitch, 0, 0];
            };
        }
    };
}export function lerpToAsync(
    position: [number, number, number],
    yaw: number,
    pitch: number,
    speed: number
): [CameraBehavior, Promise<void>] {
    let resolvePromise: () => void;
    const lerpPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
    });
    const behavior = lerpTo(position, yaw, pitch, speed, () => {
        resolvePromise();
    });
    return [behavior, lerpPromise];
}

