import { ClashMap } from "./clashMapper";

export const PLAYER_CLASH_REACTIONS: ClashMap = {
    attack: {
        _({requestOverlayAnimation}) {
            requestOverlayAnimation('slash_norm');
        }
    }
}

export const OPPONENT_CLASH_REACTIONS: ClashMap = {
    defend: {
        async _({requestOverlayAnimation}) {
            await requestOverlayAnimation('shield');
        }
    }
}