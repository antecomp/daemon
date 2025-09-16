import { Orientation } from "@/shared/types/3d.types";
import { CameraController } from "../../camera/createCameraController";
import { XYZ } from "@/shared/types/3d.types";
import { Plane, toDegrees } from "lume";
import { Vector3 } from "three";
import { onMount } from "solid-js"
import { InteractableObject3D } from "@/core/interaction/interactable.types";

export interface NavigationPlaneData {
    cameraController: CameraController,
    newPos?: XYZ
    newOri?: Orientation
    anim?: boolean
    planePosition: XYZ 
    tilts?: {maxYaw: number, maxPitch: number}
    planeSize: number | [number, number] // just assume square for now? Good enough?
    show?: boolean
    planeRotation?: Orientation// defaults to billboard otherwise.
    sidedness?: "front" | "double" | "back"
    onClick?: () => void
}

/**
 * An invisible 3D interactive plane, used to configure clickable areas that move the player around the scene.
 * Uses the cameraController interface to update camera base position/orientation when clicked.
 * @prop cameraController - The camera controller instance used to update the camera's position and orientation. @ref createCameraController.ts
 * @prop newPos - Where to move the camera to on click
 * @prop newOri - How to orient the camera on click
 * @prop tilts - maxYaw, maxPitch configuration for the camera after repositioning.
 * @prop anim - should the camera transition be animated
 * @prop planePosition - where the navigation plane is
 * @prop planeSize - 3D size of the navigation plane (square)
 * @prop sidedness - sidedness of the plane, front, back or both. 
 *                      backside cull of plane means raycast will *not* hit it. If we need to hit the plane from both sides, then use "both"
 * @prop show whether to show the plane or not, mainly used for testing/placement debugging.
 * @prop planeRotation - how the plane is oriented. If nothing is provided, the plane will automatically always face the player (billboard).
 * @prop onClick - side effect to run when the plane is clicked (navigated to)
 */
export default function NavigationPlane(props: NavigationPlaneData) {
    let planeRef!: Plane

    onMount(() => {
        (planeRef.three as InteractableObject3D).userData.onClick = () => {
            props.cameraController.setBase(props.newPos, props.newOri, props.anim, props.tilts);
            props.onClick?.();
        }

        (planeRef.three as InteractableObject3D).userData.cursor = "cursor-navigate";
    });

    const getPlaneSize = () => {
        // Hide plane when we are at it's desired location. 
        // Hacky but avoids weird ref detach issues while stopping the raycaster from hitting. (Visibility doesn't stop raycast!)
        if(props.cameraController.currentBase().pos.toString() == props.newPos?.toString()) return `0 0`;

        if(Array.isArray(props.planeSize)) { // [x,y]
            return props.planeSize.join(' ');
        } else { // just one dimension, clone it.
            return `${props.planeSize} ${props.planeSize}`
        }
    }

    return (
        <lume-plane
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            size={getPlaneSize()}
            has="basic-material"
            opacity={props.show ? 0.25 : 0}
            ref={planeRef}
            position={props.planePosition.toString()}
            cast-shadow="false"
            sidedness={props.sidedness}
            //@ts-expect-error - valid to put updater function here but TS doesn't recognize it.
            rotation={!props.planeRotation ? (x: number, y:number, z: number) => {
                const camera = planeRef.scene?.camera
                const cameraWorldPos = new Vector3().setFromMatrixPosition(camera!.three.matrixWorld);
                const spriteWorldPos = new Vector3().setFromMatrixPosition(planeRef.three.matrixWorld);

                const dx = cameraWorldPos.x - spriteWorldPos.x;
                const dz = cameraWorldPos.z - spriteWorldPos.z;
                const yaw = Math.atan2(dx, dz); // Compute angle from sprite to camera

                return [0, toDegrees(yaw), 0]
            } : `${props.planeRotation.pitch} ${props.planeRotation.yaw} 0`}
        />
    )
}