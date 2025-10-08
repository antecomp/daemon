[**daemon**](../../../../../README.md)

***

# Type Alias: PostMoveSideEffect()

> **PostMoveSideEffect** = (`context`) => `void`

Defined in: [src/core/battle/moves/moves.types.ts:75](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L75)

Represents a side effect function that is executed after a move has been
resolved. These functions can modify the state of the battle or apply
statuses based on the move's resolution.

## Parameters

### context

[`PostMoveContext`](PostMoveContext.md)

## Returns

`void`
