[**daemon**](../../../../../README.md)

***

# Function: mergeAndSortAnimations()

> **mergeAndSortAnimations**\<`TP`\>(`playerMove`, `opponentMove`, `phase`): `Map`\<`number`, \{ `opponent`: [`moveAnimationStep`](../../../moves/moves.types/interfaces/moveAnimationStep.md)\<`ContextType`\>[]; `player`: [`moveAnimationStep`](../../../moves/moves.types/interfaces/moveAnimationStep.md)\<`ContextType`\>[]; \}\>

Defined in: [src/core/battle/animation/animations.utils.ts:10](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/animation/animations.utils.ts#L10)

Combines the animations requested by player and opponents move, grouping and ordering them by priority

## Type Parameters

### TP

`TP` *extends* `"pre"` \| `"post"`

## Parameters

### playerMove

[`Move`](../../../moves/moves.types/interfaces/Move.md)

### opponentMove

[`Move`](../../../moves/moves.types/interfaces/Move.md)

### phase

`TP`

## Returns

`Map`\<`number`, \{ `opponent`: [`moveAnimationStep`](../../../moves/moves.types/interfaces/moveAnimationStep.md)\<`ContextType`\>[]; `player`: [`moveAnimationStep`](../../../moves/moves.types/interfaces/moveAnimationStep.md)\<`ContextType`\>[]; \}\>

a Map of priority to an object containing player and opponent animations for that priority.

## Argument

playerMove - The move the player is using. (Animation grabbed from here)

## Argument

opponentMove - The move the opponent is using. (Animation grabbed from here)

## Argument

phase - The phase of the move to grab animations for. (pre or post) - pre is before damage, post is after. Controls the required context type.
