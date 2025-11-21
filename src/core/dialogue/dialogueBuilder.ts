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

export function makeDialogueNode(render: DialogueRender, name: string): DialogueNode {
    const id = `node-${nodeCounter++}`;
    return {
        id,
        name,
        render,
        options: []
    }
}

function normalizeOptionText(optionText: [string, string] | string) {
  return typeof optionText === "string"
    ? { summaryText: optionText, fullText: optionText }
    : { summaryText: optionText[0], fullText: optionText[1] };
}

type DialogueSubtreeBuilder = (root: DialogueNodeBuilder) => DialogueNodeBuilder;

export class DialogueNodeBuilder {
    constructor(public readonly node: DialogueNode) {};

    /* Attach a linear successor to node & return builder for it. */
    then(
        next: RenderOrNode, 
        name?: string
    ): DialogueNodeBuilder {
        if(isNode(next)) {
            this.node.next = next;
            return new DialogueNodeBuilder(next);
        }

        const child = makeDialogueNode(next, name ?? this.node.name);
        this.node.next = child;
        return new DialogueNodeBuilder(child);
    }

    chain(...messages: RenderOrNode[]): DialogueNodeBuilder {
        let cur: DialogueNodeBuilder = this;
        messages.forEach(message => {
            cur = cur.then(message);
        });
        return cur;
    }

    chainAlt(first: string, second: string, ...messages: RenderOrNode[]): DialogueNodeBuilder {
        let cur: DialogueNodeBuilder = this;
        messages.forEach((m, i) => {
            cur = cur.then(m, i % 2 === 0 ? first : second);
        });
        return cur;
    }

    // ENTER THE OPTION SUBTREE.
    option(
        optionText: [string, string] | string,
        entry?: DialogueNode | [DialogueRender, string], // Either a node or a render + name.
        subtreeBuilder?: DialogueSubtreeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        const { summaryText, fullText } = normalizeOptionText(optionText);

        if(!entry) { // Termination option - cannot build subtree off of nothing.
            this.node.options.push({summaryText, fullText, ...optionConfig});
            return this;
        }

        const rootNode = isNode(entry)
            ? entry
            : makeDialogueNode(entry[0], entry[1]);

        const rootBuilder = new DialogueNodeBuilder(rootNode);

        this.node.options.push({summaryText, fullText, next: rootNode, ...optionConfig});

        // User of option is expected to handle making and setting up the subtree.
        // For more handy branching that converges, use the branch system instead.
        return subtreeBuilder?.(rootBuilder) ?? rootBuilder;
    }

    // ADD OPTION BUT STAY AT PARENT.
    addOption(
        optionText: [string, string] | string,
        entry?: DialogueNode | [DialogueRender, string],
        subtreeBuilder?: DialogueSubtreeBuilder,
        optionConfig?: DialogueOptionConfig
    ): DialogueNodeBuilder {
        // Reuse option(...) for attachment, but ignore its return value
        this.option(optionText, entry, subtreeBuilder, optionConfig);
        return this;
    }

    car(
        call: [string, string] | string,
        response: DialogueNode | [DialogueRender, string] | DialogueRender,
        subtreeBuilder?: DialogueSubtreeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        const { summaryText, fullText } = normalizeOptionText(call);

        const callNode = makeDialogueNode(fullText, MAIN_CHARACTER_NAME);
        this.node.options.push({summaryText, fullText, next: callNode, ...optionConfig});

        const responseNode = isNode(response)
            ? response
            : typeof response === 'string' || typeof response === 'function'
            ? makeDialogueNode(response, this.node.name)
            : makeDialogueNode(response[0], response[1])

        callNode.next = responseNode;

        const responseBuilder = new DialogueNodeBuilder(responseNode);

        return subtreeBuilder?.(responseBuilder) ?? responseBuilder;
    }

    // STAY IN PLACE
    addCar(
        call: [string, string] | string,
        response: DialogueNode | [DialogueRender, string] | DialogueRender,
        subtreeBuilder?: DialogueSubtreeBuilder,
        optionConfig?: DialogueOptionConfig        
    ) {
        // Reuse car(...) for attachment, but ignore its return value
        this.car(call, response, subtreeBuilder, optionConfig);
        return this;
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

        this.option(optionText, rootNode, undefined, optionConfig);

        const rootBuilder = new DialogueNodeBuilder(rootNode);

        const tailNode = subtreeBuilder
            ? subtreeBuilder(rootBuilder).node
            : rootNode

        this._branchTails?.push(tailNode);
        
        return this;
    }

