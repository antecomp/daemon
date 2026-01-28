import pickRandom from "@/shared/utils/pickRandom";
import { StepSFXCategory } from "./tilenav.types";
import { playSound } from "@/shared/utils/playSound";

// TODO: Switch off eager true to utilize lazy load. This is way too much loaded for no reason.
const carpet = Object.values(import.meta.glob('@/assets/sfx/steps/carpet/*', {eager: true, as: 'url'}));
const dirt = Object.values(import.meta.glob('@/assets/sfx/steps/dirt/*', {eager: true, as: 'url'}));
const floor = Object.values(import.meta.glob('@/assets/sfx/steps/floor/*', {eager: true, as: 'url'}));
const gravel = Object.values(import.meta.glob('@/assets/sfx/steps/gravel/*', {eager: true, as: 'url'}));
const snow = Object.values(import.meta.glob('@/assets/sfx/steps/snow/*', {eager: true, as: 'url'}));
const tiles = Object.values(import.meta.glob('@/assets/sfx/steps/tiles/*', {eager: true, as: 'url'}));
const water = Object.values(import.meta.glob('@/assets/sfx/steps/water/*', {eager: true, as: 'url'}));
const wood = Object.values(import.meta.glob('@/assets/sfx/steps/wood/*', {eager: true, as: 'url'}));

const stepSounds = {
    carpet, dirt, floor, gravel, snow, tiles, water, wood
} as const satisfies Record<StepSFXCategory, unknown[]>

export default function playStepSound(category: StepSFXCategory) {
    const sfx = pickRandom(stepSounds[category]);
    playSound(sfx);
}