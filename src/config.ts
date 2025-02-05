export const SCENE_DIMENSIONS = {
    width: 950,
    height: 675
}

export const DITHER_MODE: number = 1;
/**
 * Technique 0: Screendoor. Needs no cutoff
 * Technique 1 typically requires a harsher cutoff. 1:1
 * Technique 2: quantize @2 - needs reasonable cutoff.
 */
export const DITHER_LUMA_CUTOFF: number = 0.25;

export const FOV = 45;