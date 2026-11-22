import { DGDEV } from "@/devtools/dev";
import { XYZ } from "@/shared/types/3d.types";
import { Motor, onCleanup, onMount, RenderTask, type Element3D, type PerspectiveCamera, type Scene } from "lume";
import { damp } from "three/src/math/MathUtils.js";
import { createSignal } from 'solid-js';

// Corresponds to the speed/acceleration curve for the damp function
const LAMBDA = 4;

// "Close enough" diff of squares error
const EPS = 0.05;
function closeEnough(current: XYZ, target: XYZ) {
    return Math.hypot(
        current[0] - target[0],
        current[1] - target[1],
        current[2] - target[2]
    ) < EPS;
}

type Outcome = 'arrived' | 'diverted';

export default function createCamera() {
    // hoisted for passing to other hooks...
    let scene: Scene;

    // -- state --
    const [currentPos, setCurrentPos] = createSignal<XYZ>([0, 0, 0]);
    let target: XYZ = [0, 0, 0];
    let pending: ((o: Outcome) => void) | null = null;

    // -- api --
    const goto = (pos: XYZ) => {
        target = pos;
        pending?.('diverted');
        return new Promise<Outcome>(r => { pending = r });
    }
    DGDEV.attach(goto, 'tgoto');

    // -- logic, ticker --
    const step = (dt: number) => {
        const c = currentPos();   // reading it here isn't tracked, so it's fine
        let next: XYZ = c.map((ci, i) => damp(ci, target[i], LAMBDA, dt)) as XYZ;
        if (pending && closeEnough(next, target)) { next = target; pending('arrived'); pending = null; }
        setCurrentPos(next);
    };


    return {
        goto,

        Camera: () => {
            // Hoist if/when needed.
            let camRef!: PerspectiveCamera;
            let bodyRef!: Element3D;

            let task: RenderTask;

            onMount(() => {
                scene = camRef.scene!;

                task = Motor.addRenderTask((_t, dtMs) => { step(dtMs / 1000) });
            });

            onCleanup(() => Motor.removeRenderTask(task));

            return (
                <lume-element3d id="cam_body" align-point="0.5 0.5" ref={bodyRef} position={currentPos().join(' ')}>
                    <lume-perspective-camera id="cam_head" active ref={camRef}
                        far="9999" // for dev purposes, see everything. Remove for prod.
                    />
                </lume-element3d>
            )
        },
    }
}