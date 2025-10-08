[**daemon**](../../../../README.md)

***

# Type Alias: RenderOrNode

> **RenderOrNode** = [`DialogueRender`](DialogueRender.md) \| [`DialogueNode`](DialogueNode.md)

Defined in: [src/core/dialogue/dialogueNode.types.ts:32](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L32)

Many of the methods for attaching new nodes allow you to either attach an existing DialogueNode (created elsewhere)
or just provide a DialogueRender instance, and a new node will be built from that automatically.
