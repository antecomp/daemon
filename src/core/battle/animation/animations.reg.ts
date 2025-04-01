import slashnorm from '@/assets/animations/overlays/slash/slash_norm.webm'
import slash_purpose from '@/assets/animations/overlays/slash/slash_purp.webm'
import slash_mages from '@/assets/animations/overlays/slash/slash_majes.webm'
import slash_elag from '@/assets/animations/overlays/slash/slash_elag.webm'
import shield from '@/assets/animations/overlays/shield/shield_opp.webm'
import { overlayAnimationTable } from "./overlayAnim.types";

/** Registry of the available overlay animations. */
export const overlayAnimations: overlayAnimationTable = {
    "slash_norm": {
        src: slashnorm,
        width: 567,
        height: 593,
    },

    "slash_purpose": {
        src: slash_purpose,
        width: 739,
        height: 610,
    },

    "slash_majes": {
        src: slash_mages,
        width: 411,
        height: 497,
    },

    "slash_elag": {
        src: slash_elag,
        width: 594,
        height: 625,
    },

    "shield": {
        src: shield,
        width: 317,
        height: 344,
    }
}

export const overlayAnimationSrcMap = Object.fromEntries(
    Object.entries(overlayAnimations).map(([name, { src }]) => [name, src])
);
  