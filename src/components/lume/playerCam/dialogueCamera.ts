// Helper function to handle a single reposition of the camera during dialogue.

import { Gimbal } from "@/extra.types";
import createCameraController from "./createCameraController";
import { XYZ } from "./PlayerCam";
import { DialogueNode } from "@/core/dialogue/dialogueNode.types";
import { DialogueService, StartDialogueOptions } from "@/core/dialogue/dialogueService";

export async function startDialogueWithCamOvr(
    cameraController: ReturnType<typeof createCameraController>['cameraController'],
    pos: XYZ,
    ori: Omit<Gimbal, "roll">,
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