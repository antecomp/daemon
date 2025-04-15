import { Gimbal } from "@/extra.types";
import { CameraController } from "./playerCam/createCameraController";
import { XYZ } from "./playerCam/PlayerCam";
import { Plane, toDegrees } from "lume";
import { Vector3 } from "three";
import { onMount } from "solid-js"
import { InteractableObject3D } from "@/core/interaction/interactable.types";

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
 * @prop show whether to show the plane or not, mainly used for testing/placement debugging.
 * @prop planeRotation - how the plane is oriented. If nothing is provided, the plane will automatically always face the player (billboard).
 */
export default function NavigationPlane(props: {
    cameraController: CameraController,
    newPos?: XYZ
    newOri?: Omit<Gimbal, "roll">
    anim?: boolean
    planePosition: XYZ 
    tilts?: {maxYaw: number, maxPitch: number}
    planeSize: number // just assume square for now? Good enough?
    show?: boolean
    planeRotation?: Omit<Gimbal, "roll"> // defaults to billboard otherwise.
}) {
    let planeRef!: Plane

    onMount(() => {
        // TODO: Probably some hover event that we use to indicate to the player that this is a navigation area.
        //          Do this when you work on the cursor stuff.
        (planeRef.three as InteractableObject3D).userData.onClick = () => {
            props.cameraController.setBase(props.newPos, props.newOri, props.anim, props.tilts);
        }
    })

    return (
        <lume-plane
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            // Hacky approach but hey it works!
            size={props.cameraController.currentBase().pos.toString() == props.newPos?.toString() ? `0 0` : `${props.planeSize} ${props.planeSize}`}
            has="basic-material"
            opacity={props.show ? 0.25 : 0}
            ref={planeRef}
            position={props.planePosition.toString()}
            cast-shadow="false"
            //@ts-expect-error
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