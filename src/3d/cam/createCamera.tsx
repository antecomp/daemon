import { DGDEV } from "@/devtools/dev";
import { XYZ } from "@/shared/types/3d.types";
import { Motor, onCleanup, onMount, RenderTask, type Element3D, type PerspectiveCamera, type Scene } from "lume";
import { damp } from "three/src/math/MathUtils.js";
import { createSignal } from 'solid-js';
import { Layer, Outcome, Pose, Sway, TransitionMode, Winding } from "./cam.types";
import nearestAngle from "@/shared/utils/nearestAngle";
import { Vector2 } from "three";
import trackMouse from "./trackMouse";
import { sceneLock } from "@/app/shell/locks/UILockManager";
import createRaycaster from "./createRaycaster";

// Corresponds to the speed/acceleration curve for the damp function
const LAMBDA = 4;
const SWAY_LAMBDA = 4;

const POS_EPS = 0.05;
const ANG_EPS = 0.1;

function settled(current: Omit<Pose, 'sway'>, target: Omit<Pose, 'sway'>) {
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
        ...{ pos: [0, 0, 0], yaw: 0, pitch: 0, sway: false },
        ...init
    }
    
    const [cur, setCur] = createSignal<Pose>(initial);
    let target: Pose = initial;
    let trans: TransitionMode = 'ease';
    let snapSway = false;
    const stack: Layer[] = [{ pose: initial, trans }];
    const top = () => stack[stack.length - 1].pose;
    let inflight: ((o: Outcome) => void) | null = null;
    const mouse = new Vector2();
    const [sway, setSway] = createSignal<Sway>({yaw: 0, pitch: 0});


    // "head for whatever is on top now"
    const retarget = (t: TransitionMode, w?: Winding) => {
        inflight?.('diverted');
        const pose = top();
        target = w === undefined
            ? pose // winding prepared by caller
            : { ...pose, yaw: resolveYaw(pose.yaw, cur().yaw, w) };
        trans = t;
        snapSway = t === 'cut';
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
                // Overrides center sway by default; pass 'hold' to freeze its current offset.
                const com: Pose = { ...top(), sway: false, ...to };
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

    // -- tickers --
    const step = (dt: number) => {
        // snap for one frame only, 
        // so sway resumes as normal after.
        const snap = snapSway;
        snapSway = false;
        let next: Pose;
        const current = cur();
        if (trans === 'cut') {
            next = target;
        } else {
            next = {
                pos: current.pos.map((cv, i) => damp(cv, target.pos[i], LAMBDA, dt)) as XYZ,
                yaw: damp(current.yaw, target.yaw, LAMBDA, dt),
                pitch: damp(current.pitch, target.pitch, LAMBDA, dt),
                sway: target.sway
            };
        }

        if (inflight && settled(next, target)) {
            setCur(target);
            inflight('arrived');
            inflight = null;
        } else {
            setCur(next);
        }

        swayStep(dt, snap);
    };

    const swayStep = (dt: number, snap: boolean) => {
        const ts = target.sway;
        if (ts === 'hold') return;
        if (ts !== false && sceneLock.isLocked()) return;

        const goalYaw = ts ? -mouse.x * ts.maxYaw : 0;
        const goalPitch = ts ? -mouse.y * ts.maxPitch : 0;
        if (snap) {
            setSway({ yaw: goalYaw, pitch: goalPitch });
            return;
        }

        setSway(prev => ({
            yaw: damp(prev.yaw, goalYaw, SWAY_LAMBDA, dt),
            pitch: damp(prev.pitch, goalPitch, SWAY_LAMBDA, dt)
        }));
    }

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
                const enabled = () => !cur().disablePointer && !sceneLock.isLocked();
                const {hoverRaycast, cleanup, clickRaycast} = createRaycaster(camRef, scene, mouse, enabled);
                task = Motor.addRenderTask((_t, dtMs) => { 
                    step(dtMs / 1000);
                    hoverRaycast();
                });
                scene.addEventListener('click', clickRaycast);
                untrackMouse = trackMouse(scene, mouse);
                onCleanup(() => {
                    cleanup();
                    scene.removeEventListener('click', clickRaycast)
                });
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
                    rotation={`0 ${cur().yaw + sway().yaw} 0`}
                    position={cur().pos.join(' ')}
                >
                    <lume-perspective-camera id="
                        cam_head" active ref={camRef}
                        far="9999" // for dev purposes, see everything. Remove for prod.
                        rotation={`${cur().pitch + sway().pitch}`}
                    />
                </lume-element3d>
            )
        },
    }
}
