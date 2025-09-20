import { Orientation, XYZ } from "@/shared/types/3d.types";
import { Accessor, Setter } from "solid-js";

export interface CameraSettings {
    pos?: XYZ,
    ori?: Orientation,
    anim?: boolean
}

export interface BaseCameraSettings extends CameraSettings {
    tilts?: {
        maxYaw: number;
        maxPitch: number;
    }
}

export type CameraOverride = CameraSettings & {id: number}

/**
 * CameraController provides an API for imperatively managing a PlayerCams state (for easy programmatic movement).
 */
export interface CameraController {

    /**
     * Creates a deferred camera override handle.
     *
     * Generates a unique override that can be committed later, rather than being
     * pushed onto the stack immediately. Calling `commit` adds the override to
     * the controller’s stack (optionally toggling the base animation flag), and
     * `release` removes that same override, even if other overrides were added
     * afterward. Both helpers are idempotent, so repeated calls are safe.
     *
     * @param ovr - Camera settings (position, orientation, animation hint) to apply when committed.
     * @returns Handle exposing the override `id` plus `commit`/`release` helpers for lifecycle control.
     */
    createOverride: (ovr: CameraSettings) => {
        release(anim?: boolean): void;
        commit(anim?: boolean): void;
        id: number
    }

    /**
     * Removes a specific override by identifier (`id`) and returns the remaining overrides in the stack.
     */
    removeOverride: (id: number) => CameraOverride[];
    /**
     * Clears all overrides and optionally animates the transition back to the base state.
     */
    clearOverrides: (anim?: boolean) => void;
    /**
     * Sets the base camera pose and optional tilt constraints, with an optional animation flag.
     */
    setBase: (settings: BaseCameraSettings) => void;
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
