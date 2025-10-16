import { ClashReactionMap } from "./clashReaction";

// For now I am just assuming every move has a single animation at a single slot.
// This could very easily change in the future (i.e needed slot changing based on what happened)
// So this is by no regards a permenant solution, just a simple one to get started.

export const PLAYER_CLASH_REACTIONS: ClashReactionMap = {
    attack: {
        place: 1,
        perform({requestOverlayAnimation}) {
            // Forward up promise from this instead of making a new one with await.

            // playSound
            // branch this based on attack context
            return requestOverlayAnimation('slash_norm');
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
    }
}