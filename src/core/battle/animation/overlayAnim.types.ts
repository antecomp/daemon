

/** 
 * Contains the data for an overlay animation, where an "overlay animation" is a short animation that
 * plays over the battle scene, such as a character's attack animation.
 */
export interface OverlayAnimData {
    src: string; // image url
    frameWidth: number;
    frameHeight: number;
    frameRate: number;
    totalFrames: number;
    // Should we add stuff like "position" here?
}

/** Request used internally to actually track the animation *requests* that we've called. */ 
export interface OverlayAnimReq {
    name: string;
    position: [number, number];
    id: number
    onFinish: () => void;
}

export type overlayAnimationTable = Record<string, OverlayAnimData>;