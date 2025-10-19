import { playSound } from "@/shared/utils/playSound";
import { ClashReactionMap } from "./clashReaction";

import slash_sfx from '@/assets/sfx/battle/candle.wav';
import deflect_noise from '@/assets/sfx/battle/overwhelm.wav'
import sleep from "@/shared/utils/sleep";

// For now I am just assuming every move has a single animation at a single slot.
// This could very easily change in the future (i.e needed slot changing based on what happened)
// So this is by no regards a permenant solution, just a simple one to get started.

export const PLAYER_CLASH_REACTIONS: ClashReactionMap = {
    attack: {
        place: 1,
        perform({requestOverlayAnimation}, {combatants}) {
            // Forward up promise from this instead of making a new one with await.

            playSound(slash_sfx);

            if(combatants.player.getStatusLevel('mania') > 0) {
                return requestOverlayAnimation('slash_elag');
            } else {
                const preparedLevel = combatants.player.getStatusLevel('prepared');
                return requestOverlayAnimation(['slash_norm', 'slash_purpose', 'slash_majes'][preparedLevel] ?? 'slash_majes');
            }
        } 
    },

    // Might have to do some exception/hack for repeat, I am unsure.
    repeat: {
        place: 1, // Can't easily emulate place of previous clash...
        async perform({requestOverlayAnimation}, {plannedSequences, moveIndex}) {
            // How should I do this? Maybe do a different animation?
            // Could be based on mults, two different repeat animations, one for doing damage and one for passive stuff?
            if(plannedSequences.player[moveIndex - 1].name == 'attack') {
                playSound(slash_sfx);
                await requestOverlayAnimation('slash_repeat')
            }
        }
    }
}

export const OPPONENT_CLASH_REACTIONS: ClashReactionMap = {
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