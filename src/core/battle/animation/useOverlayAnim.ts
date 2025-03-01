import { createSignal } from "solid-js";
import { OverlayAnimReq } from "./overlayAnim.types";
import { overlayAnimations } from "./animations.reg";

export const [overlayAnimRequests, setOverlayAnimRequests] = createSignal<OverlayAnimReq[]>([]);

export function requestOverlayAnimation(name: string, x: number, y: number) {
    if (!overlayAnimations[name]) {
      console.error(`Animation "${name}" not found`);
      return;
    }
  
    setOverlayAnimRequests((prev) => [
      ...prev,
      {
        name,
        position: [x, y],
        id: Math.random()
      },
    ]);
}