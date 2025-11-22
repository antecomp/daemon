[**daemon**](../../../../../README.md)

***

# Function: getBaseMultipliers()

> **getBaseMultipliers**(`type`): [`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

Defined in: [src/core/battle/utils/engine.utils.ts:35](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/engine.utils.ts#L35)

Get the base multipliers associated with a MoveType (aggressive, passive, defensive etc)
Used to get the initialMultipliers pushed to computeMoveMultipliers.

## Parameters

### type

[`MoveType`](../../../model/move.types/enumerations/MoveType.md)

## Returns

[`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)
