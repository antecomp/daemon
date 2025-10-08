import slashnorm from '@/features/battle/assets/overlay-animations/slash/slash_norm.webm'
import slash_purpose from '@/features/battle/assets/overlay-animations/slash/slash_purp.webm'
import slash_mages from '@/features/battle/assets/overlay-animations/slash/slash_majes.webm'
import slash_elag from '@/features/battle/assets/overlay-animations/slash/slash_elag.webm'
import shield from '@/features/battle/assets/overlay-animations/shield/shield_opp.webm'
import { overlayAnimationTable } from "../../../core/battle/animation/overlayAnim.types";
import requestAssetPrefetch from '@/shared/utils/reqPrefetch'

export const overlayAnimationDefinitions: overlayAnimationTable = {
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
    Object.entries(overlayAnimationDefinitions).map(([name, { src }]) => [name, src])
);
  

// Lazily just calling it here for now, we will want to be smart about it when we actually have dynamic resources.
requestAssetPrefetch([slashnorm, slash_purpose, slash_mages, slash_elag, shield]);