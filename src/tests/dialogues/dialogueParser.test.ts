import parseDialogue, { MonoData } from "@/core/dialogue/dialogueParser";
//import parseDialogue, {MonoData} from "@/core/dialogue/exampleParser";
import {describe, it, expect, vi} from "vitest";
import { EMPTY_RENDER } from "@/core/dialogue/dialogueNode";

import { DialogueNode } from "@/core/dialogue/dialogueNode.types";

function evalDialogueNodeNext(node: DialogueNode | (() => DialogueNode) | undefined) {
    if (typeof node == "function") {
        return node()
    } else {
        return node;
    }
}

export function extractAllDialogueNodes(root: DialogueNode): DialogueNode[] {
  const visited = new Set<DialogueNode>();
  const acc: DialogueNode[] = [];

  const rec = (current: DialogueNode | undefined) => {
    if (!current || visited.has(current)) return;
    visited.add(current);
    acc.push(current);

    if (current.next) rec(evalDialogueNodeNext(current.next));
    current.options.forEach(option => rec(option.next && evalDialogueNodeNext(option.next)));
  };

  rec(root);
  return acc;
}

import dia_basic_raw from "./basic.json";
import dia_chain_raw from "./chain.json";
import dia_branching_raw from "./branching.json"


const C1 = "CHAR1";
const C2 = "CHAR2";

// Has no protection against loopbacks, stack overflow/timeout will fail the test anyeays lol
function findEndOfDialogueTree (current: DialogueNode) {
    if (current.next) return findEndOfDialogueTree(evalDialogueNodeNext(current.next)!);
    // always select first option out of laziness.
    if(current.options[0]?.next) return findEndOfDialogueTree(evalDialogueNodeNext(current.options[0].next)!)
    return current;
}

describe("Very basic dialogue tree", () => {
    const parsedRoot = parseDialogue(dia_basic_raw as MonoData); // should typecheck at compile time also.
    it("parseDialogue returns a DialogueNode containing the correct text and speaker", () => {
        expect(parsedRoot.render).toBe("This is the root node, spoken by CHAR1");
        expect(parsedRoot.name).toBe(C1);
    });

    it("returned root's next points to the correct node, and that node is intialized", () => {
        expect(evalDialogueNodeNext(parsedRoot.next)).toBeDefined();
        const next = evalDialogueNodeNext(parsedRoot.next);
        if (!next) return;
        expect(next.render).toBe("Second Node Text, Spoken By CHAR2");
        expect(next.name).toBe(C2);
    });
})

describe("Parser traverses simple chain of dialogue nodes, correctly orders and appends each", () => {
        const parsedRoot = parseDialogue(dia_chain_raw as MonoData);
        const nodes = extractAllDialogueNodes(parsedRoot);

        it("We can follow this dialogue tree to the end node", () => {
            const tail = findEndOfDialogueTree(parsedRoot);
            expect(tail.name).toBe(C2);
            expect(tail.render).toBe("End Node");
        });

        it("Dialogue tree contains all the nodes we expect", () => {
            expect(nodes).toEqual(expect.arrayContaining([
                expect.objectContaining({ name: C1, render: "Root Node" }),
                expect.objectContaining({ name: C1, render: "Second Node" }),
                expect.objectContaining({ name: C1, render: "Third Node" }),
                expect.objectContaining({ name: C2, render: "End Node" }),
            ]))
        })

        it("Dialogue tree does not include inaccessible nodes", () => {
            expect(nodes).not.toEqual(expect.arrayContaining([
                expect.objectContaining({render: "YOU SHOULD NOT SEE THIS NODE" }),
            ]));
        })

});


describe("Handle branching dialogue", () => {
    const parsedRoot = parseDialogue(dia_branching_raw as MonoData);
    const nodes = extractAllDialogueNodes(parsedRoot);

    it("follows a basic connection to a sentence", () => {
        const next = evalDialogueNodeNext(parsedRoot.options[1].next);
        expect(next).toBeTruthy();
    })

    it("Check that we contain some of the expected nodes", () => {
        expect(nodes).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: "A", render: "Root" }),
            expect.objectContaining({ name: "A", render: "Blah blah blah" }),
            expect.objectContaining({ name: "A", render: "The End!" }),
            expect.objectContaining({ name: "B", render: "Result Of Choice 1-1" }),
        ]))
    });

    it("Root has 5 options", () => {
        expect(parsedRoot.options.length).toBe(5);
    });

    it("Chain of options using EMPTY_RENDER (root option 1 -> option 1 again)", () => {
        const next = evalDialogueNodeNext(parsedRoot.options[0].next);
        expect(next).toBeTruthy();
        expect(next?.render).toBe(EMPTY_RENDER);
        expect(next?.options.length).toBe(2);
        const followup = evalDialogueNodeNext(next?.options[0].next);
        expect(followup?.render).toBe("Result Of Choice 1-1");
    });

    it("Termination options go nowhere", () => {
        expect(parsedRoot.options[3]).toBeDefined();
        expect(parsedRoot.options[3].next).toBeUndefined();
    })

    it("Loopbacks work", () => {
        expect(parsedRoot.options[4]?.next).toBe(parsedRoot);
    })
});

