import { Element3D, PerspectiveCamera, XYZNumberValues } from "lume";
import { CameraBehavior, CameraRefs, CameraTransformCache } from "./multicam.types";
import { onCleanup, onMount } from "solid-js"


class MulticamController {
    private _activeBehavior: CameraBehavior;
    private baseBehavior: CameraBehavior;
    private tempBehavior: CameraBehavior | null;
    readonly storedRefs: CameraRefs;

    constructor(initialBehavior: CameraBehavior, refs: CameraRefs) {
        this.baseBehavior = initialBehavior;
        this._activeBehavior = this.baseBehavior;
        this.tempBehavior = null;
        this.storedRefs = refs;

        this._activeBehavior.init?.(this.storedRefs)
    }

    // Actually performs the cleanup/init between cameras.
    private changeActiveBehavior(newBehavior: CameraBehavior) {
        this._activeBehavior?.exit?.(this.storedRefs);
        this.cleanupCameraRig();
        this._activeBehavior = newBehavior;
        this._activeBehavior.init?.(this.storedRefs);
        // Any "update" or framebased operations have been removed 
        // in favour of setting up event listeners/intervals @ init, and disposed on exit.
    }

    /*
        Lume Bug: functions for rotation/position are not disposed unless the position of the element is set to a static value
        (as in, setting rotation to a static value doesn't remove the functions for it)

        This is a workaround cleanup function that disposes of those functions, 
        needed when switching from functional to static (i.e playercam to snapto)

        note: If needed, attach a scene needsupdate here 
        (no use now, but if you notice weird behavior on swapout, try adding that)
    */
    private cleanupCameraRig() {
        this.storedRefs.body.position = new XYZNumberValues(this.storedRefs.body.position);
        this.storedRefs.cam.position = new XYZNumberValues(this.storedRefs.cam.position);
    }

    /**
     * Sets the base (default) behavior for the camera and updates the active behavior
     * if no temporary behavior is currently set.
     * 
     * Typically this is used if we want to reposition playerCam.
     *
     * @param behavior - The camera behavior to set as the base behavior.
     */
    public setBaseBehavior(behavior: CameraBehavior) {
        this.baseBehavior = behavior;
        if(!this.tempBehavior) {
            this.changeActiveBehavior(behavior);
        }
    }

    /**
     * Temporarily sets the camera's behavior to the specified behavior.
     * This method updates the temporary behavior and immediately changes
     * the active behavior of the camera to match.
     * 
     *  f.e dialogue can use this to reposition the camera during dialogue, 
     *  returning to player camera on dialogue end
     *
     * @param behavior - The new temporary camera behavior to apply.
     */
    public setTemporaryBehavior(behavior: CameraBehavior) {
        this.tempBehavior = behavior;
        this.changeActiveBehavior(behavior);
    }

    /**
     * Stops the temporary behavior by resetting it to null and reverts
     * the active behavior to the base behavior.
     */
    public stopTemporaryBehavior() {
        this.tempBehavior = null;
        this.changeActiveBehavior(this.baseBehavior);
    }

    get activeBehavior() {
        return this._activeBehavior;
    }

    /**
     * Gets the current transformation state of the camera.
     *
     * @returns {CameraTransformCache} An object containing the current position, yaw, and pitch of the camera.
     * - `position`: An instance of `XYZNumberValues` representing the camera's position in 3D space.
     * - `yaw`: A number representing the rotation of the camera body around the Y-axis.
     * - `pitch`: A number representing the rotation of the camera around the X-axis.
     * 
     * @remark can be used to cache the camera position prior to a transform, for a smooth transition back.
     */
    get currentTransform(): CameraTransformCache {
        return {
            position: new XYZNumberValues(this.storedRefs.body.position),
            yaw: this.storedRefs.body.rotation.y,
            pitch: this.storedRefs.cam.rotation.x
        }
    }
}

let _currentCameraController!: MulticamController;

/**
 * Retrieves the current instance of the camera controller being used.
 * 
 * The camera controller is responsible for managing the behavior and state
 * of the camera within the application. It provides functionality for
 * controlling camera movements, transitions, and other camera-related
 * operations. This function exposes the current active camera controller
 * instance, allowing developers to interact with or query its state.
 * 
 * @see Multicam.tsx
 * 
 * @returns The current camera controller instance.
 */
export const currentCameraController = () => _currentCameraController;


/**
 * The `Multicam` component is responsible for managing a 3D camera setup
 * within a LUME scene. It initializes and cleans up camera behaviors
 * using a `cameraController` and allows for an optional initial behavior
 * to be specified.
 * 
 * To actually manage the camera behavior, use the `cameraController`
 *
 * @param props.initialBehavior - The initial camera behavior
 * to be applied when the component is mounted.
 *
 * @throws Will throw an error if the `bodyRef` or `camRef` is not set
 * during the `onMount` lifecycle.
 *
 * @returns A JSX element containing a LUME `element3d` with a nested
 * `perspective-camera`.
 */
export default function Multicam(props: {initialBehavior: CameraBehavior}) {
    let body!: Element3D;
    let cam!: PerspectiveCamera;

    onMount(() => {
        _currentCameraController = new MulticamController(props.initialBehavior, {body, cam});
    });

    onCleanup(() => {
        _currentCameraController.activeBehavior.exit?.({body, cam}); // In case we need to remove some event listeners.
    });

    return (
        <lume-element3d ref={body} align-point="0.5 0.5">
            <lume-perspective-camera ref={cam} active/>
        </lume-element3d>
    )
}