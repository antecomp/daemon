import { LumePosition } from "@/extra.types";
import { CameraBehavior } from "./slopcam.types";
import { PerspectiveCamera, Scene } from "lume";
import * as THREE from "three";
import lerp from "@/util/lerp";

export function snapTo(pos: LumePosition, yaw: number, pitch: number): CameraBehavior {
    return {
        init({body, cam}) {
            body.position = pos;
            body.rotation = `0 ${yaw} 0`;
            cam.rotation = `${pitch}, 0, 0`;
        },
    }
}

export const oscillate = (pos: LumePosition, yaw: number, pitch: number): CameraBehavior => ({
    init({body, cam}) {
        body.position = pos;
        body.rotation = `0 ${yaw} 0`;
        cam.rotation = `${pitch}, 0, 0`;
        // No delay needed it appears, itll pick up on the set we just did :D
        body.position = (x, y, z) => [x, y, 0.02 * (0 - z) + z];
        body.rotation = (x, y) => [x+0.5, y+0.5];
    }
})

export function playerCam(pos: LumePosition, maxYaw: number, maxPitch: number, baseYaw: number, basePitch: number): CameraBehavior {
    let scene: Scene;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let yaw = baseYaw;
    let pitch = basePitch;
    
    const handleMouseMove = (e: MouseEvent) => {
        const rect = scene.getBoundingClientRect();
        const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        yaw = -xNorm * maxYaw + baseYaw;
        pitch = yNorm * maxPitch + basePitch;

        mouse.set(xNorm, -yNorm);
    }

    let previouslyHoveredObject: THREE.Object3D | null = null;
    let previousUV: THREE.Vector2 | null = null

    function runHoverRaycast(camRef: PerspectiveCamera) {
        if (!camRef || !scene) return;
        raycaster.setFromCamera(mouse, camRef.three);

        const intersects = raycaster.intersectObjects(scene.three.children, true);
        const hoveredIntersection = intersects.length > 0 ? intersects[0] : null;
        const hoveredObject = hoveredIntersection?.object || null;
        const uv = hoveredIntersection?.uv ? hoveredIntersection.uv.clone() : new THREE.Vector2();

        // If the object and UV are unchanged, skip updates
        if (hoveredObject === previouslyHoveredObject && previousUV?.equals(uv)) return;

        if (previouslyHoveredObject && hoveredObject !== previouslyHoveredObject) {
            previouslyHoveredObject.traverseAncestors(a => {
                if (a.userData.onHoverLeave) a.userData.onHoverLeave();
            });
        }

        if (hoveredObject) {
            hoveredObject.traverseAncestors(a => {
                if (a.userData.onHover) a.userData.onHover(uv);
            });
        }

        // Update previous tracking variables
        previouslyHoveredObject = hoveredObject;
        previousUV = uv;
    }

    const handleClick = (scene: Scene) => {
        const intersects = raycaster.intersectObjects(scene.three.children, true);
        if(intersects.length > 0) {
            const clickedIntersection = intersects[0];
            const clickedObject = clickedIntersection.object;

            const uv = clickedIntersection.uv ? clickedIntersection.uv.clone() : new THREE.Vector2();

            clickedObject.traverseAncestors(a => {
                a.userData.onClick?.(uv);
            })
        }
    }

    return {
        init({body, cam}) {

            body.position = pos;
            body.rotation = `0 ${yaw} 0`;
            cam.rotation = `${pitch}, 0, 0`;

            scene = body.scene as unknown as Scene;

            scene.addEventListener("mousemove", handleMouseMove)
            scene.addEventListener("mousemove", () => runHoverRaycast(cam));
            scene.addEventListener("click", () => handleClick(scene));

            body.rotation = (_xPrev, yPrev) => {
                const newYaw = lerp(yPrev, yaw, 0.2);
                return [0, newYaw, 0];
            }

            cam.rotation = (xPrev) => {
                const newPitch = lerp(xPrev, pitch, 0.2);
                return [newPitch, 0, 0];
            }
        },

        exit({cam}) {
            scene.removeEventListener("mousemove", handleMouseMove);
            scene.removeEventListener("mousemove", () => runHoverRaycast(cam));
            scene.removeEventListener("click", () => handleClick(scene));
        }
    }
}