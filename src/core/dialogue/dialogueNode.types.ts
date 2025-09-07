import { Accessor } from "solid-js"

export interface DialogueOption extends DialogueOptionConfig {
    summaryText: string
    fullText: string
    next?: DialogueNode | ((ctx?: DialogueContext) => DialogueNode)
}

/** Context data passed from Hermes (and the caller by proxy) to each dialogue node at render/usage, allows passing local context to the dialogue at runtime */
export interface DialogueContext {
    flags?: Record<string, string | boolean | number>
    signals?: Record<string, Accessor<any>>
    actions?: Record<string, () => void>
}

export interface DialogueOptionConfig {
    /**
     * Side effect that is immediately triggered when option selected.
     * Namely can be attached to termination options to trigger an event when the dialogue ends.
     */
    sideEffect?: (ctx?: DialogueContext) => void,

    /** CB Used to filter options in realtime based on dialogue/gamestate */
    onlyShowWhen?: (ctx?: DialogueContext) => boolean
}

/** A 'render' of a Dialogue node (determining the content of a message) is either just a plain string, or a function that returns a string (for contextual changes of message) */
export type DialogueRender = string | ((ctx?: DialogueContext) => string)

/** Many of the methods for attaching new nodes allow you to either attach an existing DialogueNode (created elsewhere)
 * or just provide a DialogueRender instance, and a new node will be built from that automatically. */
export type RenderOrNode = DialogueRender | DialogueNode

/**
 * A DialogueNode represents a single "message" within a dialogue tree. You can generate a completely new one with the createDialogueNode FF (this is done for a root node).
 * 
 * However, the main strength of DialogueNode is it's helper methods. Every DialogueNode provides methods that allow you to automatically generate and attach children nodes.
 * Furthermore, each of these methods return the newly created nodes, allowing you to chain multiple helpers together to quickly build dialogue trees.
 * 
 * Generally, refer to the JSDoc for the createDialogueNode and helper methods here instead of the node itself. You should never be declaring a node manually.
 * 
 * @property id - Internal tracking of dialogue nodes for keying and visualization. This should never be changed.
 * @property name - who is speaking.
 * @property render - a string or a method that returns a string, represents the actual message content being sent. The method that returns a string type is if you want to make the messages change their content based on game-state, or if you want to use helpers such as pickRandom().
 * @property options - an array of "options" ({summaryText, fullText, next}), these are the players response-points, forks in the dialogue tree.
 * @property next - pointer to the subsequent node, typically a child DialogueNode, but this can also loop/point to other parts of the Dialogue Graph.
 * @property sideEffect - method that runs whenever a dialogue node renders, allows you to update game state based on dialogue events.
 */
