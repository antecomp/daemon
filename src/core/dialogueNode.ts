import { DEFAULT_DIALOGUE_SENDER } from "../config";

export interface DialogueOption {
    summaryText: string
    fullText: string
    next?: DialogueNode
}

export type DialogueNode = {
    id: string;
    name: string // whos speaking
    render: string | (() => string) // Maybe just use empty string to representing blank message for navigation nodes (f.e chaining options together with no text).
    options: DialogueOption[]
    next?: DialogueNode
    sideEffect?: () => void,

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
     * Allows adding multiple options at once.
     * @param options - Array of { summaryText, fullText, renderOrNode, name? }
     * @returns - Array of created DialogueNodes
     */
    addOptions(options: { summaryText: string, fullText: string, renderOrNode: DialogueNode['render'] | DialogueNode, name?: string }[]): DialogueNode[];

    /**
     * "Call and Response" - render a node for summaryText and add it as a node, then attach an immediate response node as another child.
     * @param summaryText  Text for the options quick representation
     * @param fullText  Full previewed text in the dialogue box 
     * @param responseAsRenderOrNode  existing node or 'render' that is navigated to by this option.
     * @param senderName - name attached to the "caller" (first person 99% of the time), defaults to config.DEFAULT_DIALOGUE_SENDER if none provided.
     * @param responderName - name attached to the "response" text, if we're creating a new node for it.
     * @returns Ref to the "response" child.
     */
    addCAROptionChild(summaryText: string, fullText: string, responseAsRenderOrNode: DialogueNode['render'] | DialogueNode, senderName?: string, responderName?: string): DialogueNode,

    /**
     * Allows adding multiple Call-and-Response (CAR) options at once.
     * @param carOptions - Array of { summaryText, fullText, responseAsRenderOrNode, senderName?, responderName? }
     * @returns - Array of created response DialogueNodes
     */
    addCAROptions(carOptions: { summaryText: string, fullText: string, responseAsRenderOrNode: DialogueNode['render'] | DialogueNode, senderName?: string, responderName?: string }[]): DialogueNode[];

    /**
     * Quickly append a chain of messages as a simple array.
     * @param messages Array of either Dialogue Node Render-ers (string or function that returns a string) or obj of {name, render} for adapting the name
     * @returns ref to the last message in the chain.
     */
    addMessageChain(messages: ({name: string, render: DialogueNode['render']} | DialogueNode['render'])[]): DialogueNode

    /**
     * Generates a message chain where the names are set to alternate between two values automatically. Used for back-and-fourth dialogue.
     * @param messages Array of messages
     * @param first First person to speak (name)
     * @param second Next person to speak (name)
     */
    addBackAndFourthChain(messages: (DialogueNode['render'])[], first: string, second: string): DialogueNode

    /**
     * Attach a "side effect" (additional function) that will run when a node is rendered. Returns a ref back to the node.
     * @param ef The CB to run when the node is entered
     */
    attachSideEffect(ef: () => void): DialogueNode

    /**
     * Add a option that ends the dialogue with custom text.
     * @param summaryText 
     * @param fullText - Note - you wont see this message sent, as the dialogue will terminate immediately, this is just for the typed preview.
     */
    addTerminationOption(summaryText: string, fullText: string): DialogueNode
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
            const responseAsChild = createDialogueNode(responseAsRenderOrNode, responderName ?? this.name)
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

        attachSideEffect(ef) {
            this.sideEffect = ef;
            return this;
        },

        addBackAndFourthChain(messages, first, second) {
            let active: DialogueNode = this;
            messages.forEach((messageRender, idx) => {
                active = active.addChild(messageRender, [first, second][idx % 2])
            })
            return active;
        },

        addTerminationOption(summaryText, fullText) {
            this.options.push({summaryText, fullText})
            return this;
        },

        addOptions(options) {
            return options.map(({ summaryText, fullText, renderOrNode, name }) => 
                this.addChildAsOption(summaryText, fullText, renderOrNode, name)
            );
        },

        addCAROptions(carOptions) {
            return carOptions.map(({ summaryText, fullText, responseAsRenderOrNode, senderName, responderName }) => 
                this.addCAROptionChild(summaryText, fullText, responseAsRenderOrNode, senderName, responderName)
            );
        }

    }

    return node;
}