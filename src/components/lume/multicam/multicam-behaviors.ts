import { LumePosition } from "@/extra.types";
import { CameraBehavior } from "./multicam.types";
import { PerspectiveCamera, Scene } from "lume";
import * as THREE from "three";
import lerp from "@/util/lerp";
import { isCloseTo } from "@/util/isCloseTo";

export function snapTo(pos: LumePosition, yaw: number, pitch: number): CameraBehavior {
    return {
        init({body, cam}) {
            body.position = pos;
            body.rotation = `0 ${yaw} 0`;
            cam.rotation = `${pitch}, 0, 0`;
        },
    }
}

export function lerpTo(pos: [number, number, number], yaw: number, pitch: number, onComplete?: () => void): CameraBehavior {
    return {
        init({body, cam}) {
            let lerpComplete = false;

            body.position = (x, y, z) => {
                if(lerpComplete) return [x, y, z];

                if(isCloseTo(x, pos[0], 0.1) && isCloseTo(y, pos[1], 0.1) && isCloseTo(z, pos[2], 0.1)) {
                    lerpComplete = true;
                    onComplete?.();
                }

                return [
                    lerp(x, pos[0], 0.2),
                    lerp(y, pos[1], 0.2),
                    lerp(z, pos[2], 0.2)
                ]
            }

            body.rotation = (_xPrev, yPrev) => {
                const newYaw = lerp(yPrev, yaw, 0.2);
                return [0, newYaw, 0];
            }

            cam.rotation = (xPrev) => {
                const newPitch = lerp(xPrev, pitch, 0.2);
                return [newPitch, 0, 0];
            }
        }
    }
}

export function lerpToAsync(
    position: [number, number, number],
    yaw: number,
    pitch: number,
): [CameraBehavior, Promise<void>] {
    let resolvePromise: () => void;
    const lerpPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
    });
    const behavior = lerpTo(position, yaw, pitch, () => {
        resolvePromise();
    });
    return [behavior, lerpPromise];
}

export function playerCam(pos: LumePosition, maxYaw: number, maxPitch: number, baseYaw: number, basePitch: number): CameraBehavior {
    let scene: Scene;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let yaw = baseYaw;
    let pitch = basePitch;
    
    const handleMouseMove = (e: MouseEvent) => {
        console.log("mousemove");
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
    let boundRunHoverRayCast: () => void;

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
    let boundHandleClick: () => void;

    return {
        init({body, cam}) {

            body.position = pos;
            body.rotation = `0 ${yaw} 0`;
            cam.rotation = `${pitch}, 0, 0`;

            scene = body.scene as unknown as Scene;

            scene.addEventListener("mousemove", handleMouseMove)
            boundRunHoverRayCast = () => runHoverRaycast(cam);
            scene.addEventListener("mousemove", boundRunHoverRayCast);
            boundHandleClick = () => handleClick(scene);
            scene.addEventListener("click", boundHandleClick);

            body.rotation = (_xPrev, yPrev) => {
                console.log("Running body rotation")
                const newYaw = lerp(yPrev, yaw, 0.2);
                return [0, newYaw, 0];
            }

            cam.rotation = (xPrev) => {
                console.log("Running cam rotation")
                const newPitch = lerp(xPrev, pitch, 0.2);
                return [newPitch, 0, 0];
            }
        },

        exit({cam}) {
            scene.removeEventListener("mousemove", boundRunHoverRayCast);

            // You can comment this to better see the cam.rotation bug.
            scene.removeEventListener("mousemove", handleMouseMove);

            scene.removeEventListener("click", boundHandleClick);

            if(previouslyHoveredObject) {
                previouslyHoveredObject.traverseAncestors(a => {
                    if (a.userData.onHoverLeave) a.userData.onHoverLeave();
                });
            }
            previouslyHoveredObject = null;
            previousUV = null;
            
            // Reset update functions????
            // body.rotation = (x,y,z) => [x,y,z]; // unnecessary it seems?

            // This works. Similarly if we instead go from playercam to lerp, that works, since that has it's own cam rotation function.
            // The issue is explicitely with Playercam -> SnapTo since we're going from function to static.
            cam.rotation = (x,y,z) => [x,y,z]; // otherwise the cam.rotation function above continues to run.

            // @ts-ignore
            //cam.rotation = null; 
            // ^ This and to [0,0,0] "works" but seems to bug out my YBillboard component. I'm not sure if thats a problem here or with that component.
        }
    }
}