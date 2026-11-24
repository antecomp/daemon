import { DGDEV } from "@/devtools/dev";
import { XYZ } from "@/shared/types/3d.types";
import { Motor, onCleanup, onMount, RenderTask, type Element3D, type PerspectiveCamera, type Scene } from "lume";
import { damp } from "three/src/math/MathUtils.js";
import { createSignal } from 'solid-js';
import { Layer, Outcome, Pose, TransitionMode } from "./cam.types";

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

export default function createCamera(
    initial: Pose = {
        pos: [0, 0, 0],
        yaw: 0,
        pitch: 0
    }
) {
    // hoisted for passing to other hooks...
    let scene: Scene;

    // -- state --
    const [cur, setCur] = createSignal<Pose>(initial);
    let target: Pose = initial;

    let trans: TransitionMode = 'ease';

    const stack: Layer[] = [{ pose: initial, trans }];
    const top = () => stack[stack.length - 1].pose;

    let inflight: ((o: Outcome) => void) | null = null;

    // -- logic & helpers

    // "head for whatever is on top now"
    const retarget = (t: TransitionMode) => {
        inflight?.('diverted');
        target = top();
        trans = t;
        return new Promise<Outcome>(r => (inflight = r));
    }

    // -- api --
    const goto = (to: Partial<Pose>, t: TransitionMode = 'ease') => {
        stack[0].pose = { ...stack[0].pose, ...to };
        return stack.length > 1 ? Promise.resolve<Outcome>('unchanged') : retarget(t);
    }

    const override = (to: Partial<Pose>, t: TransitionMode = 'ease') => {
        const layer: Layer = { pose: null!, trans: t };
        return {
            commit() {
                if (stack[stack.length - 1] === layer) return Promise.resolve<Outcome>('unchanged');
                layer.pose = { ...top(), ...to };
                stack.push(layer);
                return retarget(t);
            },
            release(rt: TransitionMode = t) {
                const i = stack.indexOf(layer);
                if (i === -1) return Promise.resolve<Outcome>('arrived');   // never committed, or already released
                stack.splice(i, 1);
                return i === stack.length // was at top?
                    ? retarget(rt)
                    : Promise.resolve<Outcome>('unchanged');
            }
        }
    }


    DGDEV.attach(goto, 'tgoto');
    DGDEV.attach(override, 'tover');

    // -- ticker --
    const step = (dt: number) => {
        let next: Pose;
        const current = cur();
        if (trans === 'cut') {
            next = target;
        } else {
            next = {
                pos: current.pos.map((cv, i) => damp(cv, target.pos[i], LAMBDA, dt)) as XYZ,
                yaw: damp(current.yaw, target.yaw, LAMBDA, dt), // todo replace with shortest path + "winding" handle
                pitch: damp(current.pitch, target.pitch, LAMBDA, dt) // todo replace with shortest path + "winding" handle
            };
        }

        if(inflight && settled(next, target)) {
            setCur(target);
            inflight('arrived');
            inflight = null;
        } else {
            setCur(next);
        }
    };


    return {
        goto, override,

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
                    rotation={`0 ${cur().yaw} 0`}
                    position={cur().pos.join(' ')}
                >
                    <lume-perspective-camera id="
                        cam_head" active ref={camRef}
                        far="9999" // for dev purposes, see everything. Remove for prod.
                        rotation={`${cur().pitch}`}
                    />
                </lume-element3d>
            )
        },
    }
}
