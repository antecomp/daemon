[**daemon**](../../../../README.md)

***

# Type Alias: DialogueNode

> **DialogueNode** = `object`

Defined in: [src/core/dialogue/dialogueNode.types.ts:50](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L50)

A DialogueNode represents a single "message" within a dialogue tree. You can generate a completely new one with the createDialogueNode FF (this is done for a root node).

However, the main strength of DialogueNode is it's helper methods. Every DialogueNode provides methods that allow you to automatically generate and attach children nodes.
Furthermore, each of these methods return the newly created nodes, allowing you to chain multiple helpers together to quickly build dialogue trees.

Generally, refer to the JSDoc for the createDialogueNode and helper methods here instead of the node itself. You should never be declaring a node manually.

## Properties

### id

> **id**: `string`

Defined in: [src/core/dialogue/dialogueNode.types.ts:51](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L51)

Internal tracking of dialogue nodes for keying and visualization. This should never be changed.

***

### name

> **name**: `string`

Defined in: [src/core/dialogue/dialogueNode.types.ts:52](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L52)

who is speaking.

***

### next?

> `optional` **next**: `DialogueNode` \| (`ctx?`) => `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:55](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L55)

pointer to the subsequent node, typically a child DialogueNode, but this can also loop/point to other parts of the Dialogue Graph.

***

### options

> **options**: [`DialogueOption`](../interfaces/DialogueOption.md)[]

Defined in: [src/core/dialogue/dialogueNode.types.ts:54](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L54)

an array of "options" ({summaryText, fullText, next}), these are the players response-points, forks in the dialogue tree.

***

### render

> **render**: [`DialogueRender`](DialogueRender.md)

Defined in: [src/core/dialogue/dialogueNode.types.ts:53](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L53)

a string or a method that returns a string, represents the actual message content being sent. The method that returns a string type is if you want to make the messages change their content based on game-state, or if you want to use helpers such as pickRandom().

***

### sideEffect()?

> `optional` **sideEffect**: (`ctx?`) => `void`

Defined in: [src/core/dialogue/dialogueNode.types.ts:56](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L56)

method that runs whenever a dialogue node renders, allows you to update game state based on dialogue events.

#### Parameters

##### ctx?

[`DialogueContext`](../interfaces/DialogueContext.md)

#### Returns

`void`

***

### waitFor()?

> `optional` **waitFor**: (`ctx?`) => `Promise`\<`void`\>

Defined in: [src/core/dialogue/dialogueNode.types.ts:57](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L57)

blocking async side effect that is used for advancement instead of use interaction.

#### Parameters

##### ctx?

[`DialogueContext`](../interfaces/DialogueContext.md)

#### Returns

`Promise`\<`void`\>
