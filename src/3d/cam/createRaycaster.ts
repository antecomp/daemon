import { setHoverCursor } from "@/app/shell/scene-container/sceneState";
import { InteractableObject3D } from "@/core/interaction/interactable.types";
import { PerspectiveCamera, Scene } from "lume";
import { Object3D, Raycaster, Vector2 } from "three";

export default function createRaycaster(
    cam: PerspectiveCamera, 
    scene: Scene, 
    mouse: Vector2, 
    distance: number = Infinity
) {
    const raycaster = new Raycaster();
    raycaster.far = distance;

    let prevHoveredObj: Object3D | null = null;
    let prevUV: Vector2 | null = null;

    function hoverRaycast() {
        raycaster.setFromCamera(mouse, cam.three);
        const intersects = raycaster.intersectObjects(scene.three.children, true);
        const hoveredIntersection = intersects.length > 0 ? intersects[0] : null;
        const hoveredObj: (InteractableObject3D | null) = hoveredIntersection?.object ?? null;
        const uv = hoveredIntersection?.uv 
            ? hoveredIntersection.uv.clone() 
            : new Vector2();

        // if object/uv unchanges, skip updates...
        if (hoveredObj === prevHoveredObj && prevUV?.equals(uv)) return;

        if (prevHoveredObj && hoveredObj !== prevHoveredObj) {
            prevHoveredObj.userData.onHoverLeave?.();
            prevHoveredObj.traverseAncestors(a => a.userData.onHoverLeave?.());
        }

        if (hoveredObj) {
            hoveredObj.userData.onHover?.(uv, mouse);
            hoveredObj.traverseAncestors(a =>
                (a as InteractableObject3D).userData.onHover?.(uv, mouse)
            );
        }

        prevHoveredObj = hoveredObj;
        setHoverCursor(hoveredObj?.userData.cursor);
        prevUV = uv;
    }

    function cleanup() {
        if (prevHoveredObj) {
            prevHoveredObj.userData.onHoverLeave?.();
            prevHoveredObj.traverseAncestors(a => {
                a.userData.onHoverLeave?.();
            });
        }
        prevHoveredObj = null;
        setHoverCursor(undefined);
        prevUV = null;
    }

    function clickRaycast() {
        raycaster.setFromCamera(mouse, cam.three);
        const intersects = raycaster.intersectObjects(scene.three.children, true);
        if (intersects.length > 0) {
            const clickedIntersection = intersects[0];
            const clickedObject: InteractableObject3D = clickedIntersection.object;

            const uv = clickedIntersection.uv 
                ? clickedIntersection.uv.clone() 
                : new Vector2();

            clickedObject.userData.onClick?.(uv, mouse);
            clickedObject.traverseAncestors(a =>
                (a as InteractableObject3D).userData.onClick?.(uv, mouse)
            );
        }
    }

    return { hoverRaycast, cleanup, clickRaycast }
}