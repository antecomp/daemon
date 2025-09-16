import { Orientation } from "@/shared/types/3d.types";
import { XYZ } from "./PlayerCam";
import { createMemo, createSignal } from "solid-js";

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
    const [shouldAnim, setShouldAnim] = createSignal(false);
    const [overridePos, setOverridePos] = createSignal<XYZ | undefined>();
    const [overrideOri, setOverrideOri] = createSignal<Orientation | undefined>();
    const [maxYaw, setMaxYaw] = createSignal(maxTilts.maxYaw);
    const [maxPitch, setMaxPitch] = createSignal(maxTilts.maxPitch);

    function setOverrides(pos?: XYZ, ori?: Orientation, anim?: boolean) {
        pos && setOverridePos(pos);
        ori && setOverrideOri(ori);
        (anim != undefined) && setShouldAnim(anim);
    }

    function clearOverrides(anim?: boolean) {
        (anim != undefined) && setShouldAnim(anim);
        setOverrideOri(undefined);
        setOverridePos(undefined);
    }

    function setBase(pos?: XYZ, ori?: Orientation, anim?: boolean, tilts?: {maxYaw: number, maxPitch: number}) {
        (anim != undefined) && setShouldAnim(anim);
        pos && setBasePos(pos);
        ori && setBaseOri(ori);
        tilts && setMaxPitch(tilts.maxPitch);
        tilts && setMaxYaw(tilts.maxYaw);
    }

    // Create a reactive object that resolves signal values dynamically
    const cameraControlSignals = createMemo(() => ({
        basePos: basePos(),
        baseOri: baseOri(),
        overrideOri: overrideOri(),
        overridePos: overridePos(),
        animate: shouldAnim(),
        maxYaw: maxYaw(),
        maxPitch: maxPitch(),
    }));

    const currentBase = () => ({
        pos: basePos(),
        ori: baseOri
    });

    const currentOverride = () => {
        if (!overrideOri() || !overridePos()) return null;
        return {
            pos: overridePos()!,
            ori: overrideOri()!
        }
    }
    
    return {
        // Signals to spread into playercam component
        cameraControlSignals,
        // Camera controller
        cameraController: {
            setOverrides,
            clearOverrides,
            setBase,
            setBasePos,
            setBaseOri,
            setOverridePos,
            setOverrideOri,
            currentBase, currentOverride
        },
    }
}

export type CameraController = ReturnType<typeof createCameraController>['cameraController']