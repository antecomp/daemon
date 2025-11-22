[**daemon**](../../../../README.md)

***

# Function: inline()

> **inline**(`render`, `name`, `fn`): [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

Defined in: [src/core/dialogue/dialogueBuilder.ts:486](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L486)

Way to create inline dialogue trees by configuring the root node (with a render and name), then running a builder callback on the root.

## Parameters

### render

[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md)

DialogueRender for the root node.

### name

`string`

Name of the speaker for the root node.

### fn

(`rb`) => `void`

Function that builds out the inline subtree (with its head being the root created above).

## Returns

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

the root such that this inline tree can be attached to something else.
