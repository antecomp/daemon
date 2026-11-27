import { CameraController, LayerOpts, Pose } from "@/3d/cam/cam.types";
import { InteractableObject3D } from "@/core/interaction/interactable.types";
import { Orientation, XYZ } from "@/shared/types/3d.types";
import { Plane, toDegrees } from "lume";
import { onMount } from 'solid-js'
import { Vector3 } from "three";

export interface NavPlaneData {
    cam: CameraController
    goto: Partial<Pose & LayerOpts>
    onClick?: VoidFunction
    size: number | [number, number]
    show?: boolean
    pos: XYZ
    ori: Orientation
    // raycasts pass through back/non-visible portion!
    sidedness?: 'front' | 'double' | 'back'
}

export default function NavigationPlane(props: NavPlaneData) {
    let plane!: Plane;

    onMount(() => {
        (plane.three as InteractableObject3D).userData.onClick = () => {
            props.cam.goto(props.goto);
            props.onClick?.();
        }

        (plane.three as InteractableObject3D).userData.cursor = 'cursor-navigate';
    });

    const planeSize = () => {
        // Hide plane when we're at it's location.
        // Size 0,0 to keep attached to scene without raycast hits
        if (props.cam.currentStack()[0].pose.pos.toString() === props.goto.pos?.toString())
            return `0 0`;

        return Array.isArray(props.size)
            ? props.size.join(' ')
            : `${props.size} ${props.size}`
    }

    return (
        <lume-plane
            align-point='0.5 0.5'
            mount-point='0.5 0.5'
            size={planeSize()}
            has='basic-material'
            opacity={props.show ? 0.25 : 0}
            ref={plane}
            position={props.pos.toString()}
            cast-shadow='false'
            sidedness={props.sidedness}
            //@ts-expect-error - valid to put updater function here but TS doesn't recognize it.
            rotation={!props.ori ? (x: number, y: number, z: number) => {
                // Billboard...
                const camera = plane.scene?.camera;
                const cameraWorldPos = new Vector3().setFromMatrixPosition(camera!.three.matrixWorld);
                const spriteWorldPos = new Vector3().setFromMatrixPosition(plane.three.matrixWorld);

                const dx = cameraWorldPos.x - spriteWorldPos.x;
                const dz = cameraWorldPos.z - spriteWorldPos.z;
                const yaw = Math.atan2(dx, dz) // angle from sprite to cam

                return [0, toDegrees(yaw), 0];
            } : `${props.ori.pitch} ${props.ori.yaw} 0`}
        />
    )
}