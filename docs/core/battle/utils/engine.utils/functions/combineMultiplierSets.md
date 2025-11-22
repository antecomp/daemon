[**daemon**](../../../../../README.md)

***

# Function: combineMultiplierSets()

> **combineMultiplierSets**(...`sets`): [`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

Defined in: [src/core/battle/utils/engine.utils.ts:12](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/engine.utils.ts#L12)

Helper function to multiply "incoming" and "outgoing" for multiple multiplier sets.

## Parameters

### sets

...[`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)[]

The multiplier sets to combine.

## Returns

[`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

A single `DamageMultipliers` set with combined "incoming" and "outgoing" values.
