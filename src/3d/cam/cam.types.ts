import { XYZ } from "@/shared/types/3d.types"

export type SwayLimits = {maxYaw: number, maxPitch: number};
export type Sway = {yaw: number, pitch: number};
export type SwaySetting = SwayLimits | false | 'hold';

export type Pose = {
    pos: XYZ;
    yaw: number;
    pitch: number;
    // Todo: Move these to layer?
    /** Mouse tracking limits, false to center, or 'hold' to preserve the current offset. */
    sway: SwaySetting;
    disablePointer?: boolean;
}

export type TransitionMode = 'ease' | 'cut';

export type Winding = 'short' | 'long';

export type Layer = {
    pose: Pose,
    trans: TransitionMode
}

export type Outcome = 'arrived' | 'diverted' | 'unchanged' | 'killed';
