import slashnorm from '@/assets/artwork/battle_overlay_animations/slash/slash_norm.webm'
import slash_purpose from '@/assets/artwork/battle_overlay_animations/slash/slash_purp.webm'
import slash_mages from '@/assets/artwork/battle_overlay_animations/slash/slash_majes.webm'
import slash_elag from '@/assets/artwork/battle_overlay_animations/slash/slash_elag.webm'
import slash_repeat from '@/assets/artwork/battle_overlay_animations/slash/slash_repeat.webm'
import shield from '@/assets/artwork/battle_overlay_animations/opponent/shield_opp.webm'
import mirror from '@/assets/artwork/battle_overlay_animations/opponent/mirror.webm'
import observe from '@/assets/artwork/battle_overlay_animations/opponent/observe.webm';
import opp_attack from '@/assets/artwork/battle_overlay_animations/opponent/opp-attack-a.webm';
import overwhelm from '@/assets/artwork/battle_overlay_animations/player/overwhelm.webm'

import requestAssetPrefetch from '@/shared/utils/reqPrefetch'
import { OverlayAnimationTable } from './overlayAnimations.types'
import { SuggestedString } from '@/shared/types/misc.types'

/** Named overlay animations for battle that contain the `src` of the video, and a `width` and `height` for properly scaling the video element. */
export const COMMON_OVERLAY_ANIMATION_DEFINITIONS = {
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
        height: 500,
    },

    "observe": {
        src: observe,
        width: 618,
        height: 312,
        blendMode: 'normal'
    },

    'opp-attack': {
        src: opp_attack,
        width: 502,
        height: 524
    },

    'overwhelm': {
        src: overwhelm,
        width: 375,
        height: 375
    }
} satisfies OverlayAnimationTable

/** Helper type to constrain calls to requestOverlayAnimation to animation names known to exist. */
export type OverlayAnimationName = SuggestedString<keyof typeof COMMON_OVERLAY_ANIMATION_DEFINITIONS>;

// Lazily just calling it here for now, we will want to be smart about it when we actually have dynamic resources.
requestAssetPrefetch(Object.values(COMMON_OVERLAY_ANIMATION_DEFINITIONS).map(a => a.src));