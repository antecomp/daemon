[**daemon**](../../../../README.md)

***

# Function: evalDialogueNodeNext()

> **evalDialogueNodeNext**(`next`, `ctx?`): `undefined` \| [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

Defined in: [src/core/dialogue/dialogueNode.ts:191](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.ts#L191)

Simple helper to collapse a dialogue nodes next (either a ref to another node, or a function that returns the ref) to just the ref

## Parameters

### next

`undefined` | [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md) | (`ctx?`) => [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

### ctx?

[`DialogueContext`](../../dialogueNode.types/interfaces/DialogueContext.md)

## Returns

`undefined` \| [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)
