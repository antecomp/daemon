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