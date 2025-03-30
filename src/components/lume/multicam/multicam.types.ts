import { Element3D, PerspectiveCamera } from "lume";

/**
 * Simple struct for lume element references;
 * - `body` the container for the camera, used for positioning and yaw
 * - `cam` the camera itself, used for pitch
 */
export interface CameraRefs {
    body: Element3D,
    cam: PerspectiveCamera
}

/**
 * Multicam behavior interface;
 * - `init` is called when the camera is initialized or re-initialized (with this behavior)
 * - `update` is called every frame (if implemented)
 * - `exit` is called when the camera is unmounted or the behavior is changed
 */
export interface CameraBehavior {
    init?: (refs: CameraRefs) => void;
    //update?: (refs: CameraRefs, dt: number) => void;
    exit?: (refs: CameraRefs) => void;
}