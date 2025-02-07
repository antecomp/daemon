import { LumePosition } from "@/extra.types";
import { Element3D, Motor, onCleanup, onMount, RenderTask } from "lume";
import * as THREE from 'three'
import { interactionCB } from "./Interactable";

interface YBillboardProps {
    texture: string, // (url)
    size?: number,
    position: LumePosition;
    onHover?: interactionCB;
    onClick?: interactionCB;
}

/**
 * Yaw-only billboard (sprite) - mainly used for 2D art of characters within a scene. Tilts about Y to face the player, but doesn't tilt along X/Z like THREE.Sprite
 * 
 * NOTE: Due to the nature of transparency and no actual geometry, these comes with their own interaction handlers (onClick/onHover),
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

    // Offscreen canvas used for alpha collision detection
    // Super hacky, may want to replace with a more elegant solution in the future
    let offscreenCanvas: HTMLCanvasElement | null = null;
    let offscreenCtx: CanvasRenderingContext2D | null = null;
    let imageBitmap: ImageBitmap | null = null;

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
        if (!offscreenCtx || !offscreenCanvas) return true; // Assume opaque if no canvas
        if (!imageBitmap) return true; // Fallback if the image isn't ready yet
    
        // Convert UV coordinates (0 → 1) to pixel coordinates
        const x = Math.floor(uv.x * offscreenCanvas.width);
        const y = Math.floor((1 - uv.y) * offscreenCanvas.height); // Y is flipped from texture input.
    
        // Get pixel data from the canvas
        const pixel = offscreenCtx.getImageData(x, y, 1, 1).data;
        const alpha = pixel[3] / 255; // Normalize alpha to 0-1 range
    
        return alpha > 0.1; // Threshold to ignore nearly transparent pixels
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

                // Create offscreen canvas representation of sprite. Used for opaque check
                // on mouse events. TODO: Is this the most elegant way of doing this???
                offscreenCanvas = document.createElement("canvas");
                offscreenCtx = offscreenCanvas.getContext("2d");
                offscreenCanvas.width = texture.image.width;
                offscreenCanvas.height = texture.image.height
                offscreenCtx!.drawImage(texture.image, 0, 0);
                imageBitmap = await createImageBitmap(texture.image); // Convert texture to ImageBitmap for faster pixel access

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
        wrapperRef.three.userData.onHover = (uv: THREE.Vector2) => {
            if (isOpaque(uv)) {
                if(props.onHover) props.onHover(uv);
            }
        };

        wrapperRef.three.userData.onClick = (uv: THREE.Vector2) => {
            if (isOpaque(uv)) {
                if(props.onClick) props.onClick(uv);
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

        // Need to dispose of offscreen canvas manually since we attach it to the document
        if(offscreenCanvas) {
            offscreenCanvas = null;
        } 
        if (offscreenCtx) {
            offscreenCtx = null;
        }

        if (imageBitmap) {
            imageBitmap.close();
            imageBitmap = null;
        }

    });

    return (
        <lume-element3d
            align-point="0.5 0.5"
            ref={wrapperRef}
            position={props.position}
        />
    )
}