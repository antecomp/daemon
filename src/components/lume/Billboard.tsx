import { AssetURL, LumePosition } from "@/extra.types";
import { Plane, toDegrees } from "lume";
import { MeshBasicMaterial, Vector2, Vector3 } from "three";
import { onMount } from "solid-js";
import { interactionCB } from "./Interactable";

const generateAlphaMask = (image: HTMLImageElement) => {
    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d", {willReadFrequently: true});
    offscreenCanvas.width = image.width;
    offscreenCanvas.height = image.height
    offscreenCtx!.drawImage(image, 0, 0);
    const imgData = offscreenCtx!.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height).data;

    const maskWidth = offscreenCanvas.width;
    const maskHeight = offscreenCanvas.height;
    const alphaMask = new Uint8Array(maskWidth * maskHeight);

    for (let i = 0; i < maskWidth * maskHeight; i++) {
        const alpha = imgData[i * 4 + 3];
        alphaMask[i] = alpha > 25 ? 1 : 0;
    }

    return {maskHeight, maskWidth, alphaMask}
}

export default function Billboard(props: {
    texture: AssetURL,
    scale?: number,
    position: LumePosition
    onClick?: interactionCB,
    onHover?: interactionCB
}) {

    let me!: Plane
    let maskData = {
        alphaMask: null as Uint8Array | null,
        maskWidth: 0,
        maskHeight: 0
    }

    function isOpaque(uv: Vector2): boolean {
        if(!maskData.alphaMask) return true;
        const {alphaMask, maskWidth, maskHeight} = maskData;
        const x = Math.floor(uv.x * maskWidth);
        const y = Math.floor((1 - uv.y) * maskHeight); // Flip Y axis
        const index = y * maskWidth + x;
        return alphaMask[index] === 1;
    }

    onMount(() => {
        const img = new Image();
        img.src = me.texture!
        img.onload = () => {
            me.size = `${(props.scale ?? 1) * img.width / 10} ${(props.scale ?? 1) * img.height / 10}`;
            maskData = generateAlphaMask(img);
            console.log(maskData.alphaMask);
        }

        // Replace / Extend me with interactions config.
        if(props.onClick) {me.three.userData.onClick = (uv: Vector2) => isOpaque(uv) && props.onClick!(uv)}
        if(props.onHover) {me.three.userData.onHover = (uv: Vector2) => isOpaque(uv) && props.onHover!(uv)}
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