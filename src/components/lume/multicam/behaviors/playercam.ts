import { isSceneLocked } from "@/layers/UILayerStore";
import { LumePosition } from "@/extra.types";
import lerp from "@/utils/lerp";
import { Scene, PerspectiveCamera } from "lume";
import * as THREE from "three";
import { InteractableObject3D } from "../../../../core/interaction/interactable.types";
import { CameraBehavior } from "../multicam.types";


export function playerCam(pos: LumePosition, maxYaw: number, maxPitch: number, baseYaw: number, basePitch: number): CameraBehavior {
    let scene: Scene;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let yaw = baseYaw;
    let pitch = basePitch;

    const handleMouseMove = (e: MouseEvent) => {
        if (isSceneLocked()) return;
        const rect = scene.getBoundingClientRect();
        const xNorm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const yNorm = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        yaw = -xNorm * maxYaw + baseYaw;
        pitch = yNorm * maxPitch + basePitch;

        mouse.set(xNorm, -yNorm);
    };

    let previouslyHoveredObject: THREE.Object3D | null = null;
    let previousUV: THREE.Vector2 | null = null;

    function runHoverRaycast(camRef: PerspectiveCamera) {
        if (!camRef || !scene || isSceneLocked()) return;
        raycaster.setFromCamera(mouse, camRef.three);

        const intersects = raycaster.intersectObjects(scene.three.children, true);
        const hoveredIntersection = intersects.length > 0 ? intersects[0] : null;
        const hoveredObject: (InteractableObject3D | null) = hoveredIntersection?.object ?? null;
        const uv = hoveredIntersection?.uv ? hoveredIntersection.uv.clone() : new THREE.Vector2();

        // If the object and UV are unchanged, skip updates
        if (hoveredObject === previouslyHoveredObject && previousUV?.equals(uv)) return;

        if (previouslyHoveredObject && hoveredObject !== previouslyHoveredObject) {
            previouslyHoveredObject.traverseAncestors(a => {
                a.userData.onHoverLeave?.();
            });
        }

        if (hoveredObject) {
            hoveredObject.userData.onHover?.(uv, mouse);
            hoveredObject.traverseAncestors(a => {
                (a as InteractableObject3D).userData.onHover?.(uv, mouse);
            });
        }

        // Update previous tracking variables
        previouslyHoveredObject = hoveredObject;
        previousUV = uv;
    }
    let boundRunHoverRayCast: () => void;

    const handleClick = (scene: Scene) => {
        if (isSceneLocked()) return;
        const intersects = raycaster.intersectObjects(scene.three.children, true);
        if (intersects.length > 0) {
            const clickedIntersection = intersects[0];
            const clickedObject: InteractableObject3D = clickedIntersection.object;

            const uv = clickedIntersection.uv ? clickedIntersection.uv.clone() : new THREE.Vector2();

            clickedObject.userData.onClick?.(uv, mouse);
            clickedObject.traverseAncestors((a) => {
                (a as InteractableObject3D).userData.onClick?.(uv, mouse);
            });
        }
    };
    let boundHandleClick: () => void;

    return {
        init({ body, cam }) {

            body.position = pos;
            body.rotation = `0 ${yaw} 0`;
            cam.rotation = `${pitch}, 0, 0`;

            // Scene isn't always attached right away - likely an indicator that I should be grabbing it some other way lol.
            requestAnimationFrame(() => {
                scene = body.scene as unknown as Scene;

                scene.addEventListener("mousemove", handleMouseMove);
                boundRunHoverRayCast = () => runHoverRaycast(cam);
                scene.addEventListener("mousemove", boundRunHoverRayCast);
                boundHandleClick = () => handleClick(scene);
                scene.addEventListener("click", boundHandleClick);
    
                body.rotation = (_xPrev, yPrev) => {
                    const newYaw = lerp(yPrev, yaw, 0.2);
                    return [0, newYaw, 0];
                };
    
                cam.rotation = (xPrev) => {
                    const newPitch = lerp(xPrev, pitch, 0.2);
                    return [newPitch, 0, 0];
                };
            })


        },

        exit() {
            scene.removeEventListener("mousemove", boundRunHoverRayCast);

            scene.removeEventListener("mousemove", handleMouseMove);

            scene.removeEventListener("click", boundHandleClick);

            if (previouslyHoveredObject) {
                previouslyHoveredObject.traverseAncestors(a => {
                    if (a.userData.onHoverLeave) a.userData.onHoverLeave();
                });
            }
            previouslyHoveredObject = null;
            previousUV = null;
        }
    };
}
