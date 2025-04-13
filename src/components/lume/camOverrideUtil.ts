import { Gimbal } from "@/extra.types"
import { XYZ } from "./Newcam"
import { Accessor, createSignal } from "solid-js"

type OverrideStore = {
    overridePos: Accessor<XYZ | undefined>,
    overrideOri: Accessor<Omit<Gimbal, "roll"> | undefined>
    anim: Accessor<boolean | undefined>
    setOverrides(overrides: {
        pos?: XYZ,
        ori?: Omit<Gimbal, "roll">
        anim?: boolean
    }): void;
    clearOverrides(anim?: boolean): void
}

export function createOverrideStore(): OverrideStore {
    const [overridePos, setOverridePos] = createSignal<XYZ | undefined>();
    const [overrideOri, setOverrideOri] = createSignal<Omit<Gimbal, "roll"> | undefined>();
    const [anim, setAnim] = createSignal<boolean | undefined>();

    const setOverrides: OverrideStore['setOverrides'] = (ovr) => {
            setOverridePos(ovr.pos);
            setOverrideOri(ovr.ori);
            setAnim(ovr.anim);
    }

    const clearOverrides = (anim?: boolean) => {
            setAnim(anim);
            setOverridePos(undefined);
            setOverrideOri(undefined);
    }

    return {
        overridePos,
        overrideOri,
        setOverrides,
        clearOverrides,
        anim
    }
}