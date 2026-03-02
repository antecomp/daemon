import { createEffect, createSignal, onCleanup } from 'solid-js'
import './scene-fade-overlay.css'
import { ReleaseFn, sceneLock } from '../locks/UILockManager';
import attachToConsole from '@/devtools/attachToConsole';

// Enum strings mapped to CSS classnames.
enum SceneFadeState {
    OFF = "", // Completely Off
    FADING_OUT = "ov-fading-out", // In animation between off and faded.
    FADED = "ov-faded", // Screen blacked out (end of anim, static state)
    FADING_IN = "ov-fading-in", // Anim from blacked out to off
}

/** Duration in milliseconds for the CSS-driven fade animation.*/
const SCENE_FADE_DURATION = 1500;

const [currentSceneFadeState, setSceneFadeState] = createSignal<SceneFadeState>(SceneFadeState.OFF);

// Keep a ref to the overlay element so we can await its CSS animation/transition end.
let overlayEl: HTMLDivElement | null = null;

// Track if any transition is occuring
let inFlight: Promise<void> | null = null;

/** Ensures a fade animation is not already in progress. */
function assertIdle(label: string): void {
    if (inFlight) {
        throw new Error(
            `SceneFadeManager: ${label} called while a fade is already in progress. ` +
            `Await the current fade or use fadeTransition() instead.`
        );
    }
}

/**
 * Resolves after the overlay's current CSS transition/animation completes.
 * If the overlay element is not yet mounted, resolves on the next microtask.
 * Will also resolve after the expected scene duration + some extra time in case animationend fails to fire.
 */
function waitForOverlayEnd(): Promise<void> {
    return new Promise((resolve) => {
        const el = overlayEl;
        if (!el) {
            // Fallback if ref not ready: resolve on next tick to avoid stalls.
            queueMicrotask(resolve);
            return;
        }
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            el.removeEventListener('animationend', finish);
            el.removeEventListener('transitionend', finish);
            resolve();
        };

        el.addEventListener('animationend', finish);
        el.addEventListener('transitionend', finish);

        // Safety timeout - never stall forever.
        setTimeout(finish, SCENE_FADE_DURATION + 200);
    });
};

async function fadeSceneOut(): Promise<void> {
    assertIdle('fadeSceneOut');

    if (currentSceneFadeState() !== SceneFadeState.OFF) {
        throw new Error(
            `fadeSceneOut: expected state OFF, got ${currentSceneFadeState()}`
        );
    }

    inFlight = (async () => {
        setSceneFadeState(SceneFadeState.FADING_OUT);
        await waitForOverlayEnd();
        setSceneFadeState(SceneFadeState.FADED);
    })();

    try {
        await inFlight;
    } finally {
        inFlight = null;
    }
}

async function fadeSceneIn(): Promise<void> {
    assertIdle('fadeSceneIn');

    if (currentSceneFadeState() !== SceneFadeState.FADED) {
        throw new Error(
            `fadeSceneIn: expected state FADED, got ${currentSceneFadeState()}`
        );
    }

    inFlight = (async () => {
        // Two rAFs: first commits the FADED state to the render pipeline,
        // second ensures the FADING_IN animation has a clean starting frame.
        await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        setSceneFadeState(SceneFadeState.FADING_IN);
        await waitForOverlayEnd();
        setSceneFadeState(SceneFadeState.OFF);
    })();

    try {
        await inFlight;
    } finally {
        inFlight = null;
    }
}

async function fadeTransition(action: () => any | (() => Promise<any>)): Promise<void> {
    await fadeSceneOut();
    try {
        await action();
    } finally {
        await fadeSceneIn();
    }
}

export const SceneFadeManager = {
    /**
    * Gets the current fade state (OFF/FADING_OUT/FADED/FADING_IN).
    */
    currentSceneFadeState,
    /**
     * Fades the scene from FADED back to OFF (black screen back to scene). Resolves when complete.
     */
    fadeSceneIn,
    /**
     * Fades the scene from OFF to FADED (scene visible to black screen). Resolves when complete.
     */
    fadeSceneOut,
    /**
     * Runs (sync or async) `action` between a fade-out and a fade-in.
     */
    fadeTransition
}

/* (To be used by SceneContainer) */
export default function SceneFadeOverlay() {

    let releaseLock: ReleaseFn | undefined;

    createEffect(() => {
        const state = currentSceneFadeState();
        const shouldLock = state != SceneFadeState.OFF;

        if (shouldLock) {
            if (!releaseLock) releaseLock = sceneLock.acquire();
        } else if (releaseLock) {
            releaseLock();
            releaseLock = undefined;
        }
    });

    onCleanup(() => {
        releaseLock?.();
        releaseLock = undefined;
    });

    attachToConsole(SceneFadeManager, "DG_SCENE_FADE");

    return (
        <div
            id="scene-fade-overlay"
            ref={(el) => { overlayEl = el; }}
            class={currentSceneFadeState()}
            style={{ "animation-duration": `${SCENE_FADE_DURATION}ms` }}
        />
    )
}