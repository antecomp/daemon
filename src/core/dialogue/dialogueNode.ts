import { DialogueContext, DialogueNode, DialogueRender } from "./dialogueNode.types";

/** Represents the render for a textless dialogue node.
 * these are skipped while parsing and used for hinge points or to chain options together.  */
export const EMPTY_RENDER = "";

/** Special name to show a visualization box instead of a typical message box. */
export const VISUALIZER = "VISUALIZER";

export let nodeCounter = 0;
/** Factory function to create a new dialogue node. 
 * Usually this is *not* what you want to use, but rather the dialogue node *builder* @ref `dialogueBuilder.ts` */
export function makeDialogueNode(render: DialogueRender, name: string): DialogueNode {
    const id = `node-${nodeCounter++}`;
    return {
        id,
        name,
        render,
        options: []
    };
}

/** Simple helper to collapse a dialogue nodes next (either a ref to another node, or a function that returns the ref) to just the ref */
export function evalDialogueNodeNext(next: DialogueNode['next'], ctx?: DialogueContext) {
    if (typeof next == "function") {
        return next(ctx)
    } else {
        return next;
    }
}

/** Generates a new dialogue node with empty renders. 
 * This dialogue node is not rendered when parsed, and is used as a hinge point 
 * for chaining options or other operations.  */
export function createEmptyDialogueNode() {
    return makeDialogueNode(EMPTY_RENDER, EMPTY_RENDER);
}


// Misc Utility Stuff;

export function isDialogueNodeEmpty(node: DialogueNode) {
    // functional version shouldn't be used to encode to render, that's super risky with logic.
    return node.render == EMPTY_RENDER;
}

// (for type narrowing)
export function isNode(x: any): x is DialogueNode {
    return typeof x === 'object' && 'id' in x;
}

export function normalizeOptionText(optionText: [string, string] | string) {
    return typeof optionText === "string"
        ? { summaryText: optionText, fullText: optionText }
        : { summaryText: optionText[0], fullText: optionText[1] };
}


