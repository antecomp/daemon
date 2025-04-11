import { OPPONENT_MIMICRY } from "@/data/battles/mimicry";
import { startBattle } from "@/core/battle/battleManager";
import { createDialogueNode, createInlineDialogueTree } from "@/core/dialogue/dialogueNode";
import pickRandom from "@/utils/pickRandom";
import { BattleOutcome } from "@/core/battle/engine/battle.types";

const characters = Object.freeze({
    ARDA: "Arda",
    MAN: "The Stranger",
    VIYA: "Viya"
})

const root = createDialogueNode("Hey, welcome to daemon.garden.", characters.VIYA);

// After a question is asked we go...
//      Any more questions?
//          yes -> question loopback
//          no  -> end dialogue
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
            responseAsRenderOrNode: 
                // Build a short inline tree to add some dialogue nodes without having to save some root variable out-of-scope.
                createInlineDialogueTree("The dialogue system we're using right now is called Hermes", characters.VIYA, (root) => {
                    root.addMessageChain(["It was made in-house by omni", "and uses a lot of evil reference magic to chain messages together"])
                        .addChild(questionLoopIntermediary)
                })
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

questionLoopback.addTerminationOption("Trigger", "Do the test trigger for side effect", {sideEffect: () => alert("test")});
questionLoopback.addTerminationOption("Conditionally Rendered Option", "Another option I was too lazy to type out", {onlyShowWhen: () => true})
questionLoopback.addTerminationOption("Filtered option", "I should never see this", {onlyShowWhen: () => false})
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

// questions.addTerminationOption("battle please [END]", "No questions. Start a battle with the mimicry please", 
//     {sideEffect: async () => {await startBattle(OPPONENT_MIMICRY); alert("Battle result successfully awaited!")}});


let mimicryResult: BattleOutcome | null = null;
questions.addCAROptionChild(
    "Battle Please", "No questions, start a battle with the mimicry please.",
    createInlineDialogueTree("", "", (root) => {
        root.makeNodeWaitFor(async () => {
            mimicryResult = await startBattle(OPPONENT_MIMICRY);
        })
        .next = (() => {
            switch(mimicryResult) {
                case(BattleOutcome.Player):
                    return createDialogueNode("Wow, nice job. I'm impressed.", "Viya");
                case(BattleOutcome.Opponent):
                    return createDialogueNode("Damn you suck at this. How are you going to survive the fringenet?", "Viya");
                case(BattleOutcome.Draw):
                    return createDialogueNode("Close call! Things will only get harder from here...", "Viya");
                case(BattleOutcome.Eject):
                    const response = createDialogueNode("Coward.", "Viya");
                    const atLeast = response.addChild("If you're not going to fight, do you at least have some questions?")
                        atLeast.addCAROptionChild("Yes", "Sure.", questionLoopback);
                        atLeast.addTerminationOption("No [END]", "No fuck off");
                    return response;
                default:
                    return createDialogueNode("I'm not sure what the battle outcome is, something probably broke lol.", "Viya")
            }
        })
    })
)

export default root;