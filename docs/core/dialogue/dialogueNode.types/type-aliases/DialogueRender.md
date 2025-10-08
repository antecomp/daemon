[**daemon**](../../../../README.md)

***

# Type Alias: DialogueRender

> **DialogueRender** = `string` \| (`ctx?`) => `string`

Defined in: [src/core/dialogue/dialogueNode.types.ts:28](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L28)

A 'render' of a Dialogue node (determining the content of a message) is either just a plain string, or a function that returns a string (for contextual changes of message)
