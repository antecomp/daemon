import { XYZ } from "@/shared/types/3d.types"

export type Pose = {
    pos: XYZ;
    yaw: number;
    pitch: number;
}

export type TransitionMode = 'ease' | 'cut';

export type Winding = 'short' | 'long';

export type Layer = {
    pose: Pose,
    trans: TransitionMode
}

export type Outcome = 'arrived' | 'diverted' | 'unchanged';