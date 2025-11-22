[**daemon**](../../../../../README.md)

***

# Function: computeStatusMultipliers()

> **computeStatusMultipliers**(`statusList`): [`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

Defined in: [src/core/battle/utils/engine.utils.ts:51](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/engine.utils.ts#L51)

Computes the combined status multipliers from a list of status-level pairs.

Iterates through each `[Status, number]` tuple in the provided `statusList`,
retrieves the multipliers for each status at the given level using `getStatusMultipliers`,
and combines them using `combineMultiplierSets`. The combination starts from
the `PASSTHROUGH_MULTPLIERS` as the initial accumulator.

## Parameters

### statusList

\[[`Status`](../../../model/status/classes/Status.md), `number`\][]

An array of tuples, where each tuple contains a `Status` object and a corresponding level (`number`). <- this is returned by combatant's `getStatuses()` method.

## Returns

[`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

The resulting combined multipliers after applying all statuses in the list.
