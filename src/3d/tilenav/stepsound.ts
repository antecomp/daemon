import pickRandom from "@/shared/utils/pickRandom";
import { StepSFXCategory } from "./tilenav.types";
import { playSoundOnce } from "@/shared/utils/playSound";

type StepSFXLoader = () => Promise<string>;

const carpet = Object.values(import.meta.glob<string>('@/assets/sfx/steps/carpet/*', {query: '?url', import: 'default'}));
const dirt = Object.values(import.meta.glob<string>('@/assets/sfx/steps/dirt/*', {query: '?url', import: 'default'}));
const floor = Object.values(import.meta.glob<string>('@/assets/sfx/steps/floor/*', {query: '?url', import: 'default'}));
const gravel = Object.values(import.meta.glob<string>('@/assets/sfx/steps/gravel/*', {query: '?url', import: 'default'}));
const snow = Object.values(import.meta.glob<string>('@/assets/sfx/steps/snow/*', {query: '?url', import: 'default'}));
const tiles = Object.values(import.meta.glob<string>('@/assets/sfx/steps/tiles/*', {query: '?url', import: 'default'}));
const water = Object.values(import.meta.glob<string>('@/assets/sfx/steps/water/*', {query: '?url', import: 'default'}));
const wood = Object.values(import.meta.glob<string>('@/assets/sfx/steps/wood/*', {query: '?url', import: 'default'}));

const stepSounds = {
    carpet, dirt, floor, gravel, snow, tiles, water, wood
} as const satisfies Record<StepSFXCategory, StepSFXLoader[]>

export default function playStepSound(category: StepSFXCategory) {
    const sfxLoader = pickRandom(stepSounds[category]);
    void sfxLoader().then((sfx) => playSoundOnce(sfx));
}
