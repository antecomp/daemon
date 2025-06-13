import { createDialogueNode } from "@/core/dialogue/dialogueNode";

const characters = Object.freeze({
    ARDA: "Arda",
    MAN: "The Man",
    VIZ: "VISUALIZER"
})

const root = createDialogueNode("His eyes dart and glimmer briefly behind his sunglasses, likely verifying my VLID", characters.VIZ);

const firstUnderstand = root.addBackAndFourthChain([
    "What model VI-LINK do you have?",
    "Why does it matter?",
    "Because a difference in model number is a difference in whether your brain melts or not",
    "XA-3",
    "Damn, fancy for someone like you. You doing this to rebel against your rich daddy?",
    "None of your fucking business.",
    "Like hell it isn't my business. I'm here to make sure you don't eject and dob immediately."
], characters.MAN, characters.ARDA)
    .addChild("I got what I needed to know from that response though. Hold on to that angst kid, it'll keep you going.")
    .addChild("...", characters.ARDA)
    .addChild("he leans forward", characters.VIZ)
    .addMessageChain(
        [{render: "Here's the deal, THis isn't some tour, it's not even some safari. I handoff the mod, we get you there, then you're on your own.",
         name: characters.MAN
        }, "Understand?"]
    )
    .addChildAsOption("Yes", "Yeah, of course", "Yeah, of course")
    .addChild("Plus, I got your VLID, and you're the only client I've had in the past 3 weeks. I'll know it's you if ASCM comes knocking on my door.", characters.MAN)
    .addBackAndFourthChain(
        [
            "My team works on homebrewed DV's daily, we can just as easily bypass an existing one.",
            "Are you done threatening me so we can get on with it?",
            "I'm not threatening you, miss, just some... terms and conditions.",
            "Right. Moving on."
        ],
        characters.MAN,
        characters.ARDA
    )
    .addChild("He smirks, you are unsure if it's out of amusement or annoyance.", characters.VIZ)
    .addMessageChain(
        [
            {name: characters.MAN, render: "Moving on... what you're getting isn't a patch or plugin, it's a permanent bypass."},
            "Burn once. It's designed to corrode the VLs protective scaffolding, in a targeted way of course.",
            "Disable the safeguards without alerting the watchdog.",
            "So once you slot it, you're exposed. All of you.",
            "That also clear?"
        ]);



export default root;