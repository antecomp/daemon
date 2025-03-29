import { LumePosition } from "@/extra.types";
import { CameraBehavior } from "./slopcam.types";
import sleep from "@/util/sleep";

export function snapTo(pos: LumePosition, yaw: number, pitch: number): CameraBehavior {
    return {
        init({body, cam}) {
            body.position = pos;
            body.rotation = `0 ${yaw} 0`;
            cam.rotation = `${pitch}, 0, 0`;
        },
        // No update. Static Camera
    }
}

export const oscillate = (pos: LumePosition, yaw: number, pitch: number): CameraBehavior => ({
    init({body, cam}) {
        body.position = pos;
        body.rotation = `0 ${yaw} 0`;
        cam.rotation = `${pitch}, 0, 0`;
        // No delay needed it appears, itll pick up on the set we just did :D
        body.position = (x, y, z) => [x, y, 0.02 * (0 - z) + z];
        body.rotation = (x, y) => [x+0.5, y+0.5];
    }
})