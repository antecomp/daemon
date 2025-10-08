[**daemon**](../../../../../README.md)

***

# Function: handlePhaseAnimations()

> **handlePhaseAnimations**\<`TContext`\>(`playerMove`, `opponentMove`, `phase`, `playerContext`, `opponentContext`, `minimumAnimationTime`, `debugMode?`): `Promise`\<`void`\>

Defined in: [src/core/battle/animation/animations.utils.ts:117](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/animation/animations.utils.ts#L117)

Handles the execution of animations for our two animation breaks (pre or post damage calc).
If debug mode is enabled, animations are skipped entirely.

## Type Parameters

### TContext

`TContext` *extends* [`MoveContext`](../../../moves/moves.types/interfaces/MoveContext.md) \| [`PostMoveContext`](../../../moves/moves.types/type-aliases/PostMoveContext.md)

The context type, extending either `MoveContext` or `PostMoveContext`. 
Associated with if we're doing the pre or post animations.

## Parameters

### playerMove

[`Move`](../../../moves/moves.types/interfaces/Move.md)

The move performed by the player. (animation(s) grabbed from move)

### opponentMove

[`Move`](../../../moves/moves.types/interfaces/Move.md)

The move performed by the opponent. (animations(s) grabbed from move)

### phase

Animation phase;
- `pre` : before the damage is calculated (and health bars update), used to visualize the moves "in action"
- `post` : after damage is calculated and dished out, used to visualize any move side effects.

`"pre"` | `"post"`

### playerContext

`TContext`

The context associated with the player's move

### opponentContext

`TContext`

The context associated with the opponent's move.
- Contexts are passed to animations such that they can do conditional behavior (f.e changing what spritesheet to use based on damage)

### minimumAnimationTime

`number`

The delay to apply if no animations are present.

### debugMode?

`boolean`

Optional flag to disable animations for debugging/testing purposes.

## Returns

`Promise`\<`void`\>

A promise that resolves once the animations (or fallback delay) are completed.
