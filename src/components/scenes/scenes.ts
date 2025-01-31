import { Component, lazy } from "solid-js";

type SceneComponent = Component<{}>;

export type SceneRegistry = {
  [sceneName: string]: SceneComponent;
};

/**
 * Scene Registry for code splitting and dynamic import @ runtime
 */
export const scenes: SceneRegistry = { // Change any type to something proper later.
    DefaultScene: lazy(() => import("./DefaultScene")),
    AnotherScene: lazy(() => import("./AnotherScene")),
}