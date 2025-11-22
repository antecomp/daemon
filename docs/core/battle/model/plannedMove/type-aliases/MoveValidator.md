[**daemon**](../../../../../README.md)

***

# Type Alias: MoveValidator()

> **MoveValidator** = (`workingPlan`) => `boolean`

Defined in: [src/core/battle/model/plannedMove.ts:10](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/plannedMove.ts#L10)

A function type that validates a planned move within a list of planned moves.
Used to prevent illegal move plans (e.g using 'repeat' at the start of a sequence.)

## Parameters

### workingPlan

[`PlannedMove`](../interfaces/PlannedMove.md)[]

The array of current planned moves.

## Returns

`boolean`

`true` if the move at the specified index is valid, otherwise `false`.
