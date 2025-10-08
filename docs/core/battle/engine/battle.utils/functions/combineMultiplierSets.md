[**daemon**](../../../../../README.md)

***

# Function: combineMultiplierSets()

> **combineMultiplierSets**(...`sets`): [`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

Defined in: [src/core/battle/engine/battle.utils.ts:60](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.utils.ts#L60)

Helper function to multiply "incoming" and "outgoing" for multiple multiplier sets.

## Parameters

### sets

...[`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)[]

The multiplier sets to combine.

## Returns

[`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

A single `MultiplierSet` with combined "incoming" and "outgoing" values.
