import { XYZ } from "@/shared/types/3d.types"

export type SwayLimits = {maxYaw: number, maxPitch: number};
export type Sway = {yaw: number, pitch: number};

export type Pose = {
    pos: XYZ;
    yaw: number;
    pitch: number;
    sway: SwayLimits | false;
}

export type TransitionMode = 'ease' | 'cut';

export type Winding = 'short' | 'long';

export type Layer = {
    pose: Pose,
    trans: TransitionMode
}

export type Outcome = 'arrived' | 'diverted' | 'unchanged' | 'killed';