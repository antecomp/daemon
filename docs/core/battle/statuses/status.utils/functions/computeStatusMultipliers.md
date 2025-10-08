[**daemon**](../../../../../README.md)

***

# Function: computeStatusMultipliers()

> **computeStatusMultipliers**(`actor`): [`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)

Defined in: [src/core/battle/statuses/status.utils.ts:36](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.utils.ts#L36)

Iterates through an actors current statuses, executing their getStatusMultipliers.
If multiple of the same status is applied, the multiplier function is still only run once, but it is passed
the number of duplicate instances of that current status at that time.

## Parameters

### actor

[`Actor`](../../../engine/actor/classes/Actor.md)

## Returns

[`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)
