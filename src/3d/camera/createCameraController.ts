import { Orientation } from "@/shared/types/3d.types";
import { XYZ } from "@/shared/types/3d.types";
import { createMemo, createSignal } from "solid-js";
import { CameraSettings, CameraOverride, CameraController, CameraControlSignals, BaseCameraSettings } from "./camera.types";



/**
 * Helper function for generating signals that can be passed to a playerCamera, alongside standard API functions for
 * modifying the camera state.
 * @param initialPos [number, number, number], XYZ original coordinates.
 * @param initialOri {yaw: number, pitch: number}, original orientation
 * @param maxTilts {maxYaw: number, maxPitch: number} - limit on head tilts/
 * 
 * @returns - cameraControlSignals - call and spread this inside PlayerCam. Provides properly reactive props to PlayerCam to trigger movement.
 * @returns - cameraController - The actual API to trigger camera movement events. Reference CameraController interface in camera.types.ts
 */
export default function createCameraController(
    initialPos: XYZ,
    initialOri: Orientation,
    maxTilts: {maxYaw: number, maxPitch: number}
) : {
    cameraControlSignals: CameraControlSignals,
    cameraController: CameraController
} {
    const [basePos, setBasePos] = createSignal(initialPos);
    const [baseOri, setBaseOri] = createSignal(initialOri);
    const [baseAnim, setBaseAnim] = createSignal(false);
    const [maxYaw, setMaxYaw] = createSignal(maxTilts.maxYaw);
    const [maxPitch, setMaxPitch] = createSignal(maxTilts.maxPitch);

    let nextOverrideID = 0;
    const [overrideStack, setOverrideStack] = createSignal<CameraOverride[]>([]);

    const removeOverride = (id: number) => setOverrideStack(prev => prev.filter(ovr => ovr.id != id));

    function requestOverride(ovr: CameraSettings) {
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

    function setBase({pos, ori, anim, tilts} : BaseCameraSettings) {
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
        ori: baseOri()
    });

    const currentOverride = () => {
        const ori = currentOverrideOri();
        const pos = currentOverridePos();
        if(ori == undefined && pos == undefined) return null;
        return { pos, ori };
    }
    
    return {
        // Signals to spread into playercam component
        cameraControlSignals,
        // Camera controller
        cameraController: {
            requestOverride,
            removeOverride,
            clearOverrides,
            setBase,
            setBasePos,
            setBaseOri,
            currentBase, 
            currentOverride
        },
    }
}