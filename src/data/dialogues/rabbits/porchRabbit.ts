import { DialogueNode } from "@/core/dialogue/dialogueNode.types"
import { createDialogueNode } from "@/core/dialogue/dialogueNode"
import { DialogueService } from "@/core/dialogue/dialogueManager";
import rabbit_overlay from "@/assets/artwork/dialogue_bgs/rabbit_overlay.png"
import { setShowRabbit } from "@/scenes/Porch/Porch";

const RABBIT = "The Rabbit"

const root = createDialogueNode("Hello. Arda.", RABBIT);

const rabbitMonologue = createDialogueNode("I am a rabbit, one of many...", RABBIT)
    .attachSideEffect(() => DialogueService.setCurrentDialogueOverlay(rabbit_overlay))

rabbitMonologue.addMessageChain([
    "We have roamed here for millennia,",
    "before the corporeal thoughts.",
    "We feasted upon the tears of angels.",
    "And now we are starving.",
    {render: "The rabbit pauses.", name: "VISUALIZER"},
    {render: "We have taken an interest in your journey", name: RABBIT},
    "Tread safely, Asuramancer.",
    {render: "The rabbit vanishes.", name: "VISUALIZER"},
]).attachSideEffect(
    () => {
        DialogueService.setCurrentDialogueOverlay(null) // Remove overlay early...
        setShowRabbit(false);
    }
)

root.addCAROptions([
    {
        summaryText: "What are you?",
        fullText: "What are you?",
        responseAsRenderOrNode: rabbitMonologue
    },
    {
        summaryText: "Hello",
        fullText: "Hello Rabbit",
        responseAsRenderOrNode: "Goodbye Asuramancer."
    }
])



export default root;