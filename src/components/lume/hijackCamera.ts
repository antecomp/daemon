import { FOV } from "@/config";
import { Gimbal, Point3D, Point3DTuple } from "@/extra.types";
import { Scene } from "lume";

interface HijackerCameraProps {
    targetLocation: Point3D
    targetOrientation: Omit<Gimbal, 'roll'>
}

export default function hijackCamera(sceneRef: Scene | undefined) {
    if (!sceneRef) {console.log("No scene detected for hijack"); return;}

    const hijackBody = document.createElement("lume-element3d");
    hijackBody.setAttribute("position", "-220 -320 128");
    hijackBody.setAttribute("rotation", "0 270 0");
    hijackBody.setAttribute("align-point", "0.5 0.5");

    const hijackCamera = document.createElement("lume-perspective-camera");
    hijackCamera.setAttribute("rotation", "20 0 0")
    hijackCamera.setAttribute("fov", FOV);
    hijackCamera.setAttribute("active", true);

    hijackBody.appendChild(hijackCamera);
    sceneRef.appendChild(hijackBody)

    return hijackBody; // Reference here used so we can remove it later.

}

