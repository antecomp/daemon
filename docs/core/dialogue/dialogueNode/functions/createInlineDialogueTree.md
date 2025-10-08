[**daemon**](../../../../README.md)

***

# Function: createInlineDialogueTree()

> **createInlineDialogueTree**(`rootRender`, `rootName`, `builder`): [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

Defined in: [src/core/dialogue/dialogueNode.ts:184](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.ts#L184)

Creates an inline dialogue tree by initializing a root dialogue node and
passing it to a builder function for generating the tree (adding more nodes).

## Parameters

### rootRender

[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md)

The render function for the root dialogue node.

### rootName

`string`

The name of the root dialogue node.

### builder

(`root`) => `void`

A function that receives the root dialogue node and allows
customization of the dialogue tree structure.

## Returns

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

The root dialogue node of the constructed dialogue tree.

Motivation: .addChild returns the child node, so we cannot just inline .addChild calls, as we would lose the reference to the root node.
This function allows us to create an inline dialogue tree without having to save the root node.

## Example

```typescript
// Conditionally add an inline dialogue tree (branch) without having to save the root node.
   someDialogueNode.addChildIf(true, 
       createInlineDialogueTree("root of inline tree", "Inline Tree", (root) => {
           root.addChild("I'm a child of an inline tree")
               .addChild("I'm a grandchild of a child of an inline tree")
       })
   )
```
