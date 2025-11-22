[**daemon**](../../../../../README.md)

***

# Class: Status

Defined in: [src/core/battle/model/status.ts:18](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/status.ts#L18)

Represents a status effect that can be applied to a combatant.

This base class provides a default implementation for status effects,
including a unique name used for identification and a method for
retrieving damage multipliers based on the status level.

To create a new status effect, extend this class and override the `name`
property with a unique identifier and, if necessary, override the
`getStatusMultipliers` method to provide custom multiplier logic.

## Extended by

- [`PreparedStatus`](../../../statuses/statuses/classes/PreparedStatus.md)
- [`ManiaStatus`](../../../statuses/statuses/classes/ManiaStatus.md)
- [`VulnerableStatus`](../../../statuses/statuses/classes/VulnerableStatus.md)

## Constructors

### Constructor

> **new Status**(): `Status`

#### Returns

`Status`

## Properties

### name

> **name**: `string` = `DEFAULT_STATUS_TYPE`

Defined in: [src/core/battle/model/status.ts:21](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/status.ts#L21)

Class Field Declaration Of Status Name -- Used for keying statuses in Combatant by name and other checks. 
All new statuses must override this with their own unique name!

## Methods

### getStatusMultipliers()

> **getStatusMultipliers**(`_level`): [`DamageMultipliers`](../../battle/type-aliases/DamageMultipliers.md)

Defined in: [src/core/battle/model/status.ts:24](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/status.ts#L24)

#### Parameters

##### \_level

`number`

#### Returns

[`DamageMultipliers`](../../battle/type-aliases/DamageMultipliers.md)
