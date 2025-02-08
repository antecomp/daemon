import { createDialogueNode, DialogueNode } from "@/core/dialogueNode";

// Change body of this function to verify integrity of your dialogue.
export default function generateDialogue(): DialogueNode {
    const root = createDialogueNode("Hello, this is a test dialogue!", "NPC");

    const branchA = root.addMessageChain([
        "Lets start by visualizing a simple message chain",
        "One message after another",
        {name: "Another Guy", render: "Sometimes with a different speaker"}
    ])
    .addChild("Now let's have a choice...")

    const returnPoint = createDialogueNode("Maybe both choices unify back to some point. We can attach this in multiple places!")

    branchA.addCAROptionChild("choice 1", "I pick choice one", "You picked choice one...", "you", "NPC")
        .addChild("We can continue a message chain based on that choice!")
        .addChild(returnPoint)

    branchA.addCAROptionChild("choice 2", "I pick choice 2", "You picked choice 2!", "you", "NPC")
        .addChild("Similarly this will create it's own unique message chain")
        .addChild(() => "maybe this chain has a secret cool function that does stuff!")
        .addChild(returnPoint)

    

    return root;
}