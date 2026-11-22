import { DGDEV } from "@/devtools/dev";
import { XYZ } from "@/shared/types/3d.types";
import { onMount, type Element3D, type PerspectiveCamera, type Scene } from "lume";
import { damp } from "three/src/math/MathUtils.js";

// Corresponds to the speed/acceleration curve for the damp function
const LAMBDA = 4;

export default function createCamera() {
    let camRef!: PerspectiveCamera;
    let bodyRef!: Element3D;
    let scene: Scene;

    let target: XYZ = [0, 0, 0];
    const goto = (pos: XYZ) => { target = pos };

    DGDEV.attach(goto, 'tgoto');

    return {
        goto,
        Camera: () => {
            onMount(() => {
                scene = camRef.scene!;

                bodyRef.position = (x, y, z, _t, dt) => [
                    damp(x, target[0], LAMBDA, dt / 1000),
                    damp(y, target[1], LAMBDA, dt / 1000),
                    damp(z, target[2], LAMBDA, dt / 1000),
                ];


            });

            return (
                <lume-element3d id="cam_body" align-point="0.5 0.5" ref={bodyRef}>
                    <lume-perspective-camera id="cam_head" active ref={camRef}
                        far="9999" // for dev purposes, see everything. Remove for prod.
                    />
                </lume-element3d>
            )
        },
    }
}