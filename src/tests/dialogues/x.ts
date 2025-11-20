import { createDialogueBuilder, inline, VISUALIZER } from "@/core/dialogue/dialogueBuilder";

const ARDA = "Arda";
const MAN = "The Man";

const root = createDialogueBuilder("His eyes dart and glimmer breifly behind his sunglasses - likely verifying my VLID.", VISUALIZER)

root.chainAlt(MAN, ARDA, [
        "What model VI-LINK do you have?",
        "Why does it matter?",
        "Could be the difference between your brain melting and not.",
        "XA-3",
        "Damn. Fancy for someone like you. Doing this to rebel against your rich daddy?"
    ])
    .addBranch( // Create a subtree branch.
        "Say Nothing",
        "...",
        ["His smirk fades as quickly as it appeared", VISUALIZER],
        r => r.n("Lighten up.", MAN)
    )
    .addCarBranch(
        "None of your business",
        "None of your f'cking business",
        "Like hell it isn't my business, I'm here to make sure you don't snitch right off the link",
        r => 
            r.n("He pauses.", VISUALIZER)
            .n("I got what I needed from that response though", MAN)
            .n("Hold on to that angst kid, it will keep you going.")
    )
    .joinBranches( // All branches will now point back to this point, nice linear flow.
        "Here's the deal. This isn't a tour...", MAN
    ) // join branches returns the join point, we can continue as normal!
    .n("... more text from the guy...") 


export default root.unwrap();

    
// I have to declare the start of it here...
//const the_deal = createDialogueBuilder("Here's the deal. This isn't a tour, and it's not like one of those schlocky sim-thrillers.")

// Then attach (or build out the entire dialogue and essentially attach going backwards!)


