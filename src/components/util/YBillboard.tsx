import { LumePosition } from "@/extra.types";
import { Element3D, Motor, onCleanup, onMount, RenderTask } from "lume";
import * as THREE from 'three'

interface YBillboardProps {
    texture: string, // (url)
    size?: number,
    position: LumePosition;
}

export default function YBillboard(props: YBillboardProps) {
    let wrapperRef: Element3D | undefined;
    let plane: THREE.Mesh | null = null;
    let planeMaterial: THREE.MeshBasicMaterial | null = null;
    let yawRenderTask: RenderTask | null = null;

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

    onMount(() => {
        if (!wrapperRef) return;

        const textureLoader = new THREE.TextureLoader();
        const baseSize = props.size || 100;

        textureLoader.load(
            props.texture,
            (texture) => {
                if (!wrapperRef.scene?.three) {
                    console.error("Scene is missing at texture load time. Race condition?");
                    return;
                }

                const aspect = texture.image.width / texture.image.height;
                const geometry = new THREE.PlaneGeometry(aspect * baseSize, baseSize);
                planeMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true // explicitely enable alpha. Do we need this?
                });

                plane = new THREE.Mesh(geometry, planeMaterial);
                plane.rotation.x = Math.PI / 2;

                wrapperRef.three.add(plane);

                //wrapperRef.scene.three.onBeforeRender = updateYawOnly;
                yawRenderTask = Motor.addRenderTask(updateYawOnly);
                wrapperRef.scene.needsUpdate(); // Force update to render in new billboard.
            },
            undefined,
            (error) => console.error("Texture loading error: ", error)
        );
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
    });

    return (
        <lume-element3d
            align-point="0.5 0.5"
            ref={wrapperRef}
            position={props.position}
        />
    )
}