import { playSound } from "@/shared/utils/playSound";
import { MoveUISideEffectMap } from "./moveUISideEffects";

import slash_sfx from '@/assets/sfx/battle/candle.wav';
import deflect_noise from '@/assets/sfx/battle/overwhelm.wav'
import sleep from "@/shared/utils/sleep";
import { AvailableOverlayAnimationNames } from "../animation/overlayAnimations/overlayAnimationDefinitions";

export const PLAYER_MOVE_UI_EFFECTS: MoveUISideEffectMap = {
    attack: [{
        place: 1,
        run({requestOverlayAnimation}, {combatants, moveTags}) {
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
    }],

    // defend: [{
    //     place: 0,
    //     run() {
    //         return sleep(10000000); // force a longass block.
    //     }
    // }]
}

export const DEFAULT_OPPONENT_MOVE_UI_EFFECTS: MoveUISideEffectMap = {
    defend: [{
        place: 1,
        // Only show animation when we're deflecting some damage;
        when: ({damageMultipliers}) => damageMultipliers.player.outgoing > 0,
        async run({requestOverlayAnimation}) {
            await requestOverlayAnimation('shield');
        }
    }],
    mirror: [
        {
            place: 1,
            // Only show animation when we're deflecting some damage;
            when: ({damageMultipliers}) => damageMultipliers.player.outgoing > 0,            
            async run({requestOverlayAnimation}) {
                sleep(500).then(() => playSound(deflect_noise))
                await requestOverlayAnimation('mirror');
            }
        }
    ],
    observe: [
        {
            place: 0,
            async run({requestOverlayAnimation, appendActionMessage}) {
                await requestOverlayAnimation('observe');
                appendActionMessage('You feel watched.');
            }
        }
    ]
}