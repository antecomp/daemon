[**daemon**](../../../../../README.md)

***

# Function: executeAnimations()

> **executeAnimations**\<`contextType`\>(`animations`, `playerContext`, `opponentContext`): `Promise`\<`void`\>

Defined in: [src/core/battle/animation/animations.utils.ts:46](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/animation/animations.utils.ts#L46)

Execute animations in order of priority. Used in tandem with mergeAndSortAnimations.

## Type Parameters

### contextType

`contextType` = [`MoveContext`](../../../moves/moves.types/interfaces/MoveContext.md) \| [`PostMoveContext`](../../../moves/moves.types/type-aliases/PostMoveContext.md)

## Parameters

### animations

`Map`\<`number`, \{ `opponent`: [`moveAnimationStep`](../../../moves/moves.types/interfaces/moveAnimationStep.md)\<`contextType`\>[]; `player`: [`moveAnimationStep`](../../../moves/moves.types/interfaces/moveAnimationStep.md)\<`contextType`\>[]; \}\>

### playerContext

`contextType`

### opponentContext

`contextType`

## Returns

`Promise`\<`void`\>

## Argument

animations - The animations to execute, grouped by priority.

## Argument

playerContext - The context to pass to player animations.

## Argument

opponentContext - The context to pass to opponent animations
