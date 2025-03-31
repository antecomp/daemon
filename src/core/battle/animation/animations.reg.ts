import shit from '@/assets/animations/overlays/shit.png'
import slashnorm from '@/assets/animations/overlays/slash/slashnorm.png'
import slash_purpose_image from '@/assets/animations/overlays/slash/slash_purpose.png'
import slash_mages_image from '@/assets/animations/overlays/slash/slash_majes-min.png'
import slash_elag_image from '@/assets/animations/overlays/slash/slash_elag.png'
import shield_image from '@/assets/animations/overlays/shield/shield_opp1.png'
import { overlayAnimationTable } from "./overlayAnim.types";

/** Registry of the available overlay animations. */
export const overlayAnimations: overlayAnimationTable = {
    "sample": {
        src: shit,
        frameWidth: 50,
        frameHeight: 50,
        frameRate: 2,
        totalFrames: 5
    },

    "slash_norm": {
        src: slashnorm,
        frameWidth: 567,
        frameHeight: 593,
        frameRate: 60,
        totalFrames: 31
    },

    "slash_purpose": {
        src: slash_purpose_image,
        frameWidth: 739,
        frameHeight: 610,
        frameRate: 60,
        totalFrames: 31
    },

    "slash_majes": {
        src: slash_mages_image,
        frameWidth: 411,
        frameHeight: 497,
        frameRate: 60,
        totalFrames: 94
    },

    "slash_elag": {
        src: slash_elag_image,
        frameWidth: 594,
        frameHeight: 625,
        frameRate: 60,
        totalFrames: 31
    },

    "shield": {
        src: shield_image,
        frameWidth: 317,
        frameHeight: 344,
        totalFrames: 60,
        frameRate: 60
    }
}

export const overlayAnimationSrcMap = Object.fromEntries(
    Object.entries(overlayAnimations).map(([name, { src }]) => [name, src])
);
  