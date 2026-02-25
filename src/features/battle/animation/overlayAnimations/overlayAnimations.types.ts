import { OverlayAnimationName } from "./overlayAnimationDefinitions";
import type { Property } from 'csstype';

/** 
 * Contains the data for an overlay animation, where an "overlay animation" is a short animation that
 * plays over the battle scene, such as a character's attack animation.
 */
export interface OverlayAnimData {
    src: string; // image url
    width: number;
    height: number;
    /** Blend mode (CSS blend). Default is "difference" */
    blendMode?: Property.MixBlendMode;
}

/** Request used internally to actually track the animation *requests* that we've called. */ 
export interface OverlayAnimReq {
    name: OverlayAnimationName;
    position: [number, number];
    id: string;
    onFinish: () => void;
}

/** Table containing OverlayAnimations' data by name. 
 * Name is the same name that is used to trigger this animation in a request. */
export type OverlayAnimationTable = {
    [name: string]: OverlayAnimData
}

/** Signature of requestOverlayAnimation. Placed here as this method is passed between several components. */
export type OverlayAnimationRequester = (name: OverlayAnimationName, position?: [number, number]) => Promise<void>