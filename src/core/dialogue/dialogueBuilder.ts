import { MAIN_CHARACTER_NAME } from "@/config/init.config";
import { DialogueNode, DialogueContext, DialogueOptionConfig, DialogueRender, DialogueOption, RenderOrNode, OptionConstructorText } from "./dialogueNode.types";
import { EMPTY_RENDER, isNode, makeDialogueNode, normalizeOptionText } from "./dialogueNode";

type DialogueSubtreeBuilder = (root: DialogueNodeBuilder) => DialogueNodeBuilder;

/**
 * DialogueNodeBuilder is a wrapper class for DialogueNode that allows 
 * for construction of dialogue trees using several utility functions.
 * @remark - If you are trying to start a new dialogue tree with some render/name, use the factory function `createDialogueBuilder` instead.
 */
export class DialogueNodeBuilder {
    constructor(public readonly node: DialogueNode) { };

    /**
     * Creates a new, or attaches an existing, child dialogue node.
     * @param next Either a render (for creating a new dialogue node) or an existing dialogue node.
     * @param name (optional) A name to be used when creating a new dialogue node. 
     *              If none is supplied, the name is inherited from the node this is being attached to.
     * @returns The attached dialogue node (traverses into it).
     */
    then(
        next: RenderOrNode,
        name?: string
    ): DialogueNodeBuilder {
        if (isNode(next)) {
            this.node.next = next;
            return new DialogueNodeBuilder(next);
        }

        const child = makeDialogueNode(next, name ?? this.node.name);
        this.node.next = child;
        return new DialogueNodeBuilder(child);
    }

    /**
     * Attach a sequence of dialogue nodes, created from any number of renders/nodes.
     * @param messages Any number of dialogue renders to be attached in sequence.
     * @remark - The nodes created by using chain inherit the name from the node they are being attached to.
     * @returns The node at the end of the chain (traverses into it).
     */
    chain(...messages: RenderOrNode[]): DialogueNodeBuilder {
        let cur: DialogueNodeBuilder = this;
        messages.forEach(message => {
            cur = cur.then(message);
        });
        return cur;
    }

    /**
     * Attaches a sequence of dialogue nodes, where the speakers are alternated (for back and fourth dialogue)
     * @param first - Name of the speaker who sends the first message.
     * @param second - Name of the speaker who sends the second message.
     * @param messages - Remaining arguments are dialogue nodes/renders used for the stream of messages.
     * @returns 
     */
    chainAlt(first: string, second: string, ...messages: RenderOrNode[]): DialogueNodeBuilder {
        let cur: DialogueNodeBuilder = this;
        messages.forEach((m, i) => {
            cur = cur.then(m, i % 2 === 0 ? first : second);
        });
        return cur;
    }

    /**
     * Attaches a new option to the node, along with generating an optional connected node & subtree for that option.
     * @param optionText - Tuple of [summaryText, fullText], or, if both are the same, just a string.
     * @param connection (optional) - An existing (or render to make new) node that the option should connect to.
     * @param subtreeBuilder - A subtreebuilder, which is a callback that takes the entry node and can run builder methods on it to create a subtree.
     *                         This method is expected to return the tail of the newely created subtree to function properly.
     * @param optionConfig - Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.
     * @returns
     *  - When just a connected node (entry) is provided: This returns that node (traverses into it).
     *  - When a subtreeBuilder is provided: This returns the tail of the generated subtree.
     *  - When no connected node/subtree is provided; this is a **termination option** (alias for ending dialogue). Thus will return the current node.
     */
    option(
        optionText: OptionConstructorText,
        connection?: DialogueNode | [DialogueRender, string], // Either a node or a render + name.
        subtreeBuilder?: DialogueSubtreeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        const { summaryText, fullText } = normalizeOptionText(optionText);

        if (!connection) { // Termination option - cannot build subtree off of nothing.
            this.node.options.push({ summaryText, fullText, ...optionConfig });
            return this;
        }

        const rootNode = isNode(connection)
            ? connection
            : makeDialogueNode(connection[0], connection[1]);

        const rootBuilder = new DialogueNodeBuilder(rootNode);

        this.node.options.push({ summaryText, fullText, next: rootNode, ...optionConfig });

        // User of option is expected to handle making and setting up the subtree.
        // For more handy branching that converges, use the branch system instead.
        return subtreeBuilder?.(rootBuilder) ?? rootBuilder;
    }

