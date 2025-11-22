[**daemon**](../../../../README.md)

***

# Interface: DialogueOption

Defined in: [src/core/dialogue/dialogueNode.types.ts:3](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L3)

## Extends

- [`DialogueOptionConfig`](DialogueOptionConfig.md)

## Properties

### fullText

> **fullText**: `string`

Defined in: [src/core/dialogue/dialogueNode.types.ts:5](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L5)

***

### next?

> `optional` **next**: [`DialogueNode`](../type-aliases/DialogueNode.md) \| (`ctx?`) => [`DialogueNode`](../type-aliases/DialogueNode.md)

Defined in: [src/core/dialogue/dialogueNode.types.ts:6](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L6)

***

### onlyShowWhen()?

> `optional` **onlyShowWhen**: (`ctx?`) => `boolean`

Defined in: [src/core/dialogue/dialogueNode.types.ts:24](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L24)

CB Used to filter options in realtime based on dialogue/gamestate

#### Parameters

##### ctx?

[`DialogueContext`](DialogueContext.md)

#### Returns

`boolean`

#### Inherited from

[`DialogueOptionConfig`](DialogueOptionConfig.md).[`onlyShowWhen`](DialogueOptionConfig.md#onlyshowwhen)

***

### sideEffect()?

> `optional` **sideEffect**: (`ctx?`) => `void`

Defined in: [src/core/dialogue/dialogueNode.types.ts:21](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L21)

Side effect that is immediately triggered when option selected.
Namely can be attached to termination options to trigger an event when the dialogue ends.

#### Parameters

##### ctx?

[`DialogueContext`](DialogueContext.md)

#### Returns

`void`

#### Inherited from

[`DialogueOptionConfig`](DialogueOptionConfig.md).[`sideEffect`](DialogueOptionConfig.md#sideeffect)

***

### summaryText

> **summaryText**: `string`

Defined in: [src/core/dialogue/dialogueNode.types.ts:4](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L4)
