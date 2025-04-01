import { LumePosition } from "@/extra.types";
import { Element3D, Motor, onCleanup, onMount, RenderTask } from "lume";
import * as THREE from 'three'
import { interactionCB } from "./Interactable";
import { InteractionMap, currentInteractionMode } from "../ui/interaction/InteractionModePicker";

interface YBillboardProps {
    texture: string, // (url)
    size?: number,
    position: LumePosition;
    onHover?: interactionCB;
    onClick?: interactionCB;
    interactions?: InteractionMap;
}

/**
 * Yaw-only billboard (sprite) - mainly used for 2D art of characters within a scene. Tilts about Y to face the player, but doesn't tilt along X/Z like THREE.Sprite
 * 
 * NOTE: Due to the nature of transparency and no actual geometry, these comes with their own interaction handlers.
 * please use those over the Interactable Wrapper.
 * @prop texture - url for image texture
 * @prop size - the *height* of the sprite in 3D space
 * @prop position - lume-style position.
 * @prop onHover - hover CB, passed UV coordinates
 * @prop onClick - click CB, passed UV coordinates
 */
export default function YBillboard(props: YBillboardProps) {
    let wrapperRef: Element3D | undefined;
    let plane: THREE.Mesh | null = null;
    let planeMaterial: THREE.MeshBasicMaterial | null = null;
    let yawRenderTask: RenderTask | null = null;

    // Array corresponding to sprite texture holding an opacity mask
    // Used to restrict onClick to only opaque parts of the sprite.
    let alphaMask: Uint8Array | null = null;
    let maskWidth = 0;
    let maskHeight = 0;

    function updateYawOnly() {
        if (!wrapperRef?.scene?.three || !plane) return;
    
        const camera = wrapperRef.scene.threeCamera;
    
        // Force world matrices to update before reading them
        camera.updateMatrixWorld(true);
        plane.updateMatrixWorld(true);
    
        // Get world positions from matrixWorld
        const cameraWorldPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
        const spriteWorldPos = new THREE.Vector3().setFromMatrixPosition(plane.matrixWorld);
    
        // Compute yaw (rotation around Y axis) using atan2
        // lookAt wasn't working for me :/
        const dx = cameraWorldPos.x - spriteWorldPos.x;
        const dz = cameraWorldPos.z - spriteWorldPos.z;
        const yaw = Math.atan2(dx, dz); // Compute angle from sprite to camera
    
        plane.rotation.set(0, yaw, 0); // Apply only Y rotation
    }

    function isOpaque(uv: THREE.Vector2): boolean {
        if (!alphaMask) return true;
        const x = Math.floor(uv.x * maskWidth);
        const y = Math.floor((1 - uv.y) * maskHeight); // Flip Y axis
        const index = y * maskWidth + x;
        return alphaMask[index] === 1;
    }

    onMount(() => {
        if (!wrapperRef) return;

        const textureLoader = new THREE.TextureLoader();
        const baseSize = props.size || 100;

        textureLoader.load(
            props.texture,
            async (texture) => {
                if (!wrapperRef.scene?.three) {
                    console.error("Scene is missing at texture load time. Race condition?");
                    return;
                }

                // Create an offscreen canvas to process image (get pixel data to build opacity mask)
                const offscreenCanvas = document.createElement("canvas");
                const offscreenCtx = offscreenCanvas.getContext("2d", {willReadFrequently: true});
                offscreenCanvas.width = texture.image.width;
                offscreenCanvas.height = texture.image.height
                offscreenCtx!.drawImage(texture.image, 0, 0);
                const imgData = offscreenCtx!.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height).data;

                maskWidth = offscreenCanvas.width;
                maskHeight = offscreenCanvas.height;
                alphaMask = new Uint8Array(maskWidth * maskHeight);
                
                for (let i = 0; i < maskWidth * maskHeight; i++) {
                    const alpha = imgData[i * 4 + 3];
                    alphaMask[i] = alpha > 25 ? 1 : 0;
                }

                // Create and append actual mesh to scene.
                const aspect = texture.image.width / texture.image.height;
                const geometry = new THREE.PlaneGeometry(aspect * baseSize, baseSize);
                planeMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true
                });
                plane = new THREE.Mesh(geometry, planeMaterial);
                plane.rotation.x = Math.PI / 2;
                wrapperRef.three.add(plane);
                yawRenderTask = Motor.addRenderTask(updateYawOnly);
                wrapperRef.scene.needsUpdate(); // Force update to render in new billboard.
            },
            undefined,
            (error) => console.error("Texture loading error: ", error)
        );

        // Attach Interaction Event Listeners.
        if(!wrapperRef?.three) return;
        if(props.onHover) { // Only attach onHover if action defined (performance)
            wrapperRef.three.userData.onHover = (uv: THREE.Vector2) => {
                if (isOpaque(uv)) {
                    if(props.onHover) props.onHover(uv);
                }
            };
        }
        wrapperRef.three.userData.onClick = (uv: THREE.Vector2) => {
            if (isOpaque(uv)) {
                if(props.onClick) props.onClick(uv);

                if(props.interactions && props.interactions[currentInteractionMode()]) {
                    props.interactions[currentInteractionMode()]!(); // Ts doesnt like my catch for some reason.
                }
            }
        };


    });

    onCleanup(() => {
        if (plane && wrapperRef) {
            wrapperRef.three.remove(plane);
        }
        planeMaterial?.dispose();
        plane?.geometry.dispose();
        plane = null;
        planeMaterial = null;
        if(yawRenderTask) Motor.removeRenderTask(yawRenderTask);

        alphaMask = null;
    });

    return (
        <lume-element3d
            align-point="0.5 0.5"
            ref={wrapperRef}
            position={props.position}
        />
    )
}
