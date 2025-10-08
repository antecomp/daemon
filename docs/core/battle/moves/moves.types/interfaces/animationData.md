[**daemon**](../../../../../README.md)

***

# Interface: animationData\<T\>

Defined in: [src/core/battle/moves/moves.types.ts:111](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L111)

Represents animation data for a move, including its priority and the function
to execute the animation. The animation function is asynchronous.

## Extends

- [`moveAnimationStep`](moveAnimationStep.md)\<`T`\>

## Type Parameters

### T

`T` = [`MoveContext`](MoveContext.md) \| [`PostMoveContext`](../type-aliases/PostMoveContext.md)

## Properties

### execute()

> **execute**: (`ctx`) => `Promise`\<`void`\>

Defined in: [src/core/battle/moves/moves.types.ts:103](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L103)

#### Parameters

##### ctx

`T`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`moveAnimationStep`](moveAnimationStep.md).[`execute`](moveAnimationStep.md#execute)

***

### priority

> **priority**: `number`

Defined in: [src/core/battle/moves/moves.types.ts:112](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L112)

***

### soundEffect()?

> `optional` **soundEffect**: (`ctx`) => `Promise`\<`void`\>

Defined in: [src/core/battle/moves/moves.types.ts:104](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L104)

#### Parameters

##### ctx

`T`

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`moveAnimationStep`](moveAnimationStep.md).[`soundEffect`](moveAnimationStep.md#soundeffect)
