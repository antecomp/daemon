import { createSignal } from "solid-js";
import { OverlayAnimReq } from "./overlayAnim.types";
import { overlayAnimations } from "./animations.reg";

export const [overlayAnimRequests, setOverlayAnimRequests] = createSignal<OverlayAnimReq[]>([]);

/**
 * An asynchronous call to play a named overlay in animation, used for things like playing the attack swipe over opponent.
 * @param name Name of the animation, reference animations.reg.ts (system may change if we want to localize animations)
 * @param position [top,left] offset to position overlay sprite
 * @returns Promise that resolves when the sprite animation is complete (frameRate * totalFrames)
 */
export function requestOverlayAnimation(name: string, position: [number, number]): Promise<void> {
    if (!overlayAnimations[name]) {
      throw new Error(`Animation "${name}" not found`);
    }

    return new Promise<void>((resolve) => {
      const id = Math.random(); // Lazy approach for now who cares.

      const finishedHandler = () => {
        setOverlayAnimRequests((prev) => prev.filter(anim => anim.id !== id));
        resolve();
      };

      setOverlayAnimRequests((prev) => [...prev, {name, position, id, onFinish: finishedHandler}])
    })
}