import { Gimbal } from "@/extra.types";
import createCameraController from "./playerCam/createCameraController";
import { XYZ } from "./playerCam/PlayerCam";
import { Plane, toDegrees, XYZNumberValues } from "lume";
import { Vector3 } from "three";
import { onMount } from "solid-js"
import { InteractableObject3D } from "@/core/interaction/interactable.types";

export default function NavigationPlane(props: {
    cameraController: ReturnType<typeof createCameraController>['cameraController'],
    newPos?: XYZ
    newOri?: Omit<Gimbal, "roll">
    anim?: boolean
    planePosition: XYZ 
    tilts?: {maxYaw: number, maxPitch: number}
    planeSize: number // just assume square for now? Good enough?
    show?: boolean
    planeRotation?: Omit<Gimbal, "roll"> // default to billboard
}) {
    let planeRef!: Plane

    onMount(() => {
        // Probably some hover event that we use to indicate to the player that this is a navigation area.
        (planeRef.three as InteractableObject3D).userData.onClick = () => {
            props.cameraController.setBase(props.newPos, props.newOri, props.anim, props.tilts);
        }
    })

    return (
        <lume-plane
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            // size="500 500"
            size={`${props.planeSize} ${props.planeSize}`}
            has="basic-material"
            opacity={props.show ? 0.25 : 0}
            ref={planeRef}
            // Should I just be lazy and do a opacity 0 and stuff???????
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