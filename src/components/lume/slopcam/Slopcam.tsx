import { Element3D, PerspectiveCamera } from "lume";
import { CameraBehavior, CameraRefs } from "./slopcam.types";
import { onCleanup, onMount } from "solid-js"

let currentBehavior: CameraBehavior | null = null;
let storedRefs: CameraRefs | null = null;

export const cameraController = {
    setBehavior(behavior: CameraBehavior) {
        currentBehavior?.exit?.(storedRefs!);
        currentBehavior = behavior;
        currentBehavior?.init?.(storedRefs!);
    },

    getBehaviors(): CameraBehavior | null {
		return currentBehavior;
	},

    // injected once HeadCam mounts
	attachRefs(refs: CameraRefs) {
		storedRefs = refs;
		currentBehavior?.init?.(storedRefs);
	}
}

interface SlopcamProps {
    initialBehavior?: CameraBehavior
}

export default function SlopCam(props: SlopcamProps) {
    let bodyRef!: Element3D;
    let camRef!: PerspectiveCamera;
    let animationID: number;
    let lastTime = performance.now();

    onMount(() => {
        if(!bodyRef || !camRef) throw new Error("REFS NOT READY FOR SLOPCAM AAAAA");
        const refs: CameraRefs = {body: bodyRef, cam: camRef};
        cameraController.attachRefs(refs);

        if(props.initialBehavior) {
            cameraController.setBehavior(props.initialBehavior);
        }

        const loop = (now: number) => {
            const dt = now - lastTime;
            lastTime = now;

            cameraController?.getBehaviors()?.update?.(refs, dt);
            animationID = requestAnimationFrame(loop);
        };

        // start loop
        animationID = requestAnimationFrame(loop);
    });

    onCleanup(() => {
        cancelAnimationFrame(animationID);
        cameraController?.getBehaviors()?.exit?.({body: bodyRef, cam: camRef});
    });

    return (
        <lume-element3d ref={bodyRef} align-point="0.5 0.5">
            <lume-perspective-camera ref={camRef} active/>
        </lume-element3d>
    )
}