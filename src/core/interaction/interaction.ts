import { createSignal } from "solid-js";
import { InteractionMode } from "./interactable.types";

export const [currentInteractionMode, setCurrentInteractionMode] = createSignal<InteractionMode>(InteractionMode.Interact);

export function cycleInteractionMode() {
    setCurrentInteractionMode(
        (currentInteractionMode() + 1) % 3
    )
}

function handleInteractionModeShortcut(ev: KeyboardEvent) {
    let kn = Number(ev.key) - 1;
    if(0 <= kn && kn <= 2) {
        setCurrentInteractionMode(kn);
    }
}

// Attach once on load;
document.addEventListener('keydown', handleInteractionModeShortcut);