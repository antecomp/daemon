[**daemon**](../../../../../README.md)

***

# Function: unwrapMoveMetaSequence()

> **unwrapMoveMetaSequence**(`self`, `seq`, `opponent`, `opponentSeq`): [`Move`](../../../moves/moves.types/interfaces/Move.md)[]

Defined in: [src/core/battle/engine/battle.utils.ts:76](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.utils.ts#L76)

Extracts the underlying Move information from MoveMeta sequence, allows us to do preprocessing logic for dynamic moves.

## Parameters

### self

[`Actor`](../../actor/classes/Actor.md)

The actor performing the moves.

### seq

[`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)[]

The sequence of `MoveMeta` objects for the actor.

### opponent

[`Actor`](../../actor/classes/Actor.md)

The opposing actor.

### opponentSeq

[`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)[]

The sequence of `MoveMeta` objects for the opponent.

## Returns

[`Move`](../../../moves/moves.types/interfaces/Move.md)[]

An array of `Move` objects extracted from the `MoveMeta` sequence.
