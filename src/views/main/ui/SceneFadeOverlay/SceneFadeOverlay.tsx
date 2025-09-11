
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

const SCENE_FADE_DELAY = 1500;

const [sceneFadeState, setSceneFadeState] = createSignal<SceneFadeState>(SceneFadeState.OFF);

const currentSceneFadeState = () => sceneFadeState();

async function fadeSceneOut() {
    // TODO/Note - this simple guard makes me nervous when it comes to resolving promises, 
    // come up with a generally better lock/queue system plz.
    if(sceneFadeState() != SceneFadeState.OFF) return;
    setSceneFadeState(SceneFadeState.FADING_OUT)
    await sleep(SCENE_FADE_DELAY);
    setSceneFadeState(SceneFadeState.FADED)
}

async function fadeSceneIn() {
    if(sceneFadeState() != SceneFadeState.FADED) return;
    await sleep(16); // Give CSS transition some time to end. Otherwise it snaps weird. 16 is a paint tick / frame.
    setSceneFadeState(SceneFadeState.FADING_IN);
    await sleep(SCENE_FADE_DELAY);
    setSceneFadeState(SceneFadeState.OFF)
}

// Simple helper to wrap some action around a scene fade.
// TODO: May have bugs if multiple calls to fadeTransitions are done rapidly. Consider adding a lock + warning
async function fadeTransition(action: () => any | (() => Promise<any>)) {
    await fadeSceneOut();
    try {
        await action();
    } finally {
        await fadeSceneIn();
    }
}

export const SceneFadeManager = {
    currentSceneFadeState, fadeSceneIn, fadeSceneOut, fadeTransition
}

// TODO/NOTE: It would be more robust to somehow listen for transitionend on the actual element, but
// im unsure how to get the ref up to the methods above nicely to do that.

export default function SceneFadeOverlay() {

    (window as any).fade = SceneFadeManager;

    return (
            <div 
                id="scene-fade-overlay"
                class={sceneFadeState()}
                // style={{transition: `background-color ${SCENE_FADE_DELAY}ms`}}
                style={{"animation-duration": `${SCENE_FADE_DELAY}ms`}}
            />
    )
}
