/**
 * Main scene dimensions in pixels.
 */
export const SCENE_DIMENSIONS = {
    width: 956,
    height: 692
}

/*
 * Technique 0: Screendoor. Needs no cutoff
 * Technique 1 typically requires a harsher cutoff. 1:1
 * Technique 2: quantize @2 - needs reasonable cutoff.
 */
export const DITHER_MODE: number = 2;
export const DITHER_LUMA_CUTOFF: number = 0.12

export const INITIAL_SCENE = "Porch"

export const FOV = 45;

export const DEFAULT_DIALOGUE_SENDER = "Arda";

export const DG_VER = "InDev-02.11"