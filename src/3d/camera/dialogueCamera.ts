import { dialogueOngoing, startDialogue, StartDialogueOptions } from "@/core/dialogue";
import { CameraController, CameraSettings } from "./camera.types";
import { SceneFadeManager } from "@/app/shell/scene-fade-overlay/SceneFade";
import { BnyProgram } from "@bunnarray/vm";

type DialogueCamOptions = StartDialogueOptions & {
    fadeTransition?: boolean;
};

export function createDialogueWithCamOvr(
    cameraController: CameraController,
    ovr: CameraSettings,
    program: BnyProgram,
    dialogueOptions?: DialogueCamOptions
) {
    const ovrMgr = cameraController.createOverride(ovr);
    const useFade = dialogueOptions?.fadeTransition;

    const runWithFadeTransition = async (action: () => void) => {
        if (!useFade) {
            action();
            return;
        }
        await SceneFadeManager.fadeTransition(action);
    };

    return {
        start: async () => {
            if (dialogueOngoing()) return; // dialogue already active. Prevent double commit.
            await runWithFadeTransition(() => ovrMgr.commit());
            try {
                return await startDialogue(program, dialogueOptions);
            } finally {
                await runWithFadeTransition(() => ovrMgr.release(ovr.anim));
            }  
        },
        ovrMgr
    }
}
