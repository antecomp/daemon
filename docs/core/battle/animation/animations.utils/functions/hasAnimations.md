[**daemon**](../../../../../README.md)

***

# Function: hasAnimations()

> **hasAnimations**(`animations`): `boolean`

Defined in: [src/core/battle/animation/animations.utils.ts:79](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/animation/animations.utils.ts#L79)

Helper to check if we have any animations.
Used in battle logic to subsitute a delay for animations if there are none.

## Parameters

### animations

`Map`\<`number`, \{ `opponent`: [`moveAnimationStep`](../../../moves/moves.types/interfaces/moveAnimationStep.md)\<`any`\>[]; `player`: [`moveAnimationStep`](../../../moves/moves.types/interfaces/moveAnimationStep.md)\<`any`\>[]; \}\>

## Returns

`boolean`

true if there are any animations, false otherwise.

## Argument

animations - The animations to check (grabbed from mergeAndSortAnimations)
