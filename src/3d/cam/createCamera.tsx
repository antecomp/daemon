import { DGDEV } from "@/devtools/dev";
import { XYZ } from "@/shared/types/3d.types";
import { Motor, onCleanup, onMount, RenderTask, type Element3D, type PerspectiveCamera, type Scene } from "lume";
import { damp } from "three/src/math/MathUtils.js";
import { createSignal } from 'solid-js';
import { CamUpdate, Layer, Outcome, Pose, Sway, TransitionMode, Winding, type CameraController } from "./cam.types";
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
    init: CamUpdate = {}
): CameraController {
    const { sway: initSway, disablePointer: initDisablePointer, ...initPose } = init;
    const base: Layer = {
        pose: { pos: [0, 0, 0], yaw: 0, pitch: 0, ...initPose },
        trans: 'ease',
        sway: initSway ?? 'center',
        disablePointer: initDisablePointer,
    };

    const [cur, setCur] = createSignal<Pose>(base.pose);
    let target: Layer = base;
    let snapSway = false;
    const stack: Layer[] = [base];
    const top = () => stack[stack.length - 1];
    let inflight: ((o: Outcome) => void) | null = null;
    const mouse = new Vector2();
    const [sway, setSway] = createSignal<Sway>({yaw: 0, pitch: 0});

    // Overrides default to sway: 'center', so limits on an override are an explicit opt-in.
    const allowSwayInput = () => !sceneLock.isLocked()
        || (stack.length > 1 && typeof target.sway === 'object');

    // "head for whatever is on top now"
    const retarget = (t: TransitionMode, w?: Winding) => {
        inflight?.('diverted');
        const layer = top();
        target = {
            ...layer,
            trans: t,
            pose: w === undefined
                ? layer.pose // winding prepared by caller
                : { ...layer.pose, yaw: resolveYaw(layer.pose.yaw, cur().yaw, w) },
        };
        snapSway = t === 'cut';
        return new Promise<Outcome>(r => (inflight = r));
    }

    const goto = (update: CamUpdate, t: TransitionMode = 'ease', w: Winding = 'short') => {
        const { sway, disablePointer, ...to } = update;
        const prev = stack[0];
        // edge: have correct reference while releasing the last override.
        const referenceYaw = stack.length === 1 ? target.pose.yaw : prev.pose.yaw;
        stack[0] = {
            ...prev,
            sway: sway ?? prev.sway,
            disablePointer: disablePointer ?? prev.disablePointer,
            pose: {
                ...prev.pose, ...to,
                yaw: resolveYaw(
                    to.yaw ?? prev.pose.yaw,
                    referenceYaw,
                    to.yaw === undefined ? 'short' : w
                )
            }
        };
        return stack.length > 1
            ? Promise.resolve<Outcome>('unchanged')
            : retarget(t);
    }

    const override = (update: CamUpdate) => {
        const { sway, disablePointer, ...to } = update;
        const layer: Layer = { pose: null!, trans: 'ease', sway: 'center' };
        return {
            commit(t: TransitionMode = 'ease', w: Winding = 'short') {
                if (stack.includes(layer))
                    throw new Error('Override is already committed.');

                const below = top();
                const pose: Pose = { ...below.pose, ...to };
                Object.assign(layer, {
                    trans: t,
                    // Overrides center sway by default; pass 'hold' to freeze its current offset.
                    sway: sway ?? 'center',
                    disablePointer: disablePointer ?? below.disablePointer,
                    // based on current position, for clean diversions
                    pose: { ...pose, yaw: resolveYaw(pose.yaw, cur().yaw, w) },
                } satisfies Layer);
                stack.push(layer);
                return retarget(t);
            },
            release(rt: TransitionMode = layer.trans, rw: Winding = 'short') {
                const i = stack.indexOf(layer);
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
        const goal = target.pose;
        let next: Pose;
        if (target.trans === 'cut') {
            next = goal;
        } else {
            const current = cur();
            next = {
                pos: current.pos.map((cv, i) => damp(cv, goal.pos[i], LAMBDA, dt)) as XYZ,
                yaw: damp(current.yaw, goal.yaw, LAMBDA, dt),
                pitch: damp(current.pitch, goal.pitch, LAMBDA, dt),
            };
        }

        if (inflight && settled(next, goal)) {
            setCur(goal);
            inflight('arrived');
            inflight = null;
        } else {
            setCur(next);
        }

        swayStep(dt, snap);
    };

    const swayStep = (dt: number, snap: boolean) => {
        const ts = target.sway;
        const limits = typeof ts === 'object' ? ts : null;
        if (ts === 'hold') return;
        // if sway is set, but 
        // we're on base with a scene lock, hold.
        if (limits && !allowSwayInput()) return;

        const goalYaw = limits ? -mouse.x * limits.maxYaw : 0;
        const goalPitch = limits ? -mouse.y * limits.maxPitch : 0;
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
                const enabled = () => !target.disablePointer && !sceneLock.isLocked();
                const {hoverRaycast, cleanup, clickRaycast} = createRaycaster(camRef, scene, mouse, enabled);
                task = Motor.addRenderTask((_t, dtMs) => { 
                    step(dtMs / 1000);
                    hoverRaycast();
                });
                scene.addEventListener('click', clickRaycast);
                untrackMouse = trackMouse(scene, mouse, allowSwayInput);
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
