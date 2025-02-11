import { DialogueService } from "@/core/dialogue/dialogueManager";
import { Show } from "solid-js";
import Hermes from "./Hermes";

/**
 * Simple container to conditionally render Hermes based on if there's dialogue or not. Used by Main.tsx
 */
export default function HermesOverlay() {
    return (
        <Show when={DialogueService.activeDialogue()}>
            <Hermes root={DialogueService.activeDialogue()!}/>
            {/* Scene Overlay Does in SceneContainer since it has access to the element (and sizing) already... */}
        </Show>
    )
}