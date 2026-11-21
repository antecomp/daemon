import { dialogueOngoing, startDialogue, StartDialogueOptions } from "@/core/dialogue";
import { CameraController, CameraSettings } from "./camera.types";
import { SceneFadeManager } from "@/app/shell/scene-fade-overlay/SceneFade";
import { BnyProgram } from "@bunnarray/vm";

/** {@link StartDialogueOptions} plus an optional fade into and out of the camera view. */
type DialogueCamOptions = StartDialogueOptions & {
    /** Fade when applying and releasing the camera view (default: false). */
    fadeTransition?: boolean;
};

/**
 * Prepare a dialogue with a temporary camera view. Call the returned `start()` to show it.
 * The view is restored after the dialogue closes.
 * @param cameraController Camera whose view is temporarily changed.
 * @param ovr View to use during the dialogue.
 * @param program Dialogue to play.
 * @param dialogueOptions Optional {@link StartDialogueOptions}: 
 * - `initialOverlay` shows a starting image,
 * - `initialMemory` seeds dialogue values, 
 * - `onMemoryUpdate` receives memory changes,
 * - `signalHandlers` map of signals to handlers  `{[identifier]: (value, runtime) => void}`,
 * - `yieldHandlers` map of yield handlers. `{[identifier]: YieldHandler`,
 * - and `speakerNames` replaces displayed speaker names.
 */
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
        /** Show the dialogue and moves the camera. Camera restores when dialogue ends. */
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
