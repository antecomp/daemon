import { LumePosition } from "@/extra.types";
import { CameraBehavior } from "../multicam.types"


export function snapTo(pos: LumePosition, yaw: number, pitch: number): CameraBehavior {
    return {
        init({ body, cam }) {
            body.position = pos;
            body.rotation = `0 ${yaw} 0`;
            cam.rotation = `${pitch}, 0, 0`;
        },
    };
}
