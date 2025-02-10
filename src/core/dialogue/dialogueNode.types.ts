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