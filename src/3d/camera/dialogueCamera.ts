import {  Orientation } from "@/shared/types/3d.types";
import { CameraController } from "./createCameraController";
import { XYZ } from "./PlayerCam";
import { DialogueNode } from "@/core/dialogue/dialogueNode.types";
import { DialogueService, StartDialogueOptions } from "@/core/dialogue/dialogueService";

/**
 * Starts a dialogue sequence with camera position and orientation overrides.
 *
 * Temporarily overrides the camera's position and orientation for the duration of the dialogue,
 * and ensures the camera is reset to its previous state after the dialogue ends (or if an error occurs).
 *
 * @param cameraController - The camera controller instance used to set and clear camera overrides.
 * @param pos - The target position for the camera override.
 * @param ori - The target orientation for the camera override
 * @param dialogueRoot - The root node of the dialogue to start.
 * @param anim - Optional. Whether to animate the camera transition. Defaults to false.
 * @param dialogueOptions - Optional. Additional options for starting the dialogue.
 * @returns A promise that resolves when the dialogue ends (used to await dialogue completion)
 */
export async function startDialogueWithCamOvr(
    cameraController: CameraController,
    pos: XYZ,
    ori: Orientation,
    dialogueRoot: DialogueNode,
    anim = false,
    dialogueOptions?: StartDialogueOptions,
) {
    cameraController.setOverrides(pos, ori, anim);

    // Using .finally to trigger camera return on error also.
    try {
        return await DialogueService.startDialogue(dialogueRoot, dialogueOptions);
    } finally {
        cameraController.clearOverrides(anim);
    }
}