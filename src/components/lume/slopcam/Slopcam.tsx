import { Element3D, PerspectiveCamera } from "lume";
import { CameraBehavior, CameraRefs } from "./slopcam.types";
import { onCleanup, onMount } from "solid-js"

export const cameraController = {
    currentBehavior: null as CameraBehavior | null,
    baseBehavior: null as CameraBehavior | null,
    tempBehavior: null as CameraBehavior | null,
    storedRefs: null as CameraRefs | null,

    _setCurrentBehavior(behavior: CameraBehavior) {
        if(!this.storedRefs) {
            throw new Error("[Slopcam] Camera refs not attached.");
        }
        this.currentBehavior?.exit?.(this.storedRefs);
        console.log("[SlopCam] exit state", {...this.storedRefs})
        this.currentBehavior = behavior;
        this.currentBehavior?.init?.(this.storedRefs);
        console.log("[SlopCam] init state", {...this.storedRefs})

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
            throw new Error("[Slopcam] No base behavior to return to.");
        }
    },

    // Activated whenever the scene changes (initial behavior)
    reInitialize(initialBehavior: CameraBehavior) {
        this.baseBehavior = initialBehavior;
        this.tempBehavior = null;
        this._setCurrentBehavior(initialBehavior);

    },

    getBehaviors(): CameraBehavior | null {
		return this.currentBehavior;
	},

    // injected once HeadCam mounts
	attachRefs(refs: CameraRefs) {
		this.storedRefs = refs;
		this.currentBehavior?.init?.(this.storedRefs);
	}
}

interface SlopcamProps {
    initialBehavior?: CameraBehavior
}

export default function SlopCam(props: SlopcamProps) {
    let bodyRef!: Element3D;
    let camRef!: PerspectiveCamera;

    onMount(() => {
        if(!bodyRef || !camRef) throw new Error("[Slopcam] Body or camera ref not set at mount.");
        const refs: CameraRefs = {body: bodyRef, cam: camRef};
        cameraController.attachRefs(refs);

        if(props.initialBehavior) {
            cameraController.reInitialize(props.initialBehavior);
        }
    });

    onCleanup(() => {
        cameraController?.getBehaviors()?.exit?.({body: bodyRef, cam: camRef});
    });

    return (
        <lume-element3d ref={bodyRef} align-point="0.5 0.5">
            <lume-perspective-camera ref={camRef} active/>
        </lume-element3d>
    )
}