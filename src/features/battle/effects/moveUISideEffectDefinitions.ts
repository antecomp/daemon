import { playSound } from "@/shared/utils/playSound";
import { MoveUISideEffectMap } from "./moveUISideEffects";

import slash_sfx from '@/assets/sfx/battle/candle.wav';
import deflect_noise from '@/assets/sfx/battle/overwhelm.wav'
import sleep from "@/shared/utils/sleep";
import { AvailableOverlayAnimationNames } from "../animation/overlayAnimations/overlayAnimationDefinitions";

// For now I am just assuming every move has a single animation at a single slot.
// This could very easily change in the future (i.e needed slot changing based on what happened)
// So this is by no regards a permenant solution, just a simple one to get started.

export const PLAYER_MOVE_UI_EFFECTS: MoveUISideEffectMap = {
    attack: {
        place: 1,
        perform({requestOverlayAnimation}, {combatants, moveTags}) {
            // Forward up promise from this instead of making a new one with await.

            playSound(slash_sfx);

            if(combatants.player.getStatusLevel('mania') > 0) {
                return requestOverlayAnimation('slash_elag');
            } else if (moveTags.player.includes('repeated')) { 
                return requestOverlayAnimation('slash_repeat');
            } else {
                const preparedLevel = combatants.player.getStatusLevel('prepared');
                return requestOverlayAnimation((['slash_norm', 'slash_purpose', 'slash_majes'] satisfies AvailableOverlayAnimationNames[])[preparedLevel] ?? 'slash_majes');
            }
        } 
    }
}

export const OPPONENT_MOVE_UI_EFFECTS: MoveUISideEffectMap = {
    defend: {
        place: 1,
        async perform({requestOverlayAnimation}, {mults}) {
            if(mults.player.outgoing == 0) return; // noop
            await requestOverlayAnimation('shield');
        }
    },
    mirror: {
        place: 1,
        async perform({requestOverlayAnimation}, {mults}) {
            if(mults.opponent.outgoing == 0) return;
            sleep(500).then(() => playSound(deflect_noise))
            await requestOverlayAnimation('mirror');
        }
    }
}