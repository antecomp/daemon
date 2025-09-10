
import { createSignal } from 'solid-js'
import './scene-fade-overlay.css'
import sleep from '@/utils/sleep';

// String enum keeps OFF falsey and maps cleanly to class names.
export enum SceneFadeState {
    OFF = "", // Completely Off
    FADING_OUT = "ov-fading-out", // In animation between off and faded.
    FADED = "ov-faded", // Screen blacked out (end of anim, static state)
    FADING_IN = "ov-fading-in", // Anim from blacked out to off
}

const SCENE_FADE_DELAY = 1000;

const [sceneFadeState, setSceneFadeState] = createSignal<SceneFadeState>(SceneFadeState.OFF);

const currentSceneFadeState = () => sceneFadeState();

async function fadeSceneOut() {
    if(sceneFadeState() != SceneFadeState.OFF) return;
    setSceneFadeState(SceneFadeState.FADING_OUT)
    await sleep(SCENE_FADE_DELAY);
    setSceneFadeState(SceneFadeState.FADED)
}

async function fadeSceneIn() {
    if(sceneFadeState() != SceneFadeState.FADED) return;
    setSceneFadeState(SceneFadeState.FADING_IN);
    await sleep(SCENE_FADE_DELAY);
    setSceneFadeState(SceneFadeState.OFF)
}

// Simple helper to wrap some action around a scene fade.
async function fadeTransition(action: () => any | (() => Promise<any>)) {
    await fadeSceneOut();
    await action();
    await fadeSceneIn();
}

export const SceneFadeManager = {
    currentSceneFadeState, fadeSceneIn, fadeSceneOut, fadeTransition
    // Helper to fade, sleep, fade?
}

export default function SceneFadeOverlay() {

    (window as any).testfade = SceneFadeManager;

    return (
            <div 
                id="scene-fade-overlay"
                class={sceneFadeState()}
                style={{transition: `background-color ${SCENE_FADE_DELAY}ms`}}
            />
    )
}
