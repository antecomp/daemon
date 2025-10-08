[**daemon**](../../../../../README.md)

***

# Function: calculateAndApplyDamage()

> **calculateAndApplyDamage**(`player`, `opponent`, `playerMults`, `opponentMults`): `object`

Defined in: [src/core/battle/engine/battle.utils.ts:196](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.utils.ts#L196)

Cross-multiplies player and opponent multipliers and performs corresponding .takeDamage on each actor.

## Parameters

### player

[`Actor`](../../actor/classes/Actor.md)

### opponent

[`Actor`](../../actor/classes/Actor.md)

### playerMults

[`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

### opponentMults

[`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

## Returns

`object`

### opponentDamageDealt

> **opponentDamageDealt**: `number`

### playerDamageDealt

> **playerDamageDealt**: `number`
