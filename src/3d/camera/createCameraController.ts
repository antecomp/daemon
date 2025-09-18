import { Orientation } from "@/shared/types/3d.types";
import { XYZ } from "@/shared/types/3d.types";
import { createMemo, createSignal } from "solid-js";

interface CameraOverrideSettings {
    pos?: XYZ,
    ori?: Orientation,
    anim?: boolean
}

type CameraOverride = CameraOverrideSettings & {id: number}

/**
 * Helper function for generating signals that can be passed to a playerCamera, alongside standard API functions for
 * modifying the camera state.
 * @param initialPos [number, number, number], XYZ original coordinates.
 * @param initialOri {yaw: number, pitch: number}, original orientation
 * @param maxTilts {maxYaw: number, maxPitch: number} - limit on head tilts/
 */
export default function createCameraController(
    initialPos: XYZ,
    initialOri: Orientation,
    maxTilts: {maxYaw: number, maxPitch: number}
) {
    const [basePos, setBasePos] = createSignal(initialPos);
    const [baseOri, setBaseOri] = createSignal(initialOri);
    const [baseAnim, setBaseAnim] = createSignal(false);
    const [maxYaw, setMaxYaw] = createSignal(maxTilts.maxYaw);
    const [maxPitch, setMaxPitch] = createSignal(maxTilts.maxPitch);

    let nextOverrideID = 0;
    const [overrideStack, setOverrideStack] = createSignal<CameraOverride[]>([]);

    const removeOverride = (id: number) => setOverrideStack(prev => prev.filter(ovr => ovr.id != id));

    function requestOverride(ovr: CameraOverrideSettings) {
                console.log('trigger');
        const id = nextOverrideID++;
        setOverrideStack(prev => [...prev, {id, ...ovr}]);
        return {
            release(anim?: boolean) { // anim only relevent when releasing back to base (do we animate back to base?) otherwise it's just the anim of the next override.
                (anim != undefined) && setBaseAnim(anim);
                removeOverride(id)
            },
            id
        }
    }

    const currentOverridePos = () => overrideStack().at(-1)?.pos;
    const currentOverrideOri = () => overrideStack().at(-1)?.ori;

    const shouldAnim = () => {
        const ovrAnim = overrideStack().at(-1)?.anim;
        if(ovrAnim == undefined) return baseAnim();
        return ovrAnim;
    }

    function clearOverrides(anim?: boolean) {
        (anim != undefined) && setBaseAnim(anim);
        setOverrideStack([]);
    }

    // TODO: Change to take an options object instead of having to write undefined as an argument.
    function setBase(pos?: XYZ, ori?: Orientation, anim?: boolean, tilts?: {maxYaw: number, maxPitch: number}) {
        (anim != undefined) && setBaseAnim(anim);
        pos && setBasePos(pos);
        ori && setBaseOri(ori);
        tilts && setMaxPitch(tilts.maxPitch);
        tilts && setMaxYaw(tilts.maxYaw);
    }

    // Create a reactive object that resolves signal values dynamically
    const cameraControlSignals = createMemo(() => ({
        basePos: basePos(),
        baseOri: baseOri(),
        overrideOri: currentOverrideOri(),
        overridePos: currentOverridePos(),
        animate: shouldAnim(),
        maxYaw: maxYaw(),
        maxPitch: maxPitch(),
    }));

    const currentBase = () => ({
        pos: basePos(),
        ori: baseOri
    });

    const currentOverride = () => {
        if (!currentOverrideOri() || !currentOverridePos()) return null;
        return {
            pos: currentOverridePos()!,
            ori: currentOverrideOri()!
        }
    }
    
    return {
        // Signals to spread into playercam component
        cameraControlSignals,
        // Camera controller
        cameraController: {
            requestOverride,
            removeOverride, // TODO: consider removing this (and making req only return the release, to keep responsibility isolated to caller)
            clearOverrides,
            setBase,
            setBasePos,
            setBaseOri,
            currentBase, currentOverride
        },
    }
}

// TODO: Declare and document your own types. This is lazy and gross!
export type CameraController = ReturnType<typeof createCameraController>['cameraController']