import { Element3D, PerspectiveCamera, XYZNumberValues } from "lume";
import { CameraBehavior, CameraRefs } from "./multicam.types";
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

    private changeActiveBehavior(newBehavior: CameraBehavior) {
        this._activeBehavior?.exit?.(this.storedRefs);
        this.cleanupCameraRig();
        this._activeBehavior = newBehavior;
        this._activeBehavior.init?.(this.storedRefs);
        // Any "update" or framebased operations have been removed 
        // in favour of setting up event listeners/intervals @ init, and disposed on exit.
    }

    /*
        functions for rotation/position are not disposed unless the position of the element is set to a static value
        (as in, setting rotation to a static value doesn't remove the functions for it)
        this is a workaround cleanup function that disposes of those functions, needed when switching from functional to static (i.e playercam to snapto)

        This hard reset also seems to bug out YBillboard (may be fine once we merge the new implementation idk) - this appears to be
        due to this change not triggering a needsUpdate() on scene (afaik the functional changes constantly call needsUpdate, making the trigger occur. Which implies the new billboards will be fine)
    */
    private cleanupCameraRig() {
        this.storedRefs.body.position = new XYZNumberValues(this.storedRefs.body.position);
        this.storedRefs.cam.position = new XYZNumberValues(this.storedRefs.cam.position);
    }

    public setBaseBehavior(behavior: CameraBehavior) {
        this.baseBehavior = behavior;
        if(!this.tempBehavior) {
            this.changeActiveBehavior(behavior);
        }
    }

    public setTemporaryBehavior(behavior: CameraBehavior) {
        this.tempBehavior = behavior;
        this.changeActiveBehavior(behavior);
    }

    public stopTemporaryBehavior() {
        this.tempBehavior = null;
        this.changeActiveBehavior(this.baseBehavior);
    }

    get activeBehavior() {
        return this._activeBehavior;
    }
}

let _currentCameraController!: MulticamController;

// Make global so we can request a behavior change.
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