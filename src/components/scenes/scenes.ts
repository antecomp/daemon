import { lazy } from "solid-js";

/**
 * Scene Registry for code splitting and dynamic import @ runtime
 */
export const scenes: {[name: string]: any} = { // Change any type to something proper later.
    DefaultScene: lazy(() => import("./DefaultScene")),
    AnotherScene: lazy(() => import("./AnotherScene")),
}