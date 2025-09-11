import { describe, it, expect, vi } from "vitest";
import {
  createDialogueNode,
  createInlineDialogueTree,
  evalDialogueNodeNext,
  EMPTY_RENDER,
  createEmptyDialogueNode,
  isDialogueNodeEmpty,
  VISUALIZER,
} from "@/core/dialogue/dialogueNode";
import { DialogueContext, DialogueNode } from "@/core/dialogue/dialogueNode.types";
import { DEFAULT_DIALOGUE_SENDER } from "@/config";

describe("DialogueNode helpers", () => {
  it("createDialogueNode basics and id uniqueness", () => {
    const a = createDialogueNode("hello", "Alice");
    const b = createDialogueNode(() => "world", "Bob");
    expect(a.name).toBe("Alice");
    expect(b.name).toBe("Bob");
    expect(a.id).not.toBe(b.id);
    expect(typeof b.render).toBe("function");
  });

  it("addChild attaches new node from render and inherits name by default", () => {
    const root = createDialogueNode("root", "Alice");
    const child = root.addChild("child");
    expect(root.next).toBe(child);
    expect(child.name).toBe("Alice");
    expect((child.render as string)).toBe("child");
  });

  it("addChild attaches existing node instance and returns it", () => {
    const root = createDialogueNode("root", "Alice");
    const external = createDialogueNode("ext", "Eve");
    const ret = root.addChild(external);
    expect(ret).toBe(external);
    expect(root.next).toBe(external);
  });

  it("addChildAsOption creates child when render is passed and uses DEFAULT_DIALOGUE_SENDER when name omitted", () => {
    const root = createDialogueNode("root", "Alice");
    const child = root.addChildAsOption("S", "F", "opt-child");
    expect(root.options.length).toBe(1);
    const opt = root.options[0];
    expect((opt.next as DialogueNode).render).toBe("opt-child");
    expect((opt.next as DialogueNode).name).toBe(DEFAULT_DIALOGUE_SENDER);
    expect(child).toBe(opt.next);
  });

  it("addChildAsOption accepts existing node", () => {
    const root = createDialogueNode("root", "Alice");
    const existing = createDialogueNode("X", "Zed");
    root.addChildAsOption("S", "F", existing);
    expect(root.options[0].next).toBe(existing);
  });

  it("addCAROptionChild creates call node and links response (render or node)", () => {
    const root = createDialogueNode("root", "N");
    const resp = root.addCAROptionChild("S", "Call text", "Response text", "Caller", "Responder");
    const opt = root.options[0];
    const call = opt.next as DialogueNode;
    expect(call.name).toBe("Caller");
    expect(call.render).toBe("Call text");
    expect((call.next as DialogueNode).render).toBe("Response text");
    expect(resp).toBe(call.next);

    // Existing response node
    const respExisting = createDialogueNode("R2", "RR");
    root.addCAROptionChild("S2", "C2", respExisting);
    const call2 = root.options[1].next as DialogueNode;
    expect(call2.next).toBe(respExisting);
  });

  it("addMessageChain accepts both render and {name, render}", () => {
    const root = createDialogueNode("root", "A");
    const last = root.addMessageChain([
      "one",
      { name: "B", render: "two" },
      { name: "C", render: () => "three" },
    ]);
    expect((root.next as DialogueNode).render).toBe("one");
    expect(((root.next as DialogueNode).next as DialogueNode).name).toBe("B");
    expect((last.render as (ctx?: DialogueContext) => string)()).toBe("three");
  });

  it("attachSideEffect attaches and returns this", () => {
    const root = createDialogueNode("root", "A");
    const ef = vi.fn();
    const ret = root.attachSideEffect(ef);
    expect(ret).toBe(root);
    expect(root.sideEffect).toBe(ef);
  });

  it("addBackAndFourthChain alternates names", () => {
    const root = createDialogueNode("root", "A");
    const last = root.addBackAndFourthChain(["one", "two", "three"], "X", "Y");
    const n1 = root.next as DialogueNode;
    const n2 = n1.next as DialogueNode;
    const n3 = n2.next as DialogueNode;
    expect(n1.name).toBe("X");
    expect(n2.name).toBe("Y");
    expect(n3.name).toBe("X");
    expect(last).toBe(n3);
  });

  it("addTerminationOption pushes a termination option (no next)", () => {
    const root = createDialogueNode("root", "A");
    root.addTerminationOption("END", "bye");
    expect(root.options[0].summaryText).toBe("END");
    expect(root.options[0].next).toBeUndefined();
  });

  it("addOptions maps to addChildAsOption and returns children", () => {
    const root = createDialogueNode("root", "A");
    const [c1, c2] = root.addOptions([
      { summaryText: "S1", fullText: "F1", child: "C1" },
      { summaryText: "S2", fullText: "F2", child: "C2" },
    ]);
    expect((c1 as DialogueNode).render).toBe("C1");
    expect((c2 as DialogueNode).render).toBe("C2");
    expect(root.options.length).toBe(2);
  });

  it("addCAROptions maps to addCAROptionChild and returns responses", () => {
    const root = createDialogueNode("root", "A");
    const [r1, r2] = root.addCAROptions([
      { summaryText: "S1", fullText: "F1", response: "R1" },
      { summaryText: "S2", fullText: "F2", response: "R2" },
    ]);
    const call1 = root.options[0].next as DialogueNode;
    const call2 = root.options[1].next as DialogueNode;
    expect((call1.next as DialogueNode).render).toBe("R1");
    expect((call2.next as DialogueNode).render).toBe("R2");
    expect((r1 as DialogueNode).render).toBe("R1");
    expect((r2 as DialogueNode).render).toBe("R2");
  });

  it("conditional child and fallback helpers", () => {
    const root = createDialogueNode("root", "A");
    // addChildIf attaches only when true and when next empty
    root.addChildIf(false, "X").addFallbackChild("F");
    expect((root.next as DialogueNode).render).toBe("F");

    // Existing next prevents addChildIf from overwriting
    root.addChildIf(true as boolean, "SHOULD_NOT_ATTACH");
    expect((root.next as DialogueNode).render).toBe("F");

    // Options conditionals
    const node2 = createDialogueNode("node2", "B");
    node2.addChildAsOptionIf(false, { summaryText: "S", fullText: "F", next: "N" });
    expect(node2.options.length).toBe(0);
    node2.addFallbackChildAsOption({ summaryText: "FS", fullText: "FF", next: "FN" });
    expect(node2.options.length).toBe(1);
    expect(((node2.options[0].next as DialogueNode).render)).toBe("FN");
  });

  it("makeNodeWaitFor attaches and returns this", async () => {
    const root = createDialogueNode("root", "A");
    const ret = root.makeNodeWaitFor(async () => {});
    expect(ret).toBe(root);
    expect(typeof root.waitFor).toBe("function");
  });

  it("createInlineDialogueTree builds and returns root with children", () => {
    const inline = createInlineDialogueTree("R", "Inline", (root) => {
      root.addChild("C1").addChild("C2");
    });
    expect(inline.name).toBe("Inline");
    expect(((inline.next as DialogueNode).render)).toBe("C1");
  });

  it("evalDialogueNodeNext resolves function or returns node directly", () => {
    const n = createDialogueNode("R", "N");
    const fn = () => n;
    expect(evalDialogueNodeNext(n)).toBe(n);
    expect(evalDialogueNodeNext(fn)).toBe(n);
  });

  it("EMPTY_RENDER helpers and isDialogueNodeEmpty", () => {
    const empty = createEmptyDialogueNode();
    expect(isDialogueNodeEmpty(empty)).toBe(true);
    expect(empty.render).toBe(EMPTY_RENDER);
    const notEmpty = createDialogueNode("x", "y");
    expect(isDialogueNodeEmpty(notEmpty)).toBe(false);
    expect(typeof VISUALIZER).toBe("string");
  });
});
