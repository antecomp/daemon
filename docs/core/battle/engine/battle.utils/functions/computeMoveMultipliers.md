[**daemon**](../../../../../README.md)

***

# Function: computeMoveMultipliers()

> **computeMoveMultipliers**(`initialMultipliers`, `move`, `context`): [`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

Defined in: [src/core/battle/engine/battle.utils.ts:47](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.utils.ts#L47)

Reduce through a moves multipliers properties, returning the combined multipliers.

## Parameters

### initialMultipliers

[`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

The starting multipliers to apply.

### move

[`Move`](../../../moves/moves.types/interfaces/Move.md)

The move whose multipliers are being computed.

### context

[`MoveContext`](../../../moves/moves.types/interfaces/MoveContext.md)

The context in which the move is being executed.

## Returns

[`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

The combined multipliers after applying the move's multiplier pipeline.
