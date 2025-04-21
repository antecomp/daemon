import { lazy } from "solid-js";

export const loadScene = (name: string) => lazy(() => import(`./${name}/${name}.tsx`));