    addCarBranch(
        call: [string, string] | string,
        response: DialogueNode | [DialogueRender, string] | DialogueRender,
        subtreeBuilder?: (r: DialogueNodeBuilder) => DialogueNodeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        this.initializeBranches();

        const { summaryText, fullText: callText } = normalizeOptionText(call);

        // why.
        const responseNode = isNode(response)
            ? response
            : typeof response == 'string' || typeof response == 'function'
                ? makeDialogueNode(response, this.node.name)
                : makeDialogueNode(response[0], response[1])

        const responseBuilder = this.car([summaryText, callText], response, undefined, optionConfig);

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
    
    // Merge branches into a single branch, combinining subtrees, but without advancing to the join node.
    mergeBranches(
        joinPoint: DialogueNode | [DialogueRender, string],
        subtreeBuilder?: (r: DialogueNodeBuilder) => DialogueNodeBuilder // Build a subtree here so we can get its tail!
    ) {
        if(!this._branchTails) throw new Error("Cannot merge dialogue branches as none are defined off this node.");
        const tails = this._branchTails;

        const joinNode = isNode(joinPoint)
            ? joinPoint
            : makeDialogueNode(joinPoint[0], joinPoint[1]);

        for (const t of tails) t.next = joinNode;

        const joinBuilder = new DialogueNodeBuilder(joinNode);

        const mergedTail = subtreeBuilder
            ? subtreeBuilder(joinBuilder).node
            : joinNode

        this._branchTails = [mergedTail];

        return this;
    }


    questionLoop(
        // Not doing nodes for these first two as we don't want to accidentally modify an existing node. Always make something new.
        // initialPrompt not needed - we just attach to the initial prompt when we call this.
        loopbackPrompt: DialogueRender | [DialogueRender, string],
        exhausted: DialogueRender | [DialogueRender, string],
        exitOption: [string, string] | string | undefined, // undef for only allow exit on exhaustion.
        questions: {
            id: string,
            option: [string, string] | string,
            answer: DialogueRender,
            answerName?: string,
            builder?: DialogueSubtreeBuilder // anticipate tail for attaching loopback/exhaustion automatically.
        }[],
    ) {

        const loopbackNode = typeof loopbackPrompt == 'string' || typeof loopbackPrompt == 'function'
            ? makeDialogueNode(loopbackPrompt, this.node.name)
            : makeDialogueNode(loopbackPrompt[0], loopbackPrompt[1])

        const exthaustedNode = typeof exhausted == 'string' || typeof exhausted == 'function'
            ? makeDialogueNode(exhausted, this.node.name)
            : makeDialogueNode(exhausted[0], exhausted[1])

        // Maybe there's a better way of doing this, but this is good enough for now.
        const exitNode = makeDialogueNode(EMPTY_RENDER, this.node.name);

        const consumedQuestions = new Set<string>();

        const allQuestionsExhausted = () => questions.map(q => q.id).every(q => consumedQuestions.has(q));

        for(const question of questions) {

            //  - Need head to attach to question
            //  - Need tail to attach connection to loopback/exhuastion.
            //const headNode = makeDialogueNode(question.answer, question.answerName ?? this.node.name);
            const headNode = typeof question.option == 'string'
                ? makeDialogueNode(question.option, MAIN_CHARACTER_NAME)
                : makeDialogueNode(question.option[1], MAIN_CHARACTER_NAME)
            const head = new DialogueNodeBuilder(headNode);

            const answerRoot = head.then(question.answer, question.answerName ?? this.node.name);

            const tail = question.builder
                ? question.builder(answerRoot)
                : answerRoot;

            tail.node.next = () => allQuestionsExhausted()
                ? exthaustedNode
                : loopbackNode

            const qop: DialogueOption = {
                ...normalizeOptionText(question.option),
                onlyShowWhen() {return !consumedQuestions.has(question.id)},
                sideEffect() {consumedQuestions.add(question.id)},
                next: headNode
            }

            this.node.options.push(qop);
            loopbackNode.options.push(qop);
        }

        if(exitOption) {
                this.node.options.push({...normalizeOptionText(exitOption), next: exitNode})
                loopbackNode.options.push({...normalizeOptionText(exitOption), next: exitNode});
        }

        return new DialogueNodeBuilder(exitNode); // We then build off the unified exit node.
    }


    // VERY BASIC HELPER THAT LETS YOU DO A LOT OF COOL STUFF EASILY LOL.
    // CAN BE USED FOR INLINE TREES, ATTACHING SHIT, WHATEVER, ELIMINATING NEED FOR VARIANTS!!!
    // Performs whatever tasks you want on the node, but then returns it as-is (instead of handing back children or whatever.)
    do(fn: (b: DialogueNodeBuilder) => void) {
        fn(this);
        return this;
    }


    // Aliases --------------------------------------------------------------------
    t( renderOrNode: RenderOrNode, name?: string) {
        return this.then(renderOrNode, name);
    }

}

export function inline(render: DialogueRender, name: string, fn: (rb: DialogueNodeBuilder) => void): DialogueNode {
    const root = makeDialogueNode(render, name);
    const rb = new DialogueNodeBuilder(root);
    fn(rb); // build subtree here.
    return root; // but return the root to be attached.
}

export function createDialogueBuilder(render: DialogueRender, name: string): DialogueNodeBuilder {
    return new DialogueNodeBuilder(makeDialogueNode(render, name));
}