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
    options: DialogueOption[]
    next?: DialogueNode | ((ctx?: DialogueContext) => DialogueNode)
    sideEffect?: (ctx?: DialogueContext) => void,
    waitFor?: (ctx?: DialogueContext) => Promise<void>
}

// Theres probably a better name for this type lol.
// <- summaryText, fullText, or just use the same string for both.
export type OptionConstructorText = string | [string, string];
