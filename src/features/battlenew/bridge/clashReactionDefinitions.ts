import { playSound } from "@/shared/utils/playSound";
import { ClashMap } from "./clashMapper";

import candle_sfx from '@/assets/sfx/battle/candle.wav'
import { MIN_CLASH_DURATION } from "./timings.config";
import sleep from "@/shared/utils/sleep";

export const PLAYER_CLASH_REACTIONS: ClashMap = {
    attack: {
        async _({requestOverlayAnimation}) {
            playSound(candle_sfx);
            await requestOverlayAnimation('slash_norm');
        }
    }
}

export const OPPONENT_CLASH_REACTIONS: ClashMap = {
    defend: {
        async _({requestOverlayAnimation}, mults){
            // If no damage is coming at us, don't show the shield animation.
            if(mults.player.outgoing == 0) return sleep(MIN_CLASH_DURATION); 
            await requestOverlayAnimation('shield');
        }
    }
}