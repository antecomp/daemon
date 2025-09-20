import { CameraController, CameraSettings } from "./camera.types";
import { DialogueNode } from "@/core/dialogue/dialogueNode.types";
import { DialogueService, StartDialogueOptions } from "@/core/dialogue/dialogueService";

/**
 * Prepares a dialogue sequence that uses a deferred camera override.
 *
 * Creates an override handle with the provided camera settings, then exposes helpers
 * for starting the dialogue (committing the override) and manually releasing the camera.
 * The override is automatically released when the dialogue promise settles, even if
 * the dialogue throws.
 *
 * @param cameraController - Camera controller that manages override state.
 * @param ovr - Camera position/orientation/animation to apply while the dialogue runs.
 * @param dialogueRoot - Root node of the dialogue that will be started on commit.
 * @param dialogueOptions - Optional options forwarded to the dialogue service.
 * @returns An object containing `start`, which commits the override and launches the dialogue,
 *          and `ovrMgr`, which exposes the underlying override handle (commit/release/id) to be used for advanced mid-dialogue camera control.
 */
export function createDialogueWithCamOvr(
    cameraController: CameraController,
    ovr: CameraSettings,
    dialogueRoot: DialogueNode,
    dialogueOptions?: StartDialogueOptions
) {
    const ovrMgr = cameraController.createOverride(ovr);

    return {
        start: async () => {
            if (DialogueService.dialogueOngoing()) return; // dialogue already active. Prevent double commit.
            ovrMgr.commit();
            try {
                return await DialogueService.startDialogue(dialogueRoot, dialogueOptions);
            } finally {
                ovrMgr.release(ovr.anim);
            }  
        },
        ovrMgr
    }
}