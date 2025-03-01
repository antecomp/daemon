import { createSignal } from "solid-js";
import { OverlayAnimReq } from "./overlayAnim.types";
import { overlayAnimations } from "./animations.reg";

export const [overlayAnimRequests, setOverlayAnimRequests] = createSignal<OverlayAnimReq[]>([]);

export function requestOverlayAnimation(name: string, position: [number, number]): Promise<void> {
    if (!overlayAnimations[name]) {
      console.error(`Animation "${name}" not found`);
      return Promise.reject();
    }

    return new Promise<void>((resolve) => {
      const id = Math.random();

      const finishedHandler = () => {
        setTimeout(() => {setOverlayAnimRequests((prev) => prev.filter(anim => anim.id !== id))}, 10);
        
        resolve();
      };

      setOverlayAnimRequests((prev) => [...prev, {name, position, id, onFinish: finishedHandler}])
    })
}