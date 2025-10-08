[**daemon**](../../../../README.md)

***

# Function: createDialogueNode()

> **createDialogueNode**(`render`, `name`): [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

Defined in: [src/core/dialogue/dialogueNode.ts:13](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.ts#L13)

Factory function for a dialogue node. Use this to create the root node.
Factory function here implements all the methods defined in dialogueNode.types.ts.

## Parameters

### render

[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md)

A string or a function that returns a string, representing the 'message' for a given dialogue node

### name

`string`

Name of the individual sending the message

## Returns

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

Reference to the created dialogue node.
