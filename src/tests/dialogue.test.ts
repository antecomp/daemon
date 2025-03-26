import {describe, it, expect} from 'vitest';

import { createDialogueNode, createInlineDialogueTree } from '@/core/dialogue/dialogueNode';

const CHARACTER = "Viya"

describe("DialogueNode composition helpers", () => {
    it('creates a basic node with render and name', () => {
        const node = createDialogueNode("Hello", CHARACTER);
        expect(node.name).toBe(CHARACTER);
        expect(typeof node.render).toBe("string");
        expect(node.render).toBe("Hello");
        expect(node.options.length).toBe(0);    
    });

    it('addChild creates a new node and sets next', () => {
        const root = createDialogueNode("Start", CHARACTER);
        const child = root.addChild("Next message");
        expect(root.next).toBe(child);
        expect(typeof child.render).toBe("string");
    });

    it('addChild inherits name from parent', () => {
        const root = createDialogueNode("Start", CHARACTER);
        const child = root.addChild("Next message");
        expect(child.name).toBe(CHARACTER);
    });

    it('addChildAsOption attaches option, returns child node', () => {
        const root = createDialogueNode("Choose", CHARACTER);
        const optionNode = root.addChildAsOption("Option", "Full Option", "Response");
        expect(root.options.length).toBe(1);
        expect(root.options[0].summaryText).toBe("Option");
        expect(optionNode.render).toBe("Response");    
    });

    it('addOptions add multiple options at once', () => {
        const root = createDialogueNode("Choose", CHARACTER);
        root.addOptions([
            {summaryText: "One", fullText: "Option One", renderOrNode: "Response 1"},
            {summaryText: "Two", fullText: "Option Two", renderOrNode: "Response 2"}
        ])
        expect(root.options.length).toBe(2);
        expect(root.options[1].summaryText).toBe("Two");    
    });

    it('addMessageChain adds chained nodes sequentially', () => {
        const root = createDialogueNode("Start", CHARACTER);
        const last = root.addMessageChain(["A", "B", "C"]);
        expect(root.next?.render).toBe("A");
        expect(root.next?.next?.render).toBe("B");
        expect(last.render).toBe("C");
      });
    
      it('addBackAndFourthChain alternates speakers', () => {
        const root = createDialogueNode("Hi", "A");
        const last = root.addBackAndFourthChain(["Yo", "Hey", "Sup"], "A", "B");
        expect(root.next?.name).toBe("A");
        expect(root.next?.next?.name).toBe("B");
        expect(last.name).toBe("A");
      });

      it('attachSideEffect assigns sideEffect', () => {
        const root = createDialogueNode("Test", CHARACTER);
        const effect = () => {};
        root.attachSideEffect(effect);
        expect(root.sideEffect).toBe(effect);
      });
    
      it('addChildIf conditionally adds next', () => {
        const root = createDialogueNode("Maybe", CHARACTER);
        root.addChildIf(true, "Conditional");
        expect(root.next?.render).toBe("Conditional");
      });
    
      it('addFallbackChild only adds if no next or options', () => {
        const root = createDialogueNode("Fallback?", CHARACTER);
        root.addFallbackChild("Fallback works");
        expect(root.next?.render).toBe("Fallback works");
      });
    
      it('addChildAsOptionIf conditionally adds an option', () => {
        const root = createDialogueNode("Choose", CHARACTER);
        root.addChildAsOptionIf(true, {
          summaryText: "Go",
          fullText: "Go now",
          next: "Move",
        });
        expect(root.options.length).toBe(1);
        expect(root.options[0].summaryText).toBe("Go");
      });
    
      it('addFallbackChildAsOption only adds if no options or next', () => {
        const root = createDialogueNode("Fallback opt", CHARACTER);
        root.addFallbackChildAsOption({
          summaryText: "Fallback",
          fullText: "Used only if no options",
          next: "Fallback response"
        });
        expect(root.options.length).toBe(1);

        const root2 = createDialogueNode("#2", CHARACTER);
        root2.addChild("adds a next");
        root2.addFallbackChildAsOption({
            summaryText: "Fallback We Should Never See",
            fullText: "Used only if no options",
            next: "Fallback response"
          });
        expect(root2.options.length).toBe(0);
      });
    
      it('addCAROptionChild adds call and then response node', () => {
        const root = createDialogueNode("Ready?", CHARACTER);
        root.addCAROptionChild("Yes", "Yep", "Cool");
        expect(root.options.length).toBe(1);
        const call = root.options[0].next!;
        expect(call.render).toBe("Yep");
        expect(call.next?.render).toBe("Cool");
      });
    
      it('addCAROptions adds multiple CARs', () => {
        const root = createDialogueNode("Options", CHARACTER);
        const [res1, res2] = root.addCAROptions([
          { summaryText: "1", fullText: "One", responseAsRenderOrNode: "Resp1" },
          { summaryText: "2", fullText: "Two", responseAsRenderOrNode: "Resp2" },
        ]);
        expect(res1.render).toBe("Resp1");
        expect(res2.render).toBe("Resp2");
        expect(root.options.length).toBe(2);
      });
    
      it('createInlineDialogueTree builds nested structure inline', () => {
        const inline = createInlineDialogueTree("Root", CHARACTER, (root) => {
          root.addChild("Step 1").addChild("Step 2");
        });
        expect(inline.render).toBe("Root");
        expect(inline.next?.render).toBe("Step 1");
        expect(inline.next?.next?.render).toBe("Step 2");
      });
})
