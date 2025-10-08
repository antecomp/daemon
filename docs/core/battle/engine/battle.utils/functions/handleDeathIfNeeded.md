[**daemon**](../../../../../README.md)

***

# Function: handleDeathIfNeeded()

> **handleDeathIfNeeded**(`player`, `opponent`, `handleDeath`, `seqHighlightAnimations?`): `boolean`

Defined in: [src/core/battle/engine/battle.utils.ts:175](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.utils.ts#L175)

Handles the death logic for a battle scenario by checking if either the player
or the opponent has died. If a death is detected, it stops any ongoing highlight
animations and invokes the provided `handleDeath` callback with the result.

## Parameters

### player

[`Actor`](../../actor/classes/Actor.md)

The player actor involved in the battle.

### opponent

[`Actor`](../../actor/classes/Actor.md)

The opponent actor involved in the battle.

### handleDeath

(`result`) => `void`

A callback function to handle the death result. It receives
                     a string indicating the result: `"player"`, `"opponent"`, or `"draw"`.

### seqHighlightAnimations?

Optional animations for highlighting the sequence
                                of moves. If provided, these animations will be stopped
                                when a death is detected.
  - `seqHighlightAnimations.playerSeqAnim` - The animation for the player's sequence.
  - `seqHighlightAnimations.oppSeqAnim` - The animation for the opponent's sequence.

#### oppSeqAnim

`undefined` \| `Animation`

#### playerSeqAnim

`undefined` \| `Animation`

## Returns

`boolean`

`true` if a death was detected and handled, otherwise `false`. 
This return is used in executeRound to trigger an escape from evaluation loop.
