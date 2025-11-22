[**daemon**](../../../../../README.md)

***

# Function: applyStatusTo()

> **applyStatusTo**\<`T`\>(`who`, `Stat`, `duration`): (`ctx`) => `void`

Defined in: [src/core/battle/moves/behaviors.ts:43](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/moves/behaviors.ts#L43)

## Type Parameters

### T

`T` *extends* [`PreMoveContext`](../../../model/move.types/interfaces/PreMoveContext.md) \| [`PostMoveContext`](../../../model/move.types/type-aliases/PostMoveContext.md)

## Parameters

### who

`"them"` | `"self"`

### Stat

*typeof* [`Status`](../../../model/status/classes/Status.md)

### duration

`number` = `1`

## Returns

> (`ctx`): `void`

### Parameters

#### ctx

`T`

### Returns

`void`
