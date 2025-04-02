import { Element3D, PerspectiveCamera, XYZNumberValues } from "lume";
import { CameraBehavior, CameraRefs } from "./multicam.types";
import { onCleanup, onMount } from "solid-js"


/**
 * The `cameraController` is a utility object that manages multicameras state and behavior.
 * Tracks a base behavior and temporary behavior (to allow for transitions and quick changes).
 * 
 * ## Properties:
 * - `currentBehavior`: The currently active camera behavior.
 * - `baseBehavior`: The default or fallback camera behavior.
 * - `tempBehavior`: A temporary camera behavior that overrides the base behavior.
 * - `storedRefs`: References to camera-related lume elements, used by behavior methods.
 * 
 * ## Methods:
 * 
 * ### `_setCurrentBehavior(behavior: CameraBehavior): void` (private)
 * Sets the current camera behavior.
 * Calls the `exit` method of the previous behavior and the `init` method of the new behavior.
 * Throws an error if `storedRefs` is not attached.
 * 
 * ### `setBaseBehavior(behavior: CameraBehavior): void`
 * Sets the base camera behavior. If no temporary behavior is active, it becomes the current behavior.
 * 
 * ### `setTemporaryBehavior(behavior: CameraBehavior): void`
 * Sets a temporary camera behavior, overriding the base behavior.
 * 
 * ### `clearTemporaryBehavior(): void`
 * Clears the temporary behavior and reverts to the base behavior.
 * Throws an error if no base behavior is set.
 * 
 * ### `reInitialize(initialBehavior: CameraBehavior): void`
 * Reinitializes the controller with a new initial behavior.
 * Resets the base and temporary behaviors, and sets the initial behavior as the current behavior.
 * Used when the scene changes.
 * 
 * ### `getBehavior(): CameraBehavior | null`
 * Returns the currently active camera behavior.
 * 
 * ### `attachRefs(refs: CameraRefs): void`
 * Attaches or updates the camera references used by behaviors.
 * 
 * ## Errors:
 * - Throws an error if `storedRefs` is not attached when setting a behavior.
 * - Throws an error if attempting to clear a temporary behavior without a base behavior.
 */
export const cameraController = {
    currentBehavior: null as CameraBehavior | null,
    baseBehavior: null as CameraBehavior | null,
    tempBehavior: null as CameraBehavior | null,
    storedRefs: null as CameraRefs | null,

    _setCurrentBehavior(behavior: CameraBehavior) {
        if(!this.storedRefs) {
            throw new Error("[Multicam] Camera refs not attached.");
        }
        this.currentBehavior?.exit?.(this.storedRefs);
        this._cleanupCameraRig();
        this.currentBehavior = behavior;
        this.currentBehavior?.init?.(this.storedRefs);


        // If we bring back update, try doing something like this;
        /*
            if (this.currentBehavior?.update) {
                Motor.addRenderTask(() => {
                this.currentBehavior!.update!(this.storedRefs!, delta);
            });
        */
    },

    setBaseBehavior(behavior: CameraBehavior) {
        this.baseBehavior = behavior;
        if(!this.tempBehavior) {
            this._setCurrentBehavior(behavior);
        }
    },

    setTemporaryBehavior(behavior: CameraBehavior) {
        this.tempBehavior = behavior;
        this._setCurrentBehavior(behavior);
    },

    clearTemporaryBehavior() {
        this.tempBehavior = null;
        if(this.baseBehavior) {
            this._setCurrentBehavior(this.baseBehavior);
        } else {
            throw new Error("[Multicam] No base behavior to return to.");
        }
    },

    // Activated whenever the scene changes (initial behavior)
    reInitialize(initialBehavior: CameraBehavior) {
        this.baseBehavior = initialBehavior;
        this.tempBehavior = null;
        this._setCurrentBehavior(initialBehavior);

    },

    getBehavior(): CameraBehavior | null {
		return this.currentBehavior;
	},

    // Refs attached/updated when MultiCam mounts
	attachRefs(refs: CameraRefs) {
		this.storedRefs = refs;
	},

    /*
        functions for rotation/position are not disposed unless the position of the element is set to a static value
        (as in, setting rotation to a static value doesn't remove the functions for it)
        this is a workaround cleanup function that disposes of those functions, needed when switching from functional to static (i.e playercam to snapto)

        This hard reset also seems to bug out YBillboard (may be fine once we merge the new implementation idk) - this appears to be
        due to this change not triggering a needsUpdate() on scene (afaik the functional changes constantly call needsUpdate, making the trigger occur. Which implies the new billboards will be fine)
    */
    _cleanupCameraRig() {
       if(this.storedRefs) {
            this.storedRefs.body.position = new XYZNumberValues(this.storedRefs.body.position);
            this.storedRefs.cam.position = new XYZNumberValues(this.storedRefs.cam.position);

            // Except it needs to be in a setTimeout because of course it does >:(
            setTimeout(() => {
                this.storedRefs!.body.scene?.needsUpdate();
            }, 100)
        }
    }
}


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
    let bodyRef!: Element3D;
    let camRef!: PerspectiveCamera;

    onMount(() => {
        if(!bodyRef || !camRef) throw new Error("[Multicam] Body or camera ref not set at mount.");
        const refs: CameraRefs = {body: bodyRef, cam: camRef};
        cameraController.attachRefs(refs);

        cameraController.reInitialize(props.initialBehavior);
    });

    onCleanup(() => {
        cameraController?.getBehavior()?.exit?.({body: bodyRef, cam: camRef});
        cameraController?._cleanupCameraRig();
    });

    return (
        <lume-element3d ref={bodyRef} align-point="0.5 0.5">
            <lume-perspective-camera ref={camRef} active/>
        </lume-element3d>
    )
}