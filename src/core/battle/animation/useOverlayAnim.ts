import { createSignal } from "solid-js";
import { OverlayAnimReq } from "./overlayAnim.types";
import { overlayAnimations } from "./animations.reg";

export const [overlayAnimRequests, setOverlayAnimRequests] = createSignal<OverlayAnimReq[]>([]);

export function requestOverlayAnimation(name: string, x: number, y: number) {
    if (!overlayAnimations[name]) {
      console.error(`Animation "${name}" not found`);
      return { onFinish: () => {} }; // Dummy for consistent typing.
    }

    let finishCallback: (() => void) | null = null;

    // Allows us to externally modify the finish callback.
    const rtnObject = {
        onFinish(cb: () => void) {
          finishCallback = cb;
        }
      };
  
    setOverlayAnimRequests((prev) => [
      ...prev,
      {
        name,
        position: [x, y],
        id: Math.random(),
        onFinish: () => finishCallback?.() // I just learned you can ?. with function calls kms.
      },
    ]);

    return rtnObject;
}