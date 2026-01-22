import { createEmptyDialogueNode, makeDialogueNode } from "./dialogueNode";
import { DialogueNode, DialogueOption } from "./dialogueNode.types";

type NodeSentence = {
    '$type': 'NodeSentence',
    ID: string,
    Speaker: number,
    Sentence: {
        English: string
    }
    NextID: string | -1;
}

type NodeRoot = {
    '$type': 'NodeRoot',
    'ID': string,
    NextID: string
}

type NodeChoice = {
    '$type': 'NodeChoice',
    ID: string,
    // Choices have a weird NextID we will just ignore.
    OptionsID: string[] // IDs of associated node options.
}

type NodeOption = {
    '$type': 'NodeOption',
    ID: string,
    NextID: string | -1,
    Option: {
        English: string
    }
    OneShot: boolean
}

type NodeComment = {
    '$type': 'NodeComment',
    ID: string,
}

type NodeAction = {
    '$type': 'NodeAction',
    ID: string,
    NextID: string | -1,
    Action: string,
    // Might be lazy and collapse these types down, we'll see if the strict types here provide any advantage.
    Arguments: (
        {
            Name?: string,
            Type: "Integer",
            Value: number
        } |
        {
            Name?: string,
            Type: "String",
            Value: string,
        } | {
            Name?: string,
            Type: 'Boolean',
            Value: boolean
        }
    )[]
}


export type MonoData = {
    RootNodeID: string,
    Characters: {
        ID: string
        Character: {
            Name: string
        }
    }[]
    ListNodes: (NodeSentence | NodeRoot | NodeChoice | NodeOption | NodeComment | NodeAction)[]
};



export default function parseDialogue(rawDialogue: MonoData): DialogueNode {
    const nodes = rawDialogue.ListNodes;

    // Restructure nodes to be a map by ID, instead of an array of objects containing an ID.
    // Why the JSON isn't already like this, I do not know.
    const nodesByID = Object.fromEntries(
        nodes.map(node => [node.ID, node])
    );

    const characters = rawDialogue.Characters.map(({ Character: { Name } }) => Name);

    // Going to save a map of dialogue nodes and options based on their ID in the JSON file.
    const DGDialogueNodes: Record<string, DialogueNode> = {};
    const options: Record<string, DialogueOption> = {};

    // Build initial nodes.
    for (const node of nodes) {
        switch (node.$type) {
            case "NodeSentence": {
                const text = node.Sentence.English;
                const speaker = characters[node.Speaker] ?? "SPEAKER UNDEFINED";
                DGDialogueNodes[node.ID] = makeDialogueNode(text, speaker);
                break;
            }
            case "NodeOption": {
                const text = node.Option.English;
                // TODO: Come up with syntax (i.e split on | to denote full/summary in editor.)
                options[node.ID] = {
                    fullText: text,
                    summaryText: text
                };
                break;
            }

            // Lazy solution - all actions will just be an empty node.
            case "NodeAction": {
                // Represent an action as an empty dialogue node with a sideEffect
                const diaNode = createEmptyDialogueNode();
                const actionName = node.Action;
                const args = node.Arguments.map(arg => arg.Value);

                diaNode.sideEffect = (ctx) => {
                    const fn = ctx?.actions?.[actionName];
                    if (typeof fn === "function") {
                        fn(...args);
                    }
                };

                DGDialogueNodes[node.ID] = diaNode;
                break;
            }
            default:
                break;
        }
    }

    // Wire up connections.
    for (const node of nodes) {

        // ----- NodeSentence -----
        if (node.$type === 'NodeSentence') {
            const current = DGDialogueNodes[node.ID];
            if (!current || node.NextID === -1) continue;

            const nextRaw = nodesByID[node.NextID];
            if (!nextRaw) continue;

            if (nextRaw.$type === 'NodeSentence' || nextRaw.$type === 'NodeAction') {
                current.next = DGDialogueNodes[nextRaw.ID];
            } else if (nextRaw.$type === 'NodeChoice') {
                for (const optionId of nextRaw.OptionsID) {
                    const option = options[optionId];
                    if (option) current.options.push(option);
                }
            }
        }

        // ----- NodeOption -----
        if (node.$type === 'NodeOption') {
            const option = options[node.ID];
            if (!option || node.NextID === -1) continue;

            const nextRaw = nodesByID[node.NextID];
            if (!nextRaw) continue;

            if (nextRaw.$type === "NodeSentence" || nextRaw.$type === "NodeAction") {
                option.next = DGDialogueNodes[nextRaw.ID];
            } else if (nextRaw.$type === 'NodeChoice') {
                const hinge = createEmptyDialogueNode();
                for (const chainedID of nextRaw.OptionsID) {
                    const chainedOption = options[chainedID];
                    if (chainedOption) hinge.options.push(chainedOption);
                }
                option.next = hinge;
            }
        }

        // ----- NodeAction -----
        if (node.$type === 'NodeAction') {
            const current = DGDialogueNodes[node.ID];
            if (!current || node.NextID === -1) continue;

            const nextRaw = nodesByID[node.NextID];
            if (!nextRaw) continue;

            if (nextRaw.$type === 'NodeSentence' || nextRaw.$type === 'NodeAction') {
                current.next = DGDialogueNodes[nextRaw.ID];
            } else if (nextRaw.$type === 'NodeChoice') {
                const hinge = createEmptyDialogueNode();
                for (const chainedID of nextRaw.OptionsID) {
                    const chainedOption = options[chainedID];
                    if (chainedOption) hinge.options.push(chainedOption);
                }
                current.next = hinge;
            }
        }
    }

    const rootPointer = nodesByID[rawDialogue.RootNodeID] as NodeRoot;
    return DGDialogueNodes[rootPointer.NextID];
}