    /**
     * Variant of `.option` that instead returns the current node (does not traverse into option tree). Used to chain option additions together.
     * 
     * Attaches a new option to the node, along with generating an optional connected node & subtree for that option.
     * @param optionText - Tuple of [summaryText, fullText], or, if both are the same, just a string.
     * @param entry (optional) - An existing (or render to make new) node that the option should connect to.
     * @param subtreeBuilder - A subtreebuilder, which is a callback that takes the entry node and can run builder methods on it to create a subtree.
     *                         This method is expected to return the tail of the newely created subtree to function properly.
     * @param optionConfig - Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.
     * @returns - `this`
     */
    addOption(
        optionText: OptionConstructorText,
        entry?: DialogueNode | [DialogueRender, string],
        subtreeBuilder?: DialogueSubtreeBuilder,
        optionConfig?: DialogueOptionConfig
    ): DialogueNodeBuilder {
        // Reuse option(...) for attachment, but ignore its return value
        this.option(optionText, entry, subtreeBuilder, optionConfig);
        return this;
    }

    /**
     * "car" represents a "call and response," a streamlined way to make an option also send as a dialogue node, sent from the player (the "call")
     * and to automatically invoke some sort of connected "response" dialogue node connected to the call.
     * Used for easy send message -> get response style chains.
     * @param call - The option text to use for making the call. Either a tuple [summaryText, fullText], or, if they are the same, just a string.
     *      - the `fullText` will be used as the contents of the message sent by the player.
     * @param response - The node that will be attached to the "call" (player message) node. 
     *  - Can be an existing dialogue node.
     *  - Can be a tuple [DialogueRender, string] for a render and the name of the speaker (create a new dialogue node)
     *  - Can also just be a DialogueRender, where the name will be inherited from the node this is being attached to.
     * @param subtreeBuilder 
     *  - A callback for generating a subtree off of the response node. This callback is expected to return the *tail* of the created subtree to function properly.
     * @param optionConfig - Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.
     * @returns 
     * - When just using `response`: Returns the created response node (traverses into it).
     * - When using a subtreeBuilder: Returns the tail of the created subtree.
     */
    car(
        call: OptionConstructorText,
        response: DialogueNode | [DialogueRender, string] | DialogueRender,
        subtreeBuilder?: DialogueSubtreeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        const { summaryText, fullText } = normalizeOptionText(call);

        const callNode = makeDialogueNode(fullText, MAIN_CHARACTER_NAME);
        this.node.options.push({ summaryText, fullText, next: callNode, ...optionConfig });

        const responseNode = isNode(response)
            ? response
            : typeof response === 'string' || typeof response === 'function'
                ? makeDialogueNode(response, this.node.name)
                : makeDialogueNode(response[0], response[1])

        callNode.next = responseNode;

        const responseBuilder = new DialogueNodeBuilder(responseNode);

        return subtreeBuilder?.(responseBuilder) ?? responseBuilder;
    }

