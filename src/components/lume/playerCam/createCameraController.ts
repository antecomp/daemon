import { Gimbal } from "@/extra.types";
import { XYZ } from "./PlayerCam";
import { createMemo, createSignal } from "solid-js";

export default function createCameraController(
    initialPos: XYZ,
    initialOri: Omit<Gimbal, "roll">,
    maxYaw: number,
    maxPitch: number
) {
    const [basePos, setBasePos] = createSignal(initialPos);
    const [baseOri, setBaseOri] = createSignal(initialOri);
    const [shouldAnim, setShouldAnim] = createSignal(false);
    const [overridePos, setOverridePos] = createSignal<XYZ | undefined>();
    const [overrideOri, setOverrideOri] = createSignal<Omit<Gimbal, "roll"> | undefined>();

    function setOverrides(pos?: XYZ, ori?: Omit<Gimbal, "roll">, anim?: boolean) {
        pos && setOverridePos(pos);
        ori && setOverrideOri(ori);
        anim && setShouldAnim(anim);
    }

    function clearOverrides(anim?: boolean) {
        anim && setShouldAnim(anim);
        setOverrideOri(undefined);
        setOverridePos(undefined);
    }

    function setBase(pos?: XYZ, ori?: Omit<Gimbal, "roll">, anim?: boolean) {
        pos && setBasePos(pos);
        ori && setBaseOri(ori);
        anim && setShouldAnim(anim);
    }

    // Create a reactive object that resolves signal values dynamically
    const cameraControlSignals = createMemo(() => ({
        basePos: basePos(),
        baseOri: baseOri(),
        overrideOri: overrideOri(),
        overridePos: overridePos(),
        animate: shouldAnim(),
        maxYaw,
        maxPitch,
    }));
    
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
        },
    }
}