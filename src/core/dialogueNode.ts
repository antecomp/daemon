import { DEFAULT_DIALOGUE_SENDER } from "../config";

export interface DialogueOption {
    summaryText: string
    fullText: string
    next: DialogueNode
}

export type DialogueNode = {
    id: string;
    name: string // whos speaking
    render: string | (() => string) // Maybe just use empty string to representing blank message for navigation nodes (f.e chaining options together with no text).
    options: DialogueOption[]
    next?: DialogueNode
    // TODO: make a side-effect function, that runs when dialogue rendered.
        // While we can technically have side-effects of render, that doesn't sound ideal.

    /**
    * Attach a new or existing child DialogueNode to the node
    * @param renderOrNode - Either an existing node made somewhere else (reference) or a 'render' representing a new message
    * @param name - name to attach to the new message. If none provided, it will inherit from the parent.
    * @returns node - a reference to the newly created dialogue node   
    */
    addChild(renderOrNode: DialogueNode['render'] | DialogueNode, name?: string): DialogueNode;

    /**
     * Attach a new or existing child Dialogue node as the result of a dialogue option.
     * @param summaryText Text for the options quick representation
     * @param fullText Full previewed text in the dialogue box 
     * @param renderOrNode existing node or 'render' that is navigated to by this option.
     * @param name When creating a new node, name to attach to it. If none provided it will inherit from the parent.
     */
    addChildAsOption(summaryText: string, fullText: string, renderOrNode: DialogueNode['render'] | DialogueNode, name?: string): DialogueNode;

    /**
     * "Call and Response" - render a node for summaryText and add it as a node, then attach an immediate response node as another child.
     * @param summaryText  Text for the options quick representation
     * @param fullText  Full previewed text in the dialogue box 
     * @param responseAsRenderOrNode  existing node or 'render' that is navigated to by this option.
     * @param senderName - name attached to the "caller" (first person 99% of the time), defaults to config.DEFAULT_DIALOGUE_SENDER if none provided.
     * @param responderName - name attached to the "response" text, if we're creating a new node for it.
     */
    addCAROptionChild(summaryText: string, fullText: string, responseAsRenderOrNode: DialogueNode['render'], senderName?: string, responderName?: string): DialogueNode,

    // TODO: Multiple Option/CARs attached at once?????
    // Additional Wraper Function Helpers for extra fast tree building >:3

    /**
     * Quickly append a chain of messages as a simple array.
     * @param messages Array of either Dialogue Node Render-ers (string or function that returns a string) or obj of {name, render} for adapting the name
     * @returns ref to the last message in the chain.
     */
    addMessageChain(messages: ({name: string, render: DialogueNode['render']} | DialogueNode['render'])[]): DialogueNode
}

let nodeCounter = 0;

/**
 * Factory function for a dialogue node. Use this to create the root node.
 * @param render A string or a function that returns a string, representing the 'message' for a given dialogue node
 * @param name Name of the individual sending the message
 * @returns Reference to the created dialogue node.
 */