export type DialogueNode = {
    id: string;
    name: string
    render: DialogueRender
        // Side note: Empty strings are used by the parser to represent navigational nodes that will not be shown on screen. F.e if you want to chain options together without text in between.
    options: DialogueOption[]
    next?: DialogueNode | ((ctx?: DialogueContext) => DialogueNode)
    sideEffect?: (ctx?: DialogueContext) => void,

    /** Blocking side effect, halts dialogue flow until promise resolves,
     * can be used to await camera movement, battles, cutscenes etc
     * without terminating dialoguue.
     */
    waitFor?: (ctx?: DialogueContext) => Promise<void>

    /**
    * Attach a new or existing child DialogueNode to the node
    * @param child - Either an existing node made somewhere else (reference) or a 'render' representing a new message
    *   - when just a render is passed, the child will inherit the sender name from the current node.
    * @param name - name to attach to the new message. If none provided, it will inherit from the parent.
    * @returns node - a reference to the newly created dialogue node   
    */
    addChild(child: RenderOrNode, name?: string): DialogueNode;

    /**
     * Attach a new or existing child Dialogue node as the result of a dialogue option.
     * @param summaryText Text for the options quick representation
     * @param fullText Full previewed text in the dialogue box 
     * @param child This is what's actually spawned by selecting an option. Existing node or 'render' that is navigated to by this option.
     * @param name When creating a new node, name to attach to it. If none provided it will inherit from the parent.
     * @returns ref to the child node
     */
    addChildAsOption(
        summaryText: string, 
        fullText: string, 
        child: RenderOrNode, 
        name?: string, 
        optionConfig?: DialogueOptionConfig
    ): DialogueNode;

    /**
     * Allows adding multiple options at once.
     * @param options - Array of { summaryText, fullText, child, name? }
     * @returns - Array of created DialogueNodes
     */
    addOptions(options: { 
            summaryText: string, 
            fullText: string, 
            child: RenderOrNode, 
            name?: string, 
            optionConfig?: DialogueOptionConfig
        }[]
    ): DialogueNode[];

    /**
     * "Call and Response" - render a node for summaryText and add it as a node, then attach an immediate response node as another child.
     * @param summaryText  Text for the options quick representation
     * @param fullText  Full previewed text in the dialogue box - For CaR this will also be the message sent. The "call"
     * @param response  existing node or 'render' that is navigated to by this option.
     * @param senderName - name attached to the "caller" (first person 99% of the time), defaults to config.DEFAULT_DIALOGUE_SENDER if none provided.
     * @param responderName - name attached to the "response" text, if we're creating a new node for it.
     * @returns Ref to the "response" child.
     */
    addCAROptionChild(
        summaryText: string, 
        fullText: string, 
        response: RenderOrNode, 
        senderName?: string, 
        responderName?: string,
        optionConfig?: DialogueOptionConfig
    ): DialogueNode,

    /**
     * Allows adding multiple Call-and-Response (CAR) options at once.
     * @param carOptions - Array of { summaryText, fullText, response, senderName?, responderName? }
     * @returns - Array of created response DialogueNodes
     */
    addCAROptions(carOptions: { 
            summaryText: string, fullText: string, 
            response: RenderOrNode, 
            senderName?: string, responderName?: string,
            optionConfig?: DialogueOptionConfig
        }[]
    ): DialogueNode[];

    /**
     * Quickly append a chain of messages as a simple array.
     * @param messages Array of either Dialogue Node Render-ers (string or function that returns a string) or obj of {name, render} for adapting the name
     * @returns ref to the last node in the chain.
     */
    addMessageChain(messages: ({name: string, render: DialogueRender} | DialogueRender)[]): DialogueNode

    /**
     * Generates a message chain where the names are set to alternate between two values automatically. Used for back-and-fourth dialogue.
     * @param messages Array of messages
     * @param first First person to speak (name)
     * @param second Next person to speak (name)
     * @returns ref to the last node in the chain
     */
    addBackAndFourthChain(messages: (DialogueRender)[], first: string, second: string): DialogueNode

    /**
     * Attach a "side effect" (additional function) that will run when a node is rendered. Returns a ref back to the node.
     * @param ef The CB to run when the node is entered. ef takes a generic "context" object that can be used to reference other game methods
     * @returns the node back (this) for chaining
     */
    attachSideEffect(ef: (ctx?: DialogueContext) => void): DialogueNode

    /**
     * Attach a "waitFor" async CB, a method that blocks dialogue flow until the promise resolves.
     * @param waitFor : An async function that halts dialogue flow.
     * @returns this node back for chaining.
    */
    makeNodeWaitFor(wf: (ctx?: DialogueContext) => Promise<void>): DialogueNode

    /**
     * Add a option that ends the dialogue with custom text.
     * @param summaryText 
     * @param fullText - Note - you wont see this message sent, as the dialogue will terminate immediately, this is just for the typed preview.
     * @returns the node back (this) for chaining.
     */
    addTerminationOption(summaryText: string, fullText: string, optionConfig?: DialogueOptionConfig): DialogueNode

    /** Conditionally attach a child dialogue node, when a child doesn't already exist.
     * 
     * These can be chained for multiple conditions, the first one that is true will be attached.
     * @param condition - boolean that determines if the child should be attached
     * @param child - render or node to attach if the condition is true
     * @returns - the parent node (this) <- Be careful when chaining! This won't return the child!
     */
    addChildIf(condition: boolean, child: RenderOrNode): DialogueNode

    /** Attach a faillback child dialogue node if one doesn't exist, and if there's no options (usually chained with .if)
     * @param child - render or node to attach if no other child is attached (all conditions are false)
     * @returns - the parent node (this) <- Be careful when chaining! This won't return the child!
     */
    addFallbackChild(child: RenderOrNode): DialogueNode

    /** Attach an option when condition is met
     * @param condition - boolean that determines if the option should be attached
     * @param option - summaryText, fullText, next: RenderOrNode, name
     * @returns - the parent node (this)
     */
    addChildAsOptionIf(condition: boolean, option: { summaryText: string, fullText: string, next: RenderOrNode, name?: string, optionConfig?: DialogueOptionConfig }): DialogueNode

    /** Attach fallback option if none exist and no "next" is specified (used in conjunction with addOptionIf, addChildIf, etc)
     * @param option - summaryText, fullText, next: RenderOrNode, name
     * @returns - the parent node (this)
     */
    addFallbackChildAsOption(option: { summaryText: string, fullText: string, next: RenderOrNode, name?: string, optionConfig?: DialogueOptionConfig }): DialogueNode

}