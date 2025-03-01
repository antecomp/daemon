import shit from '@/assets/animations/overlays/shit.png'
import slashnorm from '@/assets/animations/overlays/slash/slashnorm.png'
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
    }
}