import slashnorm from '@/assets/artwork/battle_overlay_animations/slash/slash_norm.webm'
import slash_purpose from '@/assets/artwork/battle_overlay_animations/slash/slash_purp.webm'
import slash_mages from '@/assets/artwork/battle_overlay_animations/slash/slash_majes.webm'
import slash_elag from '@/assets/artwork/battle_overlay_animations/slash/slash_elag.webm'
import slash_repeat from '@/assets/artwork/battle_overlay_animations/slash/slash_repeat.webm'
import shield from '@/assets/artwork/battle_overlay_animations/opponent/shield_opp.webm'
import mirror from '@/assets/artwork/battle_overlay_animations/opponent/mirror.webm'
import requestAssetPrefetch from '@/shared/utils/reqPrefetch'
import { mapObject } from '@/shared/utils/mapObject'

export const overlayAnimationDefinitions = {
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
        width: 812,
        height: 651,
    },

    "slash_elag": {
        src: slash_elag,
        width: 594,
        height: 625,
    },

    "slash_repeat": {
        src: slash_repeat,
        width: 447,
        height: 417
    },

    "shield": {
        src: shield,
        width: 317,
        height: 344,
    },

    "mirror": {
        src: mirror,
        width: 500,
        height: 500
    }
}

export type availableOverlayAnimationNames = keyof typeof overlayAnimationDefinitions;

// Lazily just calling it here for now, we will want to be smart about it when we actually have dynamic resources.
requestAssetPrefetch(Object.values(overlayAnimationDefinitions).map(a => a.src));