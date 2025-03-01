import shit from '@/assets/animations/overlays/shit.png'
import { overlayAnimationTable } from "./overlayAnim.types";

/** Registry of the available overlay animations. */
export const overlayAnimations: overlayAnimationTable = {
    "sample": {
        src: shit,
        frameWidth: 50,
        frameHeight: 50,
        frameRate: 2,
        totalFrames: 5
    }
}