import { createSignal } from "solid-js";
import { OverlayAnimReq } from "./overlayAnimations.types";
import { OverlayAnimationName } from "./overlayAnimationDefinitions";
import { nanoid } from "nanoid";
import attachToConsole from "@/devtools/attachToConsole";

/**
 * Generates a internally-tracked queue of requested overlay animations for a battle.
 * @returns a signal containing the currently queued overlayAnimationRequests (to be used by OverlayAnimator.tsx)
 * and a method for requesting a new overlay animaton.
 */
export function createOverlayAnimationQueue() {
    const [overlayAnimRequests, setOverlayAnimRequests] = createSignal<OverlayAnimReq[]>([]);

    function requestOverlayAnimation(name: OverlayAnimationName, position: [number, number] = [0,0]): Promise<void> {

        return new Promise<void>(resolve => {
            const id = nanoid();

            const finishedHandler = () => {
                setOverlayAnimRequests(prev => prev.filter(anim => anim.id !== id));
                resolve();
            }

            setOverlayAnimRequests(prev => [...prev, {name, position, id, onFinish: finishedHandler}])
        });
    }

    attachToConsole(requestOverlayAnimation, 'OVERLAY_ANIM_TEST');

    return {requestOverlayAnimation, overlayAnimRequests}
}