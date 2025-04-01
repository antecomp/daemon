import { AssetURL, LumePosition } from "@/extra.types";
import { Plane, toDegrees } from "lume";
import { MeshBasicMaterial, Vector2, Vector3 } from "three";
import {onMount} from "solid-js"

export default function Billboard(props: {
    texture: AssetURL,
    scale?: number,
    position: LumePosition
}) {

    let me!: Plane

    onMount(() => {
        const img = new Image();
        img.src = me.texture!
        img.onload = () => {
            me.size = `${(props.scale ?? 1) * img.width / 10} ${(props.scale ?? 1) * img.height / 10}`
        }

        // me.three.userData.onHover = (uv: Vector2) => {
        //     console.log(uv);
        // }

        me.three.userData.onClick = (uv: Vector2) => alert(uv.toArray().toString());
    })


    return (
        <>
        <lume-plane
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            texture={props.texture}
            position={props.position}
            ref={me}
            alpha-test={0.1}
            cast-shadow
            id="bbrd"
            sidedness="double"
            receive-shadow="false"
            has="basic-material"
            //@ts-ignore
            rotation={(x: number,y:number,z:number) => {
                const camera = me.scene?.camera
                const cameraWorldPos = new Vector3().setFromMatrixPosition(camera!.three.matrixWorld);
                const spriteWorldPos = new Vector3().setFromMatrixPosition(me.three.matrixWorld);

                const dx = cameraWorldPos.x - spriteWorldPos.x;
                const dz = cameraWorldPos.z - spriteWorldPos.z;
                const yaw = Math.atan2(dx, dz); // Compute angle from sprite to camera

                return [0, toDegrees(yaw), 0]
            }}
        />
        </>
    )
}