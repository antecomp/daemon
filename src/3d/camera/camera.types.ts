import { Orientation, XYZ } from "@/shared/types/3d.types";
import { Accessor, Setter } from "solid-js";

export interface CameraOverrideSettings {
    pos?: XYZ,
    ori?: Orientation,
    anim?: boolean
}

export type CameraOverride = CameraOverrideSettings & {id: number}

/**
 * CameraController provides an API for imperatively managing a PlayerCams state (for easy programmatic movement).
 */
export interface CameraController {
    /**
     * Requests a new camera override and returns a `release` handle that can be used to release it. also returns the `id` that can be used with `removeOverride(id)` for popping other overrides. (not reccomended, feature may be removed)
     * * Overrides are handled as a stack, the most recent unreleased Override will take precedence.
     *  * The `release` function takes an optional argument: `anim` - whether or not to animate back to the base state.
     *      This only applies when releasing the final override back to the base state, otherwise the animation state depends on the underlying override in the stack.
     */
    requestOverride: (ovr: CameraOverrideSettings) => {
        release(anim?: boolean): void;
        id: number;
    };
    /**
     * Removes a specific override by identifier and returns the remaining overrides in the stack.
     */
    removeOverride: (id: number) => CameraOverride[];
    /**
     * Clears all overrides and optionally animates the transition back to the base state.
     */
    clearOverrides: (anim?: boolean) => void;
    /**
     * Sets the base camera pose and optional tilt constraints, with an optional animation flag.
     */
    setBase: (pos?: XYZ, ori?: Orientation, anim?: boolean, tilts?: {
        maxYaw: number;
        maxPitch: number;
    }) => void;
    /**
     * Setter for the base position signal.
     */
    setBasePos: Setter<XYZ>;
    /**
     * Setter for the base orientation signal.
     */
    setBaseOri: Setter<Orientation>;
    /**
     * Retrieves the current base position and orientation.
     */
    currentBase: () => {
        pos: XYZ;
        ori: Orientation;
    };
    /**
     * Returns the active override pose or null when no overrides are applied.
     */
    currentOverride: () => {
        pos?: XYZ;
        ori?: Orientation;
    } | null;
}

/* Matches the props of PlayerCam */
export type CameraControlSignals = Accessor<{
    basePos: XYZ;
    baseOri: Orientation;
    overrideOri: Orientation | undefined;
    overridePos: XYZ | undefined;
    animate: boolean;
    maxYaw: number;
    maxPitch: number;
}>
