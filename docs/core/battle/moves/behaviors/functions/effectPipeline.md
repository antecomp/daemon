[**daemon**](../../../../../README.md)

***

# Function: effectPipeline()

> **effectPipeline**\<`T`\>(...`pipeline`): (`ctx`) => `void` \| [`MoveSideEffectOutcome`](../../../model/move.types/enumerations/MoveSideEffectOutcome.md)

Defined in: [src/core/battle/moves/behaviors.ts:17](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/moves/behaviors.ts#L17)

## Type Parameters

### T

`T` *extends* [`PreMoveContext`](../../../model/move.types/interfaces/PreMoveContext.md) \| [`PostMoveContext`](../../../model/move.types/type-aliases/PostMoveContext.md)

## Parameters

### pipeline

...(`ctx`) => `void` \| [`MoveSideEffectOutcome`](../../../model/move.types/enumerations/MoveSideEffectOutcome.md)[]

## Returns

> (`ctx`): `void` \| [`MoveSideEffectOutcome`](../../../model/move.types/enumerations/MoveSideEffectOutcome.md)

### Parameters

#### ctx

`T`

### Returns

`void` \| [`MoveSideEffectOutcome`](../../../model/move.types/enumerations/MoveSideEffectOutcome.md)
