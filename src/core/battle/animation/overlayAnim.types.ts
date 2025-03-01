

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

/** Used to actually trigger an animation in ui, name maps to animData to be played. */
export interface OverlayAnimReq {
    name: string;
    position: [number, number];
    id: number
}

export type overlayAnimationTable = Record<string, OverlayAnimData>;