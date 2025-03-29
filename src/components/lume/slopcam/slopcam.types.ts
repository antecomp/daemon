import { Element3D, PerspectiveCamera } from "lume";

export interface CameraRefs {
    body: Element3D,
    cam: PerspectiveCamera
}

export interface CameraBehavior {
    init?: (refs: CameraRefs) => void;
    update?: (refs: CameraRefs, dt: number) => void;
    exit?: (refs: CameraRefs) => void;
}