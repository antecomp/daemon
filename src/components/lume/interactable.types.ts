import * as THREE from "three";
import { Vector2 } from "three";


export interface InteractableObject3D extends THREE.Object3D {
    userData: {
        onHover?: interactionCB;
        onHoverLeave?: () => void;
        onClick?: interactionCB;
    };
}

export type interactionCB = (uv: Vector2, mouse: Vector2) => void;

