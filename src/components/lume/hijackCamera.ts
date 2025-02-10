import { FOV } from "@/config";
import { Gimbal, LumePosition } from "@/extra.types";
import { Scene } from "lume";

interface hijackCameraSettings {
    sceneRef: Scene | undefined, 
    targetPosition: LumePosition, 
    targetOrientation: Omit<Gimbal, 'roll'>
}

export default function hijackCamera({sceneRef, targetOrientation, targetPosition}: hijackCameraSettings) {
    if (!sceneRef) {console.log("No scene detected for hijack"); return;}

    const hijackBody = document.createElement("lume-element3d");
    hijackBody.setAttribute("position", targetPosition);
    hijackBody.setAttribute("rotation", `0 ${targetOrientation.yaw} 0`);
    hijackBody.setAttribute("align-point", "0.5 0.5");

    const hijackCamera = document.createElement("lume-perspective-camera");
    hijackCamera.setAttribute("rotation", `${targetOrientation.pitch} 0 0`)
    hijackCamera.setAttribute("fov", FOV);
    hijackCamera.setAttribute("active", true);

    hijackBody.appendChild(hijackCamera);
    sceneRef.appendChild(hijackBody)

    return hijackBody; // Reference here used so we can remove it later.

}