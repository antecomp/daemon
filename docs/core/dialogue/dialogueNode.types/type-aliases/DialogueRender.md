[**daemon**](../../../../README.md)

***

# Type Alias: DialogueRender

> **DialogueRender** = `string` \| (`ctx?`) => `string`

Defined in: [src/core/dialogue/dialogueNode.types.ts:28](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L28)

A 'render' of a Dialogue node (determining the content of a message) is either just a plain string, or a function that returns a string (for contextual changes of message)
