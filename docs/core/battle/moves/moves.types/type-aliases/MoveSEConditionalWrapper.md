[**daemon**](../../../../../README.md)

***

# Type Alias: MoveSEConditionalWrapper()\<T\>

> **MoveSEConditionalWrapper**\<`T`\> = (`effect`) => `T`

Defined in: [src/core/battle/moves/moves.types.ts:87](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L87)

A wrapper function that conditionally applies a side effect to a move.
This can be used to add conditional logic to side effects.

## Type Parameters

### T

`T` = [`MoveSideEffect`](MoveSideEffect.md) \| [`PostMoveSideEffect`](PostMoveSideEffect.md)

## Parameters

### effect

`T`

## Returns

`T`
