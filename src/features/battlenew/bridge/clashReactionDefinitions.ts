import { playSound } from "@/shared/utils/playSound";
import { ClashMap } from "./clashMapper";

import candle_sfx from '@/assets/sfx/battle/candle.wav'

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
        // you can also just return the promise of reqOverlayAnimation (instead of awaiting it yourself. Same outcome.)
        _: ({requestOverlayAnimation}) => requestOverlayAnimation('shield')
    }
}