    /**
     * Variant of `.car` that instead returns the current node (does not traverse into response tree). Used to chain car additions together.
     * 
     * "car" represents a "call and response," a streamlined way to make an option also send as a dialogue node, sent from the player (the "call")
     * and to automatically invoke some sort of connected "response" dialogue node connected to the call.
     * Used for easy send message -> get response style chains.
     * @param call - The option text to use for making the call. Either a tuple [summaryText, fullText], or, if they are the same, just a string.
     *      - the `fullText` will be used as the contents of the message sent by the player.
     * @param response - The node that will be attached to the "call" (player message) node. 
     *  - Can be an existing dialogue node.
     *  - Can be a tuple [DialogueRender, string] for a render and the name of the speaker (create a new dialogue node)
     *  - Can also just be a DialogueRender, where the name will be inherited from the node this is being attached to.
     * @param subtreeBuilder 
     *  - A callback for generating a subtree off of the response node. This callback is expected to return the *tail* of the created subtree to function properly.
     * @param optionConfig - Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.
     * @returns 
     * - When just using `response`: Returns the created response node (traverses into it).
     * - When using a subtreeBuilder: Returns the tail of the created subtree.
     */
    addCar(
        call: OptionConstructorText,
        response: DialogueNode | [DialogueRender, string] | DialogueRender,
        subtreeBuilder?: DialogueSubtreeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        // Reuse car(...) for attachment, but ignore its return value
        this.car(call, response, subtreeBuilder, optionConfig);
        return this;
    }

    /**
     * Helper to attach a side effect to the current dialogue node.
     * @param ef - The side effect to attach, takes DialogueContext as an argument.
     * @returns - `this` (to chain)
     */
    attachSideEffect(ef: ((ctx?: DialogueContext | undefined) => void)) {
        this.node.sideEffect = ef;
        return this;
    }

    /**
     * Helper to attach a `waitFor` to the current dialogue node.
     * @param wf The async blocking method to attach, takes DialogueContext as an argument.
     * @returns `this` (to chain)
     */
    makeNodeWaitFor(wf: (ctx?: DialogueContext) => Promise<unknown>): DialogueNodeBuilder {
        this.node.waitFor = wf;
        return this;
    }

    /**
     * Extracts the DialogueNode instance contained within this wrapper class.
     * This is what you need to actually send off to startDialogue.
     * @returns The dialogue node associated with this builder.
     */
    unwrap(): DialogueNode {
        return this.node;
    }


    private _branchTails?: DialogueNode[];

    private initializeBranches() {
        if (!this._branchTails) this._branchTails = [];
    }

    /**
     * Generates a new **branch** for the dialogue system. Branches are option-attached subtrees 
     * in which the tail of is *cached* for the current builder. Allowing these tails to be unified later with merge or join branches.
     * Works in a similar fashion to addOption, but anticipates a connecting node.
     * @param optionText Tuple of [summaryText, fullText], or, if both are the same, just a string.
     * @param head - Top of the branch to create (Existing node or a tuple of a dialogue render and name)
     * @param subtreeBuilder - Callback that takes the head node and extends it into a subtree. Expected to return tail of created subtree.
     * @param optionConfig - Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.
     * @returns `this` (for chaining)
     */
    addBranch(
        optionText: OptionConstructorText,
        head: DialogueNode | [DialogueRender, string], // Either a node or a render + name.
        // Anticipating that this returns the tail. r => r.n("nklsfd").n("sdfjsdfkj")
        // the result of this is attached to _caseTails.
        subtreeBuilder?: (r: DialogueNodeBuilder) => DialogueNodeBuilder,
        optionConfig?: DialogueOptionConfig
    ) {
        this.initializeBranches();

        const rootNode = isNode(head)
            ? head
            : makeDialogueNode(head[0], head[1]);

        this.option(optionText, rootNode, undefined, optionConfig);

        const rootBuilder = new DialogueNodeBuilder(rootNode);

        const tailNode = subtreeBuilder
            ? subtreeBuilder(rootBuilder).node
            : rootNode

        this._branchTails?.push(tailNode);

        return this;
    }
    /**
     * Car variant of addBranch. Car stands for "call and response" - makes the option fullText a message sent by the player, immediately followed by some 'response' node.
     * @ref `.car` method of this class for more details.
     * 
     * Generates a new **branch** for the dialogue system. Branches are option-attached subtrees 
     * in which the tail of is *cached* for the current builder. Allowing these tails to be unified later with merge or join branches.
     * Works in a similar fashion to addOption, but anticipates a connecting node.
     * @param call - The option text to use for making the call. Either a tuple [summaryText, fullText], or, if they are the same, just a string.
     *      - the `fullText` will be used as the contents of the message sent by the player.
     * @param response - The response node, also serves as the head of the subtree.
     * @param subtreeBuilder - Callback that takes the response node and extends it into a subtree. Expected to return tail of created subtree.
     * @param optionConfig - Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.
     * @returns `this` (for chaining)
     */
    addCarBranch(
        call: OptionConstructorText,
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

        const responseBuilder = this.car([summaryText, callText], responseNode, undefined, optionConfig);

        const tailNode = subtreeBuilder
            ? subtreeBuilder(responseBuilder).node
            : responseNode

        this._branchTails?.push(tailNode);

        return this;
    }

