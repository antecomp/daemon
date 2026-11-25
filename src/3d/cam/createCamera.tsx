import { DGDEV } from "@/devtools/dev";
import { XYZ } from "@/shared/types/3d.types";
import { Motor, onCleanup, onMount, RenderTask, type Element3D, type PerspectiveCamera, type Scene } from "lume";
import { damp } from "three/src/math/MathUtils.js";
import { createSignal } from 'solid-js';
import { Layer, Outcome, Pose, TransitionMode, Winding } from "./cam.types";
import nearestAngle from "@/shared/utils/nearestAngle";
import { Vector2 } from "three";
import trackMouse from "./trackMouse";

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

export const resolveYaw = (angle: number, ref: number, w: Winding = 'short') => {
    const near = nearestAngle(angle, ref);
    return w === 'short'
        ? near
        : near >= ref ? near - 360 : near + 360;
};

export default function createCamera(
    init: Partial<Pose> = {}
) {

    const initial: Pose = {
        ...{ pos: [0, 0, 0], yaw: 0, pitch: 0 },
        ...init
    }

    const mouse = new Vector2();

    // -- state --
    const [cur, setCur] = createSignal<Pose>(initial);
    let target: Pose = initial;

    let trans: TransitionMode = 'ease';

    const stack: Layer[] = [{ pose: initial, trans }];
    const top = () => stack[stack.length - 1].pose;

    let inflight: ((o: Outcome) => void) | null = null;

    // "head for whatever is on top now"
    const retarget = (t: TransitionMode, w?: Winding) => {
        inflight?.('diverted');
        const pose = top();
        target = w === undefined
            ? pose // winding prepared by caller
            : { ...pose, yaw: resolveYaw(pose.yaw, cur().yaw, w) };
        trans = t;
        return new Promise<Outcome>(r => (inflight = r));
    }

    const goto = (to: Partial<Pose>, t: TransitionMode = 'ease', w: Winding = 'short') => {
        const base = stack[0].pose;
        // edge: have correct reference while releasing the last override.
        const referenceYaw = stack.length === 1 ? target.yaw : base.yaw;
        stack[0].pose = {
            ...base, ...to,
            yaw: resolveYaw(
                to.yaw ?? base.yaw,
                referenceYaw,
                to.yaw === undefined ? 'short' : w
            )
        }
        return stack.length > 1
            ? Promise.resolve<Outcome>('unchanged')
            : retarget(t);
    }

    const override = (to: Partial<Pose>) => {
        const layer: Layer = { pose: null!, trans: 'ease' };
        return {
            commit(t: TransitionMode = 'ease', w: Winding = 'short') {
                if (stack.includes(layer))
                    throw new Error('Override is already committed.');

                layer.trans = t;
                const com = { ...top(), ...to };
                layer.pose = {
                    ...com,
                    // based on current position, for clean diversions
                    yaw: resolveYaw(com.yaw, cur().yaw, w)
                }
                stack.push(layer);
                return retarget(t);
            },
            release(rt: TransitionMode = layer.trans, rw: Winding = 'short') {
                const i = stack.indexOf(layer);
                // todo: consider changing this to a throw of "not committed";
                if (i === -1) return Promise.resolve<Outcome>('arrived');   // never committed, or already released
                stack.splice(i, 1);

                if (i !== stack.length) return Promise.resolve<Outcome>('unchanged');

                // pass winding to retarget so it can settle path without modifying the layer.
                return retarget(rt, rw);
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
                yaw: damp(current.yaw, target.yaw, LAMBDA, dt),
                pitch: damp(current.pitch, target.pitch, LAMBDA, dt)
            };
        }

        if (inflight && settled(next, target)) {
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
            let scene: Scene;

            let task: RenderTask;
            let untrackMouse: VoidFunction;

            onMount(() => {
                scene = camRef.scene!;
                task = Motor.addRenderTask((_t, dtMs) => { step(dtMs / 1000) });
                untrackMouse = trackMouse(scene, mouse);

            });

            onCleanup(() => {
                Motor.removeRenderTask(task);
                inflight?.('killed');
                untrackMouse?.();
            });

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
