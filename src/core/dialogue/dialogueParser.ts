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
    // Choices have a mysterious NextID. Just ignore it.
    OptionsID: string[] // IDs of associated node options.
}

type NodeOption = {
    '$type': 'NodeOption',
    ID: string,
    NextID: string | -1, // -1 for termination options
    Option: {
        English: string
    }
    // These also have a "OneShot" flag that could easily be used to flag options as consumable.
    OneShot: boolean
}

type NodeComment = {
    '$type': 'NodeComment',
    ID: string,
}


export type MonoData = {
    RootNodeID: string,
    Characters: {
        ID: string
        Character: {
            Name: string
        }
    }[]
    ListNodes: (NodeSentence | NodeRoot | NodeChoice | NodeOption | NodeComment)[]
};

export default function parseDialogue(rawDialogue: MonoData): DialogueNode {
    const nodes = rawDialogue.ListNodes;

    // Restructure nodes to be a map by ID, instead of an array of objects containing an ID.
    // Why the JSON isn't already like this, I do not know.
    const nodesByID = Object.fromEntries(
        nodes.map(node => [node.ID, node])
    );

    // For some reason nodes actually reference characters by index, not by ID.
    const characters = rawDialogue.Characters.map(({Character: {Name}}) => Name);

    // Going to save a map of dialogue nodes and options based on their ID in the JSON file.
    const DGDialogueNodes: Record<string, DialogueNode> = {};
    const options: Record<string, DialogueOption> = {};

    // Build and store DialogueNodes and Options, mapped by ID.
    for (const node of nodes) {
        switch(node.$type) {
            case "NodeSentence": {
                const text = node.Sentence.English;
                const speaker = characters[node.Speaker] ?? "SPEAKER UNDEFINED";
                DGDialogueNodes[node.ID] = makeDialogueNode(text, speaker);
                break;
            }
            case "NodeOption": {
                const text = node.Option.English;
                options[node.ID] = {
                    fullText: text,
                    summaryText: text
                }
                break;
            }
            default: break;
        }
    }

    // Wire up connections.
    for (const node of nodes) {
        if(node.$type == 'NodeSentence') {
            const current = DGDialogueNodes[node.ID];
            // Leaf node (or failed lookup).
            if (!current || node.NextID === -1) continue;

            const nextRaw = nodesByID[node.NextID];
            if(!nextRaw) continue;

            if(nextRaw.$type == 'NodeSentence') {
                current.next = DGDialogueNodes[nextRaw.ID];
            }
            
            if (nextRaw.$type == 'NodeChoice') {
                for(const optionId of nextRaw.OptionsID) {
                    const option = options[optionId];
                    if (option) current.options.push(option);
                }
            }
        }

        if(node.$type == 'NodeOption') {
            const option = options[node.ID];
            // Termination option (or failed lookup).
            if (!option || node.NextID == -1) continue;

            const nextRaw = nodesByID[node.NextID];
            if (!nextRaw) continue;

            if (nextRaw.$type == "NodeSentence") {
                option.next = DGDialogueNodes[nextRaw.ID];
            } 
            
            if (nextRaw.$type == 'NodeChoice') { // Chaining choices together...
                const hinge = createEmptyDialogueNode();
                for(const chainedID of nextRaw.OptionsID) {
                    const chainedOption = options[chainedID];
                    if(chainedOption) hinge.options.push(chainedOption);
                }
                option.next = hinge;
            }
        }
    }

    const rootPointer = nodesByID[rawDialogue.RootNodeID] as NodeRoot; // trusted to always be NodeRoot.
    return DGDialogueNodes[rootPointer.NextID];
}