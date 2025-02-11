import { Component, lazy } from "solid-js";
import Liminality from "./Liminality/Liminality";

type SceneComponent = Component<{}>;

export type SceneRegistry = {
  [sceneName: string]: SceneComponent;
};

/**
 * Scene Registry for code splitting and dynamic import @ runtime.
 * 
 * Every entry should follow the same syntax;
 * 
 * SceneName: lazy(() => import("path/to/scene")),
 */
export const scenes: SceneRegistry = { // Change any type to something proper later.
    DefaultScene: lazy(() => import("./DefaultScene/DefaultScene")),
    AnotherScene: lazy(() => import("./AnotherScene/AnotherScene")),
    ThirdScene: lazy(() => import("./ThirdScene/ThirdScene")),
    Sponza: lazy(() => import("./Sponza/Sponza")),
    Porch: lazy(() => import("./Porch/Porch")),
    Liminality: lazy(() => import("./Liminality/Liminality"))
}