import { DialogueService } from "@/core/dialogue/dialogueManager";
import { Show } from "solid-js";
import Hermes from "./Hermes";

export default function HermesOverlay() {
    return (
        <Show when={DialogueService.activeDialogue()}>
            <Hermes root={DialogueService.activeDialogue()!}/>
        </Show>
    )
}