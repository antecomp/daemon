import { MAIN_CHARACTER_NAME } from "@/config/init.config";
import { DialogueContext, DialogueOptionConfig, DialogueRender } from "./dialogueNode.types";

// Overriding the type for now.
export type DialogueNode = {
    id: string;
    name: string
    render: DialogueRender
        // Side note: Empty strings are used by the parser to represent navigational nodes that will not be shown on screen. F.e if you want to chain options together without text in between.
    options: DialogueOption[]
    next?: DialogueNode | ((ctx?: DialogueContext) => DialogueNode)

    sideEffect?: (ctx?: DialogueContext) => void,
    waitFor?: (ctx?: DialogueContext) => Promise<void>
}

export type RenderOrNode = DialogueRender | DialogueNode

export interface DialogueOption extends DialogueOptionConfig {
    summaryText: string
    fullText: string
    next?: DialogueNode | ((ctx?: DialogueContext) => DialogueNode)
}

export const EMPTY_RENDER = "";
export const VISUALIZER = "VISUALIZER";

function isNode(x: any): x is DialogueNode {
    return typeof x === 'object' && 'id' in x;
}

let nodeCounter = 0;

function makeDialogueNode(render: DialogueRender, name: string): DialogueNode {
    const id = `node-${nodeCounter++}`;
    return {
        id,
        name,
        render,
        options: []
    }
}

export class DialogueNodeBuilder {
    constructor(public readonly node: DialogueNode) {};

    /* Attach a linear successor to node & return builder for it. */
    next(
        renderOrNode: RenderOrNode, 
        name?: string
    ): DialogueNodeBuilder {
        if(isNode(renderOrNode)) {
            this.node.next = renderOrNode;
            return new DialogueNodeBuilder(renderOrNode);
        }

        const child = makeDialogueNode(renderOrNode, name ?? this.node.name);
        this.node.next = child;
        return new DialogueNodeBuilder(child);
    }

    n( renderOrNode: RenderOrNode, name?: string) {
        return this.next(renderOrNode, name);
    }

    chain(...messages: RenderOrNode[]): DialogueNodeBuilder {
        let cur: DialogueNodeBuilder = this;
        messages.forEach(message => {
            cur = cur.n(message);
        });
        return cur;
    }

    chainAlt(first: string, second: string, ...messages: RenderOrNode[]): DialogueNodeBuilder {
        let cur: DialogueNodeBuilder = this;
        messages.forEach((m, i) => {
            cur = cur.n(m, i % 2 === 0 ? first : second);
        });
        return cur;
    }

    option(
        optionText: [string, string] | string,
        renderOrNode?: RenderOrNode,
        name?: string,
        optionConfig?: DialogueOptionConfig
    ): DialogueNodeBuilder {
        const summaryText = typeof optionText == 'string'
            ? optionText
            : optionText[0]
        const fullText = typeof optionText == 'string'
            ? optionText
            : optionText[1]
        // Existing Node.
        if(renderOrNode && isNode(renderOrNode)) {
            this.node.options.push({summaryText, fullText, next: renderOrNode, ...optionConfig});;
            return new DialogueNodeBuilder(renderOrNode);
        }
        if(renderOrNode) {
            const child = makeDialogueNode(renderOrNode, name ?? MAIN_CHARACTER_NAME);
            this.node.options.push({summaryText, fullText, next: child, ...optionConfig});
            return new DialogueNodeBuilder(child);
        }
        // termination option
        this.node.options.push({summaryText, fullText, ...optionConfig});
        return this; // stay at current node, nothing was attached.
    }

    car(
        summaryText: string,
        callText: string,
        response: RenderOrNode,
        responderName?: string,
        optionConfig?: DialogueOptionConfig
    ): DialogueNodeBuilder {
        const callNode = makeDialogueNode(callText, MAIN_CHARACTER_NAME);
        this.node.options.push({summaryText, fullText: callText, next: callNode, ...optionConfig});

        if(isNode(response)) {
            callNode.next = response;
            return new DialogueNodeBuilder(response);
        }

        const respNode = makeDialogueNode(response, responderName ?? this.node.name);
        callNode.next = respNode;
        return new DialogueNodeBuilder(respNode);
    }

