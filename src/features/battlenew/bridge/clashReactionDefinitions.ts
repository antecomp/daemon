import { ClashMap } from "./clashMapper";

export const STOCK_CLASH_REACTIONS: ClashMap = {
    attack: {
        _({requestOverlayAnimation}) {
            requestOverlayAnimation('slash_norm');
        }
    }
}