    /**
     * Joins all set branches to a single collapse node (as in, make the .next of each branches tail point to this node.)
     * @param joinPoint - The node to join to (either an existing node or a render to use)
     * @param name (optional) - Name used for the join node if creating a new one with a render. 
     *              If none is provided, the name is inherited from the node this join is attaching to.
     * @returns - The new join node (traverses into it)
     */
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


    /**
     * A variant of `.joinBranches` that instead merges the current branches into a *new* singular branch instead, allowing for early join points.
     * @param joinPoint - The node to join to (either an existing node or a render to use)
     * @param subtreeBuilder - A subtree builder that starts off of the join point. 
     * @returns `this` (for chaining)
     */
    mergeBranches(
        joinPoint: DialogueNode | [DialogueRender, string],
        subtreeBuilder?: (r: DialogueNodeBuilder) => DialogueNodeBuilder // Build a subtree here so we can get its tail!
    ) {
        if (!this._branchTails) throw new Error("Cannot merge dialogue branches as none are defined off this node.");
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

    /**
     * questionLoop creates a self-contained looping subtree of "question" options in which...
     *  - when the player asks a question, this question has some associated answer (and subtree) which loops back to some loopback prompt (e.g "any more questions?")
     * -  when a question is answered, it is hidden as an option in subsequent loops.
     * - When all questions are exhausted, an "exhausted" message can be displayed and the loop is exited
     * - The question loop can be optionally allowed to exit early with some option (e.g "I am done asking questions").
     * @param loopbackPrompt - The prompt node that is displayed when *looping back*. For example this is something like "any more questions?"
     * @param exhausted - The node that is displayed when all questions have been exhausted.
     * @param exitOption - (optional, can be `undefined`) An option to exit the questions early.
     * @param questions - An array of questions that can be asked, where each question consists of...
     *      - `id` - A unique id for the question (used to track what has been asked)
     *      - `option` - The option info for the question. Either a [summary, fulltext] tuple, or, if they are the same, just a string.
     *      - `answer` - Render for the answer node.
     *      - `answerName` (optional) - Name to be associated with answer node. If none is provided, name in inherited from the node this question loop branches from.
     * @param earlyExitMessage (optional) - Message to render if the player uses the exitOption, often used for MC to send a message like "I am done asking questions now..."
     * @returns - An empty "exit node" from the loop, for traversing out of the question loop ending.
     */
    questionLoop(
        // Not doing nodes for these first two as we don't want to accidentally modify an existing node. Always make something new.
        // initialPrompt not needed - we just attach to the initial prompt when we call this.
        loopbackPrompt: DialogueRender | [DialogueRender, string],
        exhausted: DialogueRender | [DialogueRender, string],
        exitOption: OptionConstructorText | undefined, // undef for only allow exit on exhaustion.
        questions: {
            id: string,
            option: OptionConstructorText,
            answer: DialogueRender,
            answerName?: string,
            builder?: DialogueSubtreeBuilder // anticipate tail for attaching loopback/exhaustion automatically.
        }[],
        // Do we also make a 'response' node for the exitOption (right now this jumps directly into the exitNode)
        // This can be separate (even if that requires rewriting some stuff)
        earlyExitMessage?: DialogueRender | [DialogueRender, string]
    ) {

        const loopbackNode = typeof loopbackPrompt == 'string' || typeof loopbackPrompt == 'function'
            ? makeDialogueNode(loopbackPrompt, this.node.name)
            : makeDialogueNode(loopbackPrompt[0], loopbackPrompt[1])

        const exthaustedNode = typeof exhausted == 'string' || typeof exhausted == 'function'
            ? makeDialogueNode(exhausted, this.node.name)
            : makeDialogueNode(exhausted[0], exhausted[1])

        // Maybe there's a better way of doing this, but this is good enough for now.
        const exitNode = makeDialogueNode(EMPTY_RENDER, this.node.name);

        exthaustedNode.next = exitNode;

        const consumedQuestions = new Set<string>();

        const allQuestionsExhausted = () => questions.map(q => q.id).every(q => consumedQuestions.has(q));

        for (const question of questions) {
            //  - Need head to attach to question
            //  - Need tail to attach connection to loopback/exhuastion.
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
                onlyShowWhen() { return !consumedQuestions.has(question.id) },
                sideEffect() { consumedQuestions.add(question.id) },
                next: headNode
            }

            this.node.options.push(qop);
            loopbackNode.options.push(qop);
        }

        if (exitOption) {
            if (earlyExitMessage) {
                const earlyExitNode = typeof earlyExitMessage == 'string' || typeof earlyExitMessage == 'function'
                    ? makeDialogueNode(earlyExitMessage, MAIN_CHARACTER_NAME)
                    : makeDialogueNode(earlyExitMessage[0], earlyExitMessage[1])

                earlyExitNode.next = exitNode;
                this.node.options.push({ ...normalizeOptionText(exitOption), next: earlyExitNode })
                loopbackNode.options.push({ ...normalizeOptionText(exitOption), next: earlyExitNode });
            } else {
                this.node.options.push({ ...normalizeOptionText(exitOption), next: exitNode })
                loopbackNode.options.push({ ...normalizeOptionText(exitOption), next: exitNode });
            }
        }

        return new DialogueNodeBuilder(exitNode); // We then build off the unified exit node.
    }