export function createDialogueNode(render: DialogueNode['render'], name: string): DialogueNode {
    const id = `node-${nodeCounter++}`

    const node: DialogueNode = {
        name,
        id, 
        render,
        options: [],

        // Helper function to automatically attach a child, sets it as next
        addChild(renderOrNode, name) {
            if(renderOrNode && typeof renderOrNode == 'object' && 'id' in renderOrNode) {
                // Attach and re-return node created somewhere else.
                this.next = renderOrNode
                return renderOrNode
            }

            // Otherwise create a new node...
            // Either use provided name or infer (use same as) the parent...
            const child = createDialogueNode(renderOrNode, name ?? this.name); // make sure name reference is correct here.
            this.next = child;
            return child;
        },

        // Helper function to automatically attach a child as an option.
        addChildAsOption(summaryText, fullText, renderOrNode, name?: string){

            // Attach Existing
            if(typeof renderOrNode === 'object' && 'id' in renderOrNode) {
                this.options.push({
                    summaryText, 
                    fullText,
                    next: renderOrNode
                })
                return renderOrNode;
            }

            // Generate New If Only Given A Render Param
            const child = createDialogueNode(renderOrNode, name ?? DEFAULT_DIALOGUE_SENDER);
            this.options.push({
                summaryText,
                fullText,
                next: child
            })
            return child;
        },


        addCAROptionChild(summaryText, fullText, responseAsRenderOrNode, senderName, responderName) {


            const callNode = createDialogueNode(fullText, senderName ?? DEFAULT_DIALOGUE_SENDER);
            this.options.push({
                summaryText, fullText, next: callNode
            })

            // Attach existing node as response
            if(typeof responseAsRenderOrNode === 'object' && 'id' in responseAsRenderOrNode) {
                callNode.next = responseAsRenderOrNode
                return responseAsRenderOrNode
            }

            // Either infer response is from the name associated with just before the options, or explicitely take one.
            const responseAsChild = createDialogueNode(responseAsRenderOrNode, this.name ?? responderName)
            callNode.next = responseAsChild;

            return responseAsChild;
        },

        addMessageChain(messages) {
            let active: DialogueNode = this;
            messages.forEach(messageData => {
                if(typeof messageData === 'object') {
                    active = active.addChild(messageData.render, messageData.name)
                } else {
                    active = active.addChild(messageData)
                }
            });

            return active;
        },
    }

    return node;
}


// ---------------------------------------------
/* Debugging / Visualizing Tools */
// Import your dialogue system

/**
 * Recursively prints a dialogue tree in a readable format.
 * @param node The starting dialogue node
 * @param visited Keeps track of visited nodes to prevent infinite loops
 * @param depth Indentation level for printing
 */
function printDialogueTree(node: DialogueNode, visited = new Set(), depth = 0) {
    if (!node || visited.has(node.id)) return; // Avoid infinite loops in cyclic structures
    visited.add(node.id);

    const indent = "  ".repeat(depth);
    console.log(`${indent}- [${node.name}] ${typeof node.render === "function" ? node.render() : node.render}`);

    // Print next node (linear)
    if (node.next) {
        //console.log(`${indent}  ↳`);
        printDialogueTree(node.next, visited, depth + 1);
    }

    // Print choices
    if (node.options.length > 0) {
        console.log(`${indent}  ↳ (Options)`);
        node.options.forEach((option, index) => {
            console.log(`${indent}    ${index + 1}. ${option.summaryText} - ${option.fullText}`);
            printDialogueTree(option.next, visited, depth + 2);
        });
    }
}

/** 🌳 Test: Build and visualize a dialogue tree */
function testDialogueSystem() {
    console.log("🎭 Testing Dialogue System\n");

    const root = createDialogueNode("Welcome to the test dialogue!", "Narrator");

    // Linear branch
    const branchA = root
        .addMessageChain(["This is from a message chain", "It can add a rapid set of messages", "without much thought"])
        .addMessageChain([
            {name: "Person A", render: "You can even have a back and fourth, albiet with a bit more boilerplate."},
            {name: "Person B", render: "Switching back and fourth between people, just like this"},
            "Or, you can continue with a simple string, and it'll retain the speaker from the previous item in the array!"
        ])
        .addChild("Now, you have a choice...", "NPC");

    // Adding choices
    branchA.addCAROptionChild("Ask about the town", "Tell me about this place.", "The town is old and full of mystery.", "Player", "NPC")
        .addChild("Interesting...", "Player");

    branchA.addChildAsOption("Leave town", "I'm just passing through.", "Safe travels, stranger.", "NPC");

    // Loopback scenario
    const loopStart = createDialogueNode("This is a loop entry point.", "NPC");
    const loopBack = loopStart.addChild("You are looping back...");
    loopBack.addChildAsOption("Loop again", "I want to go back!", loopStart);
    loopBack.addChildAsOption("Exit loop", "I'm done with the loop.", "The loop ends here.", "NPC");

    branchA.addChildAsOption("Enter loop", "Show me something interesting.", loopStart);

    // Print the final dialogue tree
    console.log("\n🎭 Dialogue Tree Structure:\n");
    printDialogueTree(root);
}

// Run the test
testDialogueSystem();


