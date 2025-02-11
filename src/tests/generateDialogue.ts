import { createDialogueNode } from "@/core/dialogue/dialogueNode";

// You can make local enums to track the people talking
// This is soley a helper to keep spelling/format consistent.
const characters = Object.freeze({
    ARDA: "Arda",
    MAN: "The Stranger",
    VIYA: "Viya"
})

// Make whatever tree you wwant and export the root of it to test in DialogueVisualizer (http://localhost:5173/dialogue.html)
const root = createDialogueNode(
    `
        A man finally sits down at the table across from me. He's bald, wearing a suit and a large pair of sunglasses. 
    `,
    "VISUALIZER"
)

const resumePoint = createDialogueNode("he leans forward", "VISUALIZER");

const richDadFork = root
    .addChild(
        `I always thought sunglasses in NS were a stupid decision, the ambient light here is barely a half moon on the best of days.`,
    )
    .addChild(
        `I can see his eyes dart and glimmer briefly behind his sunglasses - likely verifying my VLID.`,
    )
    .addChild(
        `He quickly looks around before focusing on me again.`,
    )
    .addBackAndFourthChain([
        "What model VI-LINK you have?",
        "Why does it matter?",
        "Because a difference in a model number is a difference in whether your brain melts or not",
        "XA-3",
        "Damn, fancy for someone like you. You doing this to rebel against your rich daddy?",
    ], characters.MAN, characters.ARDA)
    
richDadFork.addCAROptionChild(
    "Not your business", "None of your fucking business",
    "Like hell it isn't my business, I'm here to make sure you don't eject and dob immediately.",
    characters.ARDA,
    characters.MAN
)
    .addMessageChain([
        "I got what I needed to know from that response though.",
        "Hold on to that angst kid, it'll keep you going",
        { name: characters.ARDA, render: "..." }
    ])
    .addChild(resumePoint);

richDadFork.addCAROptionChild(
    "An Assumption", "You always this quick to assume things?",
    "It's my job to. I'm damn good at it too.",
    characters.ARDA,
    characters.MAN
).addChild(resumePoint);

richDadFork.addTerminationOption("Fuck you. [END CONVERSATION]", "Fuck you.");

const understandQuestionFork = resumePoint.addMessageChain([
    {render: "Here's the deal", name: characters.MAN},
    "This isn't some tour, it's not even some safari",
    "We send you the gear",
    "You get there",
    "Then you're on your own.",
    "You understand?",
])
.attachSideEffect(() => {/* do something */})

understandQuestionFork.addCAROptionChild(
    "done threatening me?", "you done threatening me so we can get on with it?",
    "I'm not threatening you, miss, just some... terms and conditions.",
    characters.ARDA,
    characters.MAN
).addMessageChain([
    {render: "Right. Moving on.", name: characters.ARDA},
    {render: "he glares before shifting back in his seat", name: "VISUALIZER"},
    {render: "Moving on...", name: characters.MAN},
    "Expect a cached delivered to your preferred home node in the next few days.",
    "This is a DV mod specifically for your XA-3. Mods embedded stenographically on top of some old porn.",
    "Makes customs okay with the suspicious packages and lack of program signature.",
    "I'm assuming you'll know how to extract it since you found us on FF.",
    "Once you have it installed, message this VLID:",
    () => "<randomly generate a VLID here...>",
    "We'll be in touch after that to find a time and place to verify everything is working before handing off the origins.",
])
.addChild("Got it", characters.ARDA);
    

export default root