    /**
     * Helper to perform various tasks on the current dialogue node without traversal. (simply returns `this`)
     * @param fn - Function that takes in the current node (to perform whatever actions)
     * @returns - `this` (for chaining)
     */
    do(fn: (b: DialogueNodeBuilder) => void) {
        fn(this);
        return this;
    }


    // Aliases --------------------------------------------------------------------
    t(renderOrNode: RenderOrNode, name?: string) {
        return this.then(renderOrNode, name);
    }

}

/**
 * Way to create inline dialogue trees by configuring the root node (with a render and name), then running a builder callback on the root.
 * @param render - DialogueRender for the root node.
 * @param name - Name of the speaker for the root node.
 * @param fn - Function that builds out the inline subtree (with its head being the root created above).
 * @returns the root such that this inline tree can be attached to something else.
 */
export function inline(render: DialogueRender, name: string, fn: (rb: DialogueNodeBuilder) => void): DialogueNode {
    const root = makeDialogueNode(render, name);
    const rb = new DialogueNodeBuilder(root);
    fn(rb); // build subtree here.
    return root; // but return the root to be attached.
}

/** Factory function to create a new DialogueNodeBuilder, given some render and name for the speaker. */
export function createDialogueBuilder(render: DialogueRender, name: string): DialogueNodeBuilder {
    return new DialogueNodeBuilder(makeDialogueNode(render, name));
}