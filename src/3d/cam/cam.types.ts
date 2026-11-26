import { XYZ } from "@/shared/types/3d.types"
import type { Component } from "solid-js";

export type SwayLimits = {maxYaw: number, maxPitch: number};
export type Sway = {yaw: number, pitch: number};
export type SwaySetting = SwayLimits | 'center' | 'hold';

export type Pose = {
    pos: XYZ;
    yaw: number;
    pitch: number;
}

export type LayerOpts = {
    /** Mouse tracking limits, 'center' to recenter, or 'hold' to preserve the current offset. */
    sway: SwaySetting;
    disablePointer?: boolean;
}

export type TransitionMode = 'ease' | 'cut';

export type Winding = 'short' | 'long';

export type Layer = {
    pose: Pose;
    trans: TransitionMode;
} & LayerOpts;

/** What callers pass to goto/override. */
export type CamUpdate = Partial<Pose & LayerOpts>;

export type Outcome = 'arrived' | 'diverted' | 'unchanged' | 'killed';

export type CameraOverride = {
    commit(transition?: TransitionMode, winding?: Winding): Promise<Outcome>;
    release(transition?: TransitionMode, winding?: Winding): Promise<Outcome>;
};

export type CameraController = {
    goto(update: CamUpdate, transition?: TransitionMode, winding?: Winding): Promise<Outcome>;
    override(update: CamUpdate): CameraOverride;
    Camera: Component;
};
