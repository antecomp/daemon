import { DialogueNode } from "./dialogueNode.types";
import { DEFAULT_DIALOGUE_SENDER } from "../../config";

let nodeCounter = 0;

/**
 * Factory function for a dialogue node. Use this to create the root node.
 * Factory function here implements all the methods defined in dialogueNode.types.ts.
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
        addChildAsOption(summaryText, fullText, renderOrNode, name?: string, onlyShowWhen?: () => boolean) {
            // Attach Existing
            if(typeof renderOrNode === 'object' && 'id' in renderOrNode) {
                this.options.push({
                    summaryText, 
                    fullText,
                    next: renderOrNode,
                    onlyShowWhen
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


        addCAROptionChild(summaryText, fullText, responseAsRenderOrNode, senderName, responderName, onlyShowWhen) {
            const callNode = createDialogueNode(fullText, senderName ?? DEFAULT_DIALOGUE_SENDER);
            this.options.push({
                summaryText, fullText, next: callNode, onlyShowWhen
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

        addTerminationOption(summaryText, fullText, sideEffect, onlyShowWhen) {
            this.options.push({summaryText, fullText, sideEffect, onlyShowWhen})
            return this;
        },

        addOptions(options) {
            // TODO: For the love of code make addChildAsOption destructure an object to remove this mess
            // and so I can just make an interface for the constructor arguments.
            return options.map(({ summaryText, fullText, renderOrNode, name, onlyShowWhen }) => 
                this.addChildAsOption(summaryText, fullText, renderOrNode, name, onlyShowWhen)
            );
        },

        addCAROptions(carOptions) {
            return carOptions.map(({ summaryText, fullText, responseAsRenderOrNode, senderName, responderName, onlyShowWhen }) => 
                this.addCAROptionChild(summaryText, fullText, responseAsRenderOrNode, senderName, responderName, onlyShowWhen)
            );
        },

        addChildIf(condition, child) {
            if(condition && this.next === undefined) {
                this.addChild(child);
            }
            return this;
        },

        addFallbackChild(child) {
            if(this.next === undefined && this.options.length === 0)  {
                this.addChild(child);
            }
            return this;
        },

        addChildAsOptionIf(condition, option) {
            if(condition) {
                this.addChildAsOption(option.summaryText, option.fullText, option.next, option.name, option.onlyShowWhen);
            }
            return this;
        },

        addFallbackChildAsOption(option) {
            if(this.options.length === 0) {
                this.addChildAsOption(option.summaryText, option.fullText, option.next, option.name, option.onlyShowWhen);
            }
            return this;
        },
    }

    return node;
}


/**
 * Creates an inline dialogue tree by initializing a root dialogue node and
 * passing it to a builder function for generating the tree (adding more nodes).
 *
 * @param rootRender - The render function for the root dialogue node.
 * @param rootName - The name of the root dialogue node.
 * @param builder - A function that receives the root dialogue node and allows
 * customization of the dialogue tree structure.
 * @returns The root dialogue node of the constructed dialogue tree.
 * 
 * Motivation: .addChild returns the child node, so we cannot just inline .addChild calls, as we would lose the reference to the root node.
 * This function allows us to create an inline dialogue tree without having to save the root node.
 * @example
 * ```typescript
 * // Conditionally add an inline dialogue tree (branch) without having to save the root node.
    someDialogueNode.addChildIf(true, 
        createInlineDialogueTree("root of inline tree", "Inline Tree", (root) => {
            root.addChild("I'm a child of an inline tree")
                .addChild("I'm a grandchild of a child of an inline tree")
        })
    )
 * ```
 */
export function createInlineDialogueTree(rootRender: DialogueNode['render'], rootName: string, builder: (root: DialogueNode) => void) {
    const root = createDialogueNode(rootRender, rootName);
    builder(root);
    return root;
}