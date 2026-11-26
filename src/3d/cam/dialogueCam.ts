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
        start: async (mode: 'fade' | 'cut' | 'ease' | 'ease_then' = 'ease') => {
            if (dialogueOngoing()) return; // dialogue already active. Prevent double commit.
            const transition = mode === 'cut' ? 'cut' : 'ease';
            if (mode == 'fade')
                await SceneFadeManager.fadeTransition(() => ovrMgr.commit('cut'));
            else {
                const arrival = ovrMgr.commit(transition);
                if (mode === 'ease_then') await arrival;
            }

            try {
                return await startDialogue(program, dialogueOptions);
            } finally {
                if (mode == 'fade')
                    await SceneFadeManager.fadeTransition(() => ovrMgr.release('cut'));
                else ovrMgr.release(transition)
            }
        },
        ovrMgr
    }
}
