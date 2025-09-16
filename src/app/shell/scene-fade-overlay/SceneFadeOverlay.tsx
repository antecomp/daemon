
import { createSignal } from 'solid-js'
import './scene-fade-overlay.css'
import sleep from '@/shared/utils/sleep';

// Enum strings used for CSS classnames.
enum SceneFadeState {
    OFF = "", // Completely Off
    FADING_OUT = "ov-fading-out", // In animation between off and faded.
    FADED = "ov-faded", // Screen blacked out (end of anim, static state)
    FADING_IN = "ov-fading-in", // Anim from blacked out to off
}

/** Duration in milliseconds for the CSS-driven fade animation.*/
const SCENE_FADE_DELAY = 1500;

const [sceneFadeState, setSceneFadeState] = createSignal<SceneFadeState>(SceneFadeState.OFF);

/** (alias) Returns the current scene fade state used by the overlay. */
const currentSceneFadeState = () => sceneFadeState();

// Keep a ref to the overlay element so we can await its CSS animation/transition end.
let overlayEl: HTMLDivElement | null = null;

/**
 * Resolves after the overlay's current CSS transition/animation completes.
 * If the overlay element is not yet mounted, resolves on the next microtask.
 */
function waitForOverlayEnd(): Promise<void> {
    return new Promise((resolve) => {
        const el = overlayEl;
        if (!el) {
            // Fallback if ref not ready; resolve on next tick to avoid stalls.
            queueMicrotask(() => resolve());
            return;
        }
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            el.removeEventListener('transitionend', finish);
            el.removeEventListener('animationend', finish);
            resolve();
        };
        // Listen to both to support either CSS mechanism.
        el.addEventListener('transitionend', finish);
        el.addEventListener('animationend', finish);
    });
}

/* TODO - Stop early resolve in fadeSceneOut/In on incorrect stage, instead keep a universal promise that we can track and return
regardless of state. Alternatively consider rejecting to indicate the request is too early (error)
    Make fades single-flight: src/views/main/ui/SceneFadeOverlay/SceneFadeOverlay.tsx:51
    Keep let inFlight: Promise<void> | null per direction; return it if present; no early returns.
*/

async function fadeSceneOut() {
    // TODO/Note - this simple guard makes me nervous when it comes to resolving promises, 
    // come up with a generally better lock/queue system plz.
    if(sceneFadeState() != SceneFadeState.OFF) return;
    setSceneFadeState(SceneFadeState.FADING_OUT)
    await waitForOverlayEnd();
    setSceneFadeState(SceneFadeState.FADED)
}

async function fadeSceneIn() {
    // TODO/Note - this simple guard makes me nervous when it comes to resolving promises, 
    // come up with a generally better lock/queue system plz.
    if(sceneFadeState() != SceneFadeState.FADED) return;
    await sleep(16); // Give CSS transition some time to end. Otherwise it snaps weird. 16 is a paint tick / frame.
    setSceneFadeState(SceneFadeState.FADING_IN);
    await waitForOverlayEnd();
    setSceneFadeState(SceneFadeState.OFF)
}

// Simple helper to wrap some action around a scene fade.
// TODO: May have bugs if multiple calls to fadeTransitions are done rapidly. Consider adding a lock + warning
/**
 * Runs an action wrapped between a fade-out and a fade-in.
 * Ensures the screen is fully black while the action executes.
 * The `action` can be synchronous or async; any thrown error will propagate
 * after initiating the fade-in in a finally block.
 */
async function fadeTransition(action: () => any | (() => Promise<any>)) {
    await fadeSceneOut();
    try {
        await action();
    } finally {
        await fadeSceneIn();
    }
}

/**
 * Public API for controlling the scene fade overlay.
 */
export interface SceneFadeManagerAPI {
    /**
     * Gets the current fade state (OFF/FADING_OUT/FADED/FADING_IN).
     */
    currentSceneFadeState: () => SceneFadeState;
    /**
     * Fades the scene from FADED back to OFF (black screen back to scene). Resolves when complete.
     */
    fadeSceneIn: () => Promise<void>;
    /**
     * Fades the scene from OFF to FADED (scene visible to black screen). Resolves when complete.
     */
    fadeSceneOut: () => Promise<void>;
    /**
     * Runs (sync or async) `action` between a fade-out and a fade-in.
     */
    fadeTransition: (action: () => any | (() => Promise<any>)) => Promise<void>;
}

/**
 * Singleton instance used to trigger scene fade animations.
 */
export const SceneFadeManager: SceneFadeManagerAPI = {
    currentSceneFadeState,
    fadeSceneIn,
    fadeSceneOut,
    fadeTransition
}

/* (To be used by SceneContainer) */
export default function SceneFadeOverlay() {

   // (window as any).fade = SceneFadeManager;

    return (
            <div 
                id="scene-fade-overlay"
                ref={(el) => { overlayEl = el; }}
                class={sceneFadeState()}
                style={{"animation-duration": `${SCENE_FADE_DELAY}ms`}}
            />
    )
}
