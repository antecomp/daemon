import { createDialogueBuilder, VISUALIZER } from "@/core/dialogue/dialogueBuilder";

const ARDA = "Arda";
const MAN = "The Man";

const root = createDialogueBuilder("His eyes dart and glimmer breifly behind his sunglasses - likely verifying my VLID.", VISUALIZER)

root.chainAlt( // Chain alternate just takes two speakers and a bunch of strins, and alternates who's speaking.
    MAN, ARDA,
    "What model VI-LINK do you have?",
    "Why does it matter?",
    "Could be the difference between you rbrain melting and not.",
    "XA-3.",
    "Damn. Fancy for someone like you. Doing this to rebel against your rich daddy?"
)
.addCarBranch(
    // Summary Text, Text That Is Sent In Dialogue.
    "Say Nothing", "...",
    // Response
    ["His smirk fades as quickly as it appeared", VISUALIZER]
)
.addCarBranch(
    "Tell him off", "None of your fucking business",
    "Like hell it isn't my business, I'm here to make sure you don't snitch right off the link.",
    // Build a small sub-tree off the response.
    r => r.chain(
        "I got what I needed from that response though", 
        "Hold on to that angst kid, it'll keep you going."
    )
)
.joinBranches( // Collapse all current branches to a single node.
    "Here's the deal. This isn't a tour, and it's not like one of those schlocky sim-thrillers"
)
.next("I hand off the mod, then you're on your own. Understand?")
.addCarBranch(
    "Yes", "Yeah, of course.",
    "Plus, I have your VLID, and you're the only client I've had in the past 3 weeks",
    r => r.chain(
        "I'll know it's you if ASCM comes knocking on my door.",
        "My team works on homebrewed DVs daily, we can just as easily bypass an existing one."
    )
    .chainAlt(
        ARDA, MAN,
        "Are you done threatening me so we can get on with it?",
        "I'm not threatening you, just some... terms and conditions.",
        "Right. Moving on."
    )
    .next("He smirks, though it's hard to tell if it's out of amusement or annoyance", VISUALIZER)
    .next("Moving on...", MAN)
    .chain(
        "What you're getting isn't a patch or plug-in, it's a permanent bypass.",
        "Burn once. Firmware update, you know how it goes."
    )
)
.addCarBranch(
    "Questions", "Can I ask some questions first?",
    "If it's anything technical, no, I don't make the mods.",
    r => r
        .addCarBranch(
            "Caught", "What if I get caught with this thing?",
            "You never check the feeds, kid? Or is this your idea of a joke?",
            caught => caught.chain(
                "ASCM has an agreement with every country they serve.",
                "Unauthorized VI-LINK modification is usually a federal offense and Fringe trespass is an aggravating circumstance.",
                "Don't ask me smething so dumb."
            )
            .next(
                "He looks frustrated, almost to the point of suspicion; that'd you'd come in and ask him to explain the risks.", 
                VISUALIZER
            )
        )
        .addCarBranch(
            "Other Question", "I have some other question",
            "Looks like somebody only wrote one question in the document, this is just an example."
        )
        .joinBranches("Alright, enough questions, I have other things to do today kid.")
        .next("He pauses.", VISUALIZER)
        .next("The only other warning I got for you is that this is a permanent bypass.", MAN)
        .next("Burn once. Only way to get it to work.")
)
.joinBranches("So... when you slot it, you're exposed. That clear?")


// This next part is going to be difficult because we have two different merge points!!!

.addCarBranch(
    'Ask a technical question', 'Is it disabling my DV entirely? SOunds suicidal.',
    ["He raises an eyebrow, slightly, a hint that you've said something outside his usual script", VISUALIZER],
    disable => disable
        .n("No. Not entirely. We're not trying to kill you.", MAN)
        .n("Even if you're paying us \"getting killed\" rates.")
        .n("He shifts in his seat.", VISUALIZER)
        .n("It forces your DV into manual, just like how Agents have it.", MAN)
        .chain(
            "The safety net's still there, but it's last-ditch stuff.",
            "There's some basic automation here and there- but if you depend on it, high odds it will get you killed.",
            "You'll feel and see things alsmost as they are. Take care not to get too attached."
        )
        .n("Vehind his sunglasses, the glint suggest he is speaking from experience.", VISUALIZER)
        .n("But hey - your F-CH hits critical, it'll still yank you.", MAN)
        .n("Just... no promises it'll be clean, or leave you whole.")
)
.addCarBranch(
    'Yes', 'Yes',
    "I would envy your confidence if I didn't know it will get you killed.",
    r => r.n("Remember, your DV will have to be manually controlled. Don't get too comfortable.")
)
.addCarBranch(
    'No', 'No really.',
    "Look, if you don't know what the hell the mod is doing, I can't help you.",
    nb => nb
        .chain(
            "I'm only giving you that disclaimer out of good conscience.",
            "I'm still selling, if you don't heed my warnings, it's your funeral.",
            "In any case, you'll have to prove your worth to some degree to get the mod working anyway."
        )
        .n("What does that mean?", ARDA)
)



export default root.unwrap();
    
// I have to declare the start of it here...
//const the_deal = createDialogueBuilder("Here's the deal. This isn't a tour, and it's not like one of those schlocky sim-thrillers.")

// Then attach (or build out the entire dialogue and essentially attach going backwards!)


