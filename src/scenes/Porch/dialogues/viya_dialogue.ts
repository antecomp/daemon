import { createDialogueNode } from "@/core/dialogue/dialogueNode";
import pickRandom from "@/util/pickRandom";

const characters = Object.freeze({
    ARDA: "Arda",
    MAN: "The Stranger",
    VIYA: "Viya"
})

const root = createDialogueNode("Hey, welcome to daemon.garden.", characters.VIYA);

const questionLoopback = createDialogueNode(() => pickRandom(["Go for it.", "I'll try my best.", "Alright."]), characters.VIYA);
const questionLoopIntermediary = createDialogueNode("Any more questions?", characters.VIYA)
questionLoopIntermediary.addCAROptionChild("Yes", "Yes", questionLoopback)
questionLoopIntermediary.addTerminationOption("Nah [END DIALOGUE]", "Nah")

const questions = root.addChild("I imagine you have a lot of questions right now");
questions.addCAROptionChild("Yes", "Yeah I do.", questionLoopback);
questions.addTerminationOption("No [END CONVERSATION]", "Nah not really.")

const whatFork = questionLoopback.addChildAsOption("What...", "What...", "") // Just use empty string options like this to chain.
    const whatGame = whatFork.addCAROptionChild("Game?", "What is this game?", "daemon.garden is a point and click RPG created by omni.vi", characters.ARDA, characters.VIYA);
    whatGame.addMessageChain(["Episode 0 takes place in the year 2095.", "Long after the mysterious 'VI-LINK' device has become widespread."])
        .addCAROptions([
            {
                summaryText: "VI-LINK?",
                fullText: "What is a VI-LINK?",
                responseAsRenderOrNode: "The VI-LINK is a neural-interface that allows users to connect to NULLSPACE"
            },
            {
                summaryText: "Cool",
                fullText: "Cool.",
                responseAsRenderOrNode: "Yeah :)"
            },
            {
                summaryText: "Lame",
                fullText: "Sounds boring and LARP-ey",
                responseAsRenderOrNode: "Okay buddy."
            }
        ])
        .forEach(optionResult => optionResult.next = questionLoopIntermediary) // BEware that forEach-es return void. They have no reasonable way to attach to results (obviously)
whatFork.addCAROptionChild("This?", "What is this?", "This as in...?", characters.ARDA, characters.VIYA)
    .addCAROptions([
        {
            summaryText: "Game",
            fullText: "This game.",
            responseAsRenderOrNode: whatGame // Point back to an existing node!
        },
        {
            summaryText: "Dialogue",
            fullText: "This dialogue system",
            // You can be as fucking evil as you want :)
            responseAsRenderOrNode: (() => {
                // Generate a small tree inside an IIFE, return the root of it to attach without having to save intermediary :D
                const rtn = createDialogueNode("The dialogue system we're using right now is called Hermes", characters.VIYA)
                rtn.addMessageChain(["It was made in-house by omni", "and uses a lot of evil reference magic to chain messages together"])
                    .addChild(questionLoopIntermediary)
                return rtn;
            })()
        }
    ])

const whyFork = questionLoopback.addChildAsOption("Why...", "Why...", "")
whyFork.addCAROptions([
    {
        summaryText: "Game Style",
        fullText: "Why does the game look like this?",
        responseAsRenderOrNode: "Because it's cool. What kind of question is that?"
    }
])

questionLoopback.addTerminationOption("Option 3", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option 4", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option 5", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")
questionLoopback.addTerminationOption("Option X", "Another option I was too lazy to type out")

export default root;