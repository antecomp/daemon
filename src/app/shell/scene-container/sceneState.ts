import { INITIAL_SCENE } from "@/config/init.config";
import { AssetURL } from "@/shared/types/misc.types";
import { createSignal } from "solid-js";
import type { Accessor, Setter } from "solid-js";

type SceneState = {
    currentScene: Accessor<string>;
    setCurrentScene: Setter<string>;
    hoverCursor: Accessor<AssetURL | undefined>;
    setHoverCursor: Setter<AssetURL | undefined>;
    consoleAttached: boolean;
};

const SCENE_STATE_KEY = "__daemon_scene_state__";

const globalWithSceneState = globalThis as typeof globalThis & {
    [SCENE_STATE_KEY]?: SceneState;
};

if (!globalWithSceneState[SCENE_STATE_KEY]) {
    const [currentScene, setCurrentScene] = createSignal(INITIAL_SCENE);
    const [hoverCursor, setHoverCursor] = createSignal<AssetURL>();

    globalWithSceneState[SCENE_STATE_KEY] = {
        currentScene,
        setCurrentScene,
        hoverCursor,
        setHoverCursor,
        consoleAttached: false,
    };
}

const sceneState = globalWithSceneState[SCENE_STATE_KEY]!;

export const currentScene = sceneState.currentScene;
export const setCurrentScene = sceneState.setCurrentScene;
export const hoverCursor = sceneState.hoverCursor;
export const setHoverCursor = sceneState.setHoverCursor;

export const isSceneConsoleAttached = () => sceneState.consoleAttached;
export const markSceneConsoleAttached = () => {
    sceneState.consoleAttached = true;
};
