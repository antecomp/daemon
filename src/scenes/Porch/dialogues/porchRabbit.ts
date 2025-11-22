import { createDialogueBuilder } from "@/core/dialogue/dialogueBuilder"
import { VISUALIZER } from "@/core/dialogue/dialogueNode";
import { DialogueService } from "@/core/dialogue/dialogueService";

const RABBIT = "The Rabbit"

const root = createDialogueBuilder("Hello Arda.", RABBIT);

root
    .addCar(
        "What are you?",
        'I am a rabbit, one of many...',
        monologue => monologue
            .chain(
                "We have roamed here for millennia,",
                "before the corporeal thoughts.",
                "We feasted upon the tears of angels.",
                "And now we are starving.",
            )
            .then("The rabbit pauses.", VISUALIZER)
            .then("We have taken an interest in your journey", RABBIT)
            .then("Tread safely, Asuramancer.")
            .then("The rabbit vanishes", VISUALIZER)
            .attachSideEffect(ctx => {
                DialogueService.setCurrentDialogueOverlay(null)
                ctx?.actions?.hideRabbit();
            })
    );

export default root.unwrap();