// Let's make a simple example dialogue!!

import { createDialogueBuilder } from "@/core/dialogue/dialogueBuilder";
import { VISUALIZER } from "@/core/dialogue/dialogueNode";

// Let's make a quick const for the speakers in our dialogue,
// we can use these variables to keep the spelling consistent!
const MORI = "Mori";
const OMNI = "Omni";

// All dialogues using the new builder system start with the following to get our root node...
    // It takes an initial render (string or function that returns a string) for the root dialogue
    // alongside who is speaking...
const rootA = createDialogueBuilder("This the root node", OMNI);

/* Building our dialogue tree is based on the methods of this "DialogueBuilder" class (what `root` is).
    A huge idea of this is that these methods have some unique returns to allow us to chain stuff together.
    Generally, one of these methods will either return either...
        - The node you're currently on (so you can chain a bunch of methods together and "stay in place" as it were)
        - The child node you just attached (or if there's a subtree, the tail of that subtree), traversing downwards into the tree for you.
*/

// "then" creates or attaches a new child dialogue node and returns it (traverses into it)
// By default the node will inherit the name of what you attached it to, but you can override this.
rootA
    .then("This is a child node")
    .then("This is a grandchild, it also has a new speaker", MORI)

// Spamming .then a bunch sounds annoying, so let's use "chain"
// Chain will create a bunch of nodes for any number of render arguments, inheriting the speaker name from the node we're attaching to
// in this case, the following messages will be sent by MORI
    .chain(
        "Great-Grandchild",
        "Greater-Grandchild",
        "And so on..."
    )
// Often dialogue swaps back and fourth between two people though, for this, we have chainAlt, which takes two speakers
// and then the long list of renders. 
    .chainAlt(
        OMNI, MORI,
        "This is sent by Omni",
        "This is then sent by Mori",
        "Back to Omni speaking",
        "and mori again..."
    )
// Both chain and chainAlt return a reference to the last node in the chain, so we can keep building off of it.


    // Note: notice how all of these are dot operands in succession, I am not doing rootA.then, rootA.then, rootA.chain...
    // if we did that, we would be constantly overwriting rootAs next, not continuing off the result of these commands!
    // Be careful to know where you are in the dialogue tree!


// When we're done building a tree, we want to export the *unwrapped* version of it.
// See, DialogueBuilder is a wrapper class for DialogueNode (DialogueNode being what Hermes actually reads)
// Everything has been internally built for us, but we need to unwrap the root of our tree before sending it out..
export const dialogue_root_A = rootA.unwrap();

// And that's all you need for a fully linear dialogue. 

// ... But most of the time we want some player interaction!
// Let's get into the more complicated stuff...

const rootB = createDialogueBuilder("This tree will be an actual dialogue TREE", OMNI);

rootB
    .chain(
        "Let's send some messages first.",
        "Just something to give the dialogue some flow",
        "Alright, say now we want the player to make a choice...",
        "Eat the mold or the mildew?"
    )
    // Generic options are attached with .addOption or .option
    // .addOption keeps us at the current node level, whereas .option traverses *into* that options subtree,
    // Almost always you want to use .addOption, especially if we're adding multiple.
    .addOption(
        // First item is the 'summaryText' (what you pick), 
        // second item is what is typed out in the preview.
        // Since this is a choice that isn't actually a message being sent in-game, we'll make the fullText empty.
        ["Mold", ""],
        // Next is the node this connects to. Either an existing node, or a tuple used to create a new one [render, name]
        ["You eat the mold", VISUALIZER], // VISUALIZER is a special name to show a gray action box instead of a message bubble.
        // Next up is the unique part of this new builder system, the SUBTREE BUILDER.
        // Basically, a bunch of these methods allow you to define a function that takes the a newely created header node (in this case the 'you eat the mold' message)
        // and then allows you to build a subtree off of that node using any of the builder functions
        // it uses lambda syntax, which can look a bit annoying, but it's one line of boilerplate for a ton of powerful composition!
        eatMoldSubtree => eatMoldSubtree
            .then("I cannot beleive this guy just ate mold.", OMNI)
            .then("Yeah that is disgusting!!!", MORI)
        // the subtree falls off here, we will show ways to instead unify stuff back to some node later!
    )
    // addOption just returns the node we were already at (regardless of the subtree shit), so we can just chain more!
    .addOption(
        ["Mildew", ""],
        ["You eat the mildew", VISUALIZER],
        // The subtree stuff is totally optional! If you don't define one, the 'subtree' is basically just this singular node.
    )
    // Although, many times, we have some sort of interaction between the player and NPC, where the option we pick
    // should be sent as a message, and then we want the NPC to respond in some way.
    // For this, we have CAR (Call-And-Response).
    // We have a Call, which is the message sent by the player (which matched the full typed out text for the option)
    // Then we have the response, which is a subsequent node to that call, usually sent by the NPC in 'response' to what we just said.
    // Like option, we have both .addCar and .car   - and like option, we will almost always use .addCar to stay at the current level -> just trust me.
    .addCar(
        ["Neither", "I will not be eating either of those!"], // "Option/Call" -> when selected the MC will send a "I will not be eating either of those" message.
        ["Imagine not being a spore-head like us.", OMNI], // The 'response' node - formatted like the option stuff. (Can also be set up to use an existing node but we won't get into that)

        // Like .addOption, we can also build a subtree. This subtree starts at the *response* node.
        response => response
            .then("I bet this guy doesn't even have mycellium in his brain", MORI)
            .then("What a loser!", "Omni & Mori (In Unison)")
        // Once again, this subtree falls off naturally here.
    )

// As mentioned, using addOption & addCar like this creates subtrees that are fully independent, and thus will 'fall off' at their ends.
// A lot of the time this is great, often options fork into entirely unique branches in our dialogue tree...

// But what if we want to unify these branches back to some unification point to continue the dialogue.
// For example, maybe we have some little tangent conversation we can go on, but eventually it should go back to the main dialogue stream
/*

      [root (or some upstream part of dialogue)]
                /                \
        "Branch A Root"     "Branch B Root"
             |                    |
        [Own subtree]      [Own subtree]
                \         /
                JOIN POINT   <- regardless of branch, you should eventually come back to this point.
                    |
                    ...

*/