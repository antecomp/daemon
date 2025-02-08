import { DEFAULT_DIALOGUE_SENDER } from "@/config";

interface DialogueOption {
    summaryText: string
    fullText: string
    next: DialogueNode
}

type DialogueNode = {
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
    addCAROptionChild(summaryText: string, fullText: string, responseAsRenderOrNode: DialogueNode['render'], senderName?: string, responderName?: string): DialogueNode

    // TODO: Multiple Option/CARs attached at once?????
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


            const callNode = createDialogueNode(summaryText, senderName ?? DEFAULT_DIALOGUE_SENDER);
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

            return responseAsChild;
        },
    }

    return node;
}


// Basic case, fully linear.
const root = createDialogueNode("Welcome to the dialogue", "root");

const forkA = root
    .addChild("Messages can be easily chained together like this")
    .addChild("And that includes changing the active speaker", "new person")
    .addChild("The last child in this chain is returned...")
    .addChild("So we assign when we need to add a FORK to our dialogue tree")
    .addChild("Since we want to attach siblings, not direct children in a chain like this")
    .addChild("Now pick some options...")

forkA.addCAROptionChild("Some option", "I pick some option", "Response: I see you picked some option", "you") // responder named inferred
    .addChild("You can then continue the chain of messages super easily from a fork, just like this...")
    .addChild("And it works all the same as above", "A Third Person")

forkA.addCAROptionChild("Some other option", "I pick some other option", "Response: You picked some other option", "you", "5th person, different than before options")
    .addChild("Now we have another chain of messages relating to this option specifically")




// Case with loops....    
const complexRoot = createDialogueNode("This dialogue is a bit more complicated", "root");

const loopTo = complexRoot.addChild("This dialogue node will be looped back into...")

const loopFrom = loopTo
                    .addChild("let this node represent some intermediate stuff going on before the loop...")
                    .addChild("Now we get this node by reference, just like fork....");

loopFrom.addChildAsOption("loop", "lets loop back", loopTo);
loopFrom.addCAROptionChild("end loop", "lets end the loop", "This is the end node with no children, terminating the dialogue...", "you", "RESPONDER");