const dia_actions_raw: MonoData = {
  RootNodeID: "root",
  Characters: [
    {
      ID: "0",
      Character: { Name: C1 },
    },
    {
      ID: "1",
      Character: { Name: C2 },
    },
  ],
  ListNodes: [
    {
      $type: "NodeRoot",
      ID: "root",
      NextID: "S1",
    },
    {
      $type: "NodeSentence",
      ID: "S1",
      Speaker: 0,
      Sentence: {
        English: "Before action",
      },
      NextID: "A1",
    },
    {
      $type: "NodeAction",
      ID: "A1",
      Action: "aaaa",
      Arguments: [
        {
          Type: "Integer",
          Value: 3,
        },
        {
          Type: "String",
          Value: "something",
        },
      ],
      NextID: "S2",
    },
    {
      $type: "NodeSentence",
      ID: "S2",
      Speaker: 1,
      Sentence: {
        English: "After action",
      },
      NextID: "A2",
    },
    {
      $type: "NodeAction",
      ID: "A2",
      Action: "argless",
      Arguments: [],
      NextID: "A3",
    },
    {
      $type: "NodeAction",
      ID: "A3",
      Action: "anotherac",
      Arguments: [
        {
          Type: "Boolean",
          Value: true,
        },
      ],
      NextID: -1,
    },
  ],
};

describe("NodeAction side effects", () => {
  const parsedRoot = parseDialogue(dia_actions_raw as MonoData);

  it("wires NodeAction nodes into the chain correctly", () => {
    // Root sentence
    expect(parsedRoot.render).toBe("Before action");
    expect(parsedRoot.name).toBe(C1);

    const firstAction = evalDialogueNodeNext(parsedRoot.next)!;
    expect(firstAction).toBeTruthy();
    // firstAction is an action node (created via createEmptyDialogueNode),
    // so it will typically have EMPTY_RENDER or similar.
    expect(firstAction.sideEffect).toBeTypeOf("function");

    const secondSentence = evalDialogueNodeNext(firstAction.next)!;
    expect(secondSentence.render).toBe("After action");
    expect(secondSentence.name).toBe(C2);

    const secondAction = evalDialogueNodeNext(secondSentence.next)!;
    expect(secondAction).toBeTruthy();
    expect(secondAction.sideEffect).toBeTypeOf("function");

    const thirdAction = evalDialogueNodeNext(secondAction.next)!;
    expect(thirdAction).toBeTruthy();
    expect(thirdAction.sideEffect).toBeTypeOf("function");

    // End of chain
    expect(evalDialogueNodeNext(thirdAction.next)).toBeUndefined();
  });

  it("executes actions with expected arguments via sideEffect", () => {
    const aaaa = vi.fn();
    const argless = vi.fn();
    const anotherac = vi.fn();

    const ctx = {
      actions: {
        aaaa,
        argless,
        anotherac,
      },
    };

    // Sentence 1 -> Action A1
    const firstAction = evalDialogueNodeNext(parsedRoot.next)!;
    firstAction.sideEffect?.(ctx);

    // A1 -> Sentence 2 -> Action A2
    const secondSentence = evalDialogueNodeNext(firstAction.next)!;
    const secondAction = evalDialogueNodeNext(secondSentence.next)!;
    secondAction.sideEffect?.(ctx);

    // A2 -> Action A3
    const thirdAction = evalDialogueNodeNext(secondAction.next)!;
    thirdAction.sideEffect?.(ctx);

    expect(aaaa).toHaveBeenCalledTimes(1);
    expect(aaaa).toHaveBeenCalledWith(3, "something");

    expect(argless).toHaveBeenCalledTimes(1);
    expect(argless).toHaveBeenCalledWith();

    expect(anotherac).toHaveBeenCalledTimes(1);
    expect(anotherac).toHaveBeenCalledWith(true);
  });
});