    attachSideEffect(ef: ((ctx?: DialogueContext | undefined) => void)) {
        this.node.sideEffect = ef;
        return this;
    }

    makeNodeWaitFor(wf: (ctx?: DialogueContext) => Promise<void>): DialogueNodeBuilder {
        this.node.waitFor = wf;
        return this;
    }

    unwrap(): DialogueNode {
        return this.node;
    }


    // EXPERIMENTING TO GET RID OF THAT GOD-FORSAKEN COLLAPSE POINT STUFF.
    private _branchTails?: DialogueNode[];

    private initializeBranches() {
        if(!this._branchTails) this._branchTails = [];
    }

    addBranch(
        optionText: [string, string] | string,
        root: DialogueNode | [DialogueRender, string], // Either a node or a render + name.
        // Anticipating that this returns the tail. r => r.n("nklsfd").n("sdfjsdfkj")
        // the result of this is attached to _caseTails.
        subtreeBuilder?: (r: DialogueNodeBuilder) => DialogueNodeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        this.initializeBranches();

        const rootNode = isNode(root)
            ? root
            : makeDialogueNode(root[0], root[1]);
        
        const rootBuilder = this.option(optionText, rootNode, undefined, optionConfig);

        const tailNode = subtreeBuilder
            ? subtreeBuilder(rootBuilder).node
            : rootNode

        this._branchTails?.push(tailNode);
        
        return this;
    }

    addCarBranch(
        summaryText: string,
        callText: string,
        response: DialogueNode | [DialogueRender, string] | DialogueRender,
        subtreeBuilder?: (r: DialogueNodeBuilder) => DialogueNodeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        this.initializeBranches();

        // why.
        const responseNode = isNode(response)
            ? response
            : typeof response == 'string' || typeof response == 'function'
                ? makeDialogueNode(response, this.node.name)
                : makeDialogueNode(response[0], response[1])

        const responseBuilder = this.car(summaryText, callText, responseNode, undefined, optionConfig);

        const tailNode = subtreeBuilder
            ? subtreeBuilder(responseBuilder).node
            : responseNode

        this._branchTails?.push(tailNode);

        return this;
    }

    // Join all branches to a single collapse node, allowing us to continue off it.
    joinBranches(
        joinPoint: RenderOrNode,
        name?: string
    ) {
        if (!this._branchTails) throw new Error("Cannot join Dialogue Branches as none are defined off this node.");
        const tails = this._branchTails;
        const joinNode = isNode(joinPoint)
            ? joinPoint
            : makeDialogueNode(joinPoint, name ?? this.node.name);
        for (const t of tails) t.next = joinNode;
        this._branchTails = undefined; // clear.
        return new DialogueNodeBuilder(joinNode);
    }


    // VERY BASIC HELPER THAT LETS YOU DO A LOT OF COOL STUFF EASILY LOL.
    // CAN BE USED FOR INLINE TREES, ATTACHING SHIT, WHATEVER, ELIMINATING NEED FOR VARIANTS!!!
    // Performs whatever tasks you want on the node, but then returns it as-is (instead of handing back children or whatever.)
    do(fn: (b: DialogueNodeBuilder) => void) {
        fn(this);
        return this;
    }

}

export function inline(render: DialogueRender, name: string, fn: (rb: DialogueNodeBuilder) => void): DialogueNode {
    const root = makeDialogueNode(render, name);
    const rb = new DialogueNodeBuilder(root);
    fn(rb); // build subtree here.
    return root; // but return the root to be attached.
}

export function createDialogueBuilder(render: DialogueRender, name: string = MAIN_CHARACTER_NAME): DialogueNodeBuilder {
    return new DialogueNodeBuilder(makeDialogueNode(render, name));
}