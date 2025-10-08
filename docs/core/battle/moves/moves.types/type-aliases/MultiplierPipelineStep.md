[**daemon**](../../../../../README.md)

***

# Type Alias: MultiplierPipelineStep()

> **MultiplierPipelineStep** = (`prevMultipliers`, `context`) => [`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)

Defined in: [src/core/battle/moves/moves.types.ts:81](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L81)

Represents a function that modifies the multipliers applied during a move.
These functions are reduced over to calculate the final multipliers.

## Parameters

### prevMultipliers

[`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)

### context

[`MoveContext`](../interfaces/MoveContext.md)

## Returns

[`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)
