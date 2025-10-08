[**daemon**](../../../../README.md)

***

# Interface: DialogueOptionConfig

Defined in: [src/core/dialogue/dialogueNode.types.ts:16](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L16)

## Extended by

- [`DialogueOption`](DialogueOption.md)

## Properties

### onlyShowWhen()?

> `optional` **onlyShowWhen**: (`ctx?`) => `boolean`

Defined in: [src/core/dialogue/dialogueNode.types.ts:24](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L24)

CB Used to filter options in realtime based on dialogue/gamestate

#### Parameters

##### ctx?

[`DialogueContext`](DialogueContext.md)

#### Returns

`boolean`

***

### sideEffect()?

> `optional` **sideEffect**: (`ctx?`) => `void`

Defined in: [src/core/dialogue/dialogueNode.types.ts:21](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L21)

Side effect that is immediately triggered when option selected.
Namely can be attached to termination options to trigger an event when the dialogue ends.

#### Parameters

##### ctx?

[`DialogueContext`](DialogueContext.md)

#### Returns

`void`
