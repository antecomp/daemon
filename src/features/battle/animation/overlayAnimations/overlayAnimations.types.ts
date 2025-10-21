import { availableOverlayAnimationNames } from "./overlayAnimationDefinitions";

/** 
 * Contains the data for an overlay animation, where an "overlay animation" is a short animation that
 * plays over the battle scene, such as a character's attack animation.
 */
export interface OverlayAnimData {
    src: string; // image url
    width: number;
    height: number;
}

/** Request used internally to actually track the animation *requests* that we've called. */ 
export interface OverlayAnimReq {
    name: availableOverlayAnimationNames;
    position: [number, number];
    id: string
    onFinish: () => void;
}

export type OverlayAnimationRequester = (name: availableOverlayAnimationNames, position?: [number, number]) => Promise<void>