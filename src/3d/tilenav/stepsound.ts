import pickRandom from "@/shared/utils/pickRandom";
import { StepSFXCategory } from "./tilenav.types";
import { playSoundOnce } from "@/shared/utils/playSound";

// TODO: Switch off eager true to utilize lazy load. This is way too much loaded for no reason.
const carpet = Object.values(import.meta.glob<string>('@/assets/sfx/steps/carpet/*', {eager: true, query: '?url', import: 'default'}));
const dirt = Object.values(import.meta.glob<string>('@/assets/sfx/steps/dirt/*', {eager: true, query: '?url', import: 'default'}));
const floor = Object.values(import.meta.glob<string>('@/assets/sfx/steps/floor/*', {eager: true, query: '?url', import: 'default'}));
const gravel = Object.values(import.meta.glob<string>('@/assets/sfx/steps/gravel/*', {eager: true, query: '?url', import: 'default'}));
const snow = Object.values(import.meta.glob<string>('@/assets/sfx/steps/snow/*', {eager: true, query: '?url', import: 'default'}));
const tiles = Object.values(import.meta.glob<string>('@/assets/sfx/steps/tiles/*', {eager: true, query: '?url', import: 'default'}));
const water = Object.values(import.meta.glob<string>('@/assets/sfx/steps/water/*', {eager: true, query: '?url', import: 'default'}));
const wood = Object.values(import.meta.glob<string>('@/assets/sfx/steps/wood/*', {eager: true, query: '?url', import: 'default'}));

const stepSounds = {
    carpet, dirt, floor, gravel, snow, tiles, water, wood
} as const satisfies Record<StepSFXCategory, unknown[]>

export default function playStepSound(category: StepSFXCategory) {
    const sfx = pickRandom(stepSounds[category]);
    playSoundOnce(sfx);
}
