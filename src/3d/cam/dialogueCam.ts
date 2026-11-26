import { BnyProgram } from "@bunnarray/vm";
import { CameraController, Pose } from "./cam.types";
import { dialogueOngoing, startDialogue, StartDialogueOptions } from "@/core/dialogue/dialogueSession";
import { SceneFadeManager } from "@/app/shell/scene-fade-overlay/SceneFade";

export default function createDialogueWithCamOverride(
    cam: CameraController,
    program: BnyProgram,
    ovr: Partial<Pose>,
    dialogueOptions?: StartDialogueOptions
) {
    const ovrMgr = cam.override(ovr);

    return {
        // todo: consider an "ease_then" the awaits the ease before starting
        start: async (mode: 'fade' | 'cut' | 'ease' = 'ease') => {
            if (dialogueOngoing()) return; // dialogue already active. Prevent double commit.
            if (mode == 'fade')
                await SceneFadeManager.fadeTransition(() => ovrMgr.commit('cut'));
            else ovrMgr.commit(mode);

            try {
                return await startDialogue(program, dialogueOptions);
            } finally {
                if (mode == 'fade')
                    await SceneFadeManager.fadeTransition(() => ovrMgr.release('cut'));
                else ovrMgr.release(mode)
            }
        },
        ovrMgr
    }
}