import { DGDEV } from "@/devtools/dev";
import { XYZ } from "@/shared/types/3d.types";
import { Motor, onCleanup, onMount, RenderTask, type Element3D, type PerspectiveCamera, type Scene } from "lume";
import { damp } from "three/src/math/MathUtils.js";
import { createSignal } from 'solid-js';
import { Pose } from "./cam.types";

// Corresponds to the speed/acceleration curve for the damp function
const LAMBDA = 4;

const POS_EPS = 0.05;
const ANG_EPS = 0.1;

function settled(current: Pose, target: Pose) {
    return Math.hypot(
        ...current.pos.map((ci, i) => ci - target.pos[i])
    ) < POS_EPS
        && Math.abs(current.yaw - target.yaw) < ANG_EPS
        && Math.abs(current.pitch - target.pitch) < ANG_EPS
}

type Outcome = 'arrived' | 'diverted';

export default function createCamera() {
    // hoisted for passing to other hooks...
    let scene: Scene;

    // -- state --
    const [pose, setPose] = createSignal<Pose>({
        pos: [0, 0, 0],
        yaw: 0,
        pitch: 0
    });
    let target: Pose = pose();

    let pending: ((o: Outcome) => void) | null = null;

    // -- api --
    const goto = (u: Partial<Pose>) => {
        target = { ...target, ...u };
        pending?.('diverted');
        return new Promise<Outcome>(r => { pending = r });
    }
    DGDEV.attach(goto, 'tgoto');

    // -- logic, ticker --
    const step = (dt: number) => {
        const current = pose();
        let next: Pose = {
            pos: current.pos.map((cv, i) => damp(cv, target.pos[i], LAMBDA, dt)) as XYZ,
            yaw: damp(current.yaw, target.yaw, LAMBDA, dt),
            pitch: damp(current.pitch, target.pitch, LAMBDA, dt)
        };
        if (pending && settled(next, target)) { next = target; pending('arrived'); pending = null; }
        setPose(next);
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
                <lume-element3d 
                    id="cam_body" 
                    align-point="0.5 0.5" 
                    ref={bodyRef} 
                    rotation={`0 ${pose().yaw} 0`} 
                    position={pose().pos.join(' ')}
                >
                    <lume-perspective-camera id="
                        cam_head" active ref={camRef}
                        far="9999" // for dev purposes, see everything. Remove for prod.
                        rotation={`${pose().pitch}`}
                    />
                </lume-element3d>
            )
        },
    }
}