[**daemon**](../../../../../README.md)

***

# Function: calculateAndApplyDamage()

> **calculateAndApplyDamage**(`__namedParameters`, `multipliers`): `object`

Defined in: [src/core/battle/utils/engine.utils.ts:71](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/engine.utils.ts#L71)

Cross-multiplies player and opponent multipliers and performs corresponding .takeDamage on each actor.

## Parameters

### \_\_namedParameters

[`Sides`](../../sides.utils/type-aliases/Sides.md)\<[`Combatant`](../../../model/combatant/classes/Combatant.md)\>

### multipliers

#### opponent

[`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

#### player

[`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

## Returns

`object`

### opponent

> **opponent**: `number` = `opponentDamageDealt`

### player

> **player**: `number` = `playerDamageDealt`
