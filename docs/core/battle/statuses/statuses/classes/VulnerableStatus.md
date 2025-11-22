[**daemon**](../../../../../README.md)

***

# Class: VulnerableStatus

Defined in: [src/core/battle/statuses/statuses.ts:20](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/statuses/statuses.ts#L20)

Represents a status effect that can be applied to a combatant.

This base class provides a default implementation for status effects,
including a unique name used for identification and a method for
retrieving damage multipliers based on the status level.

To create a new status effect, extend this class and override the `name`
property with a unique identifier and, if necessary, override the
`getStatusMultipliers` method to provide custom multiplier logic.

## Extends

- [`Status`](../../../model/status/classes/Status.md)

## Constructors

### Constructor

> **new VulnerableStatus**(): `VulnerableStatus`

#### Returns

`VulnerableStatus`

#### Inherited from

[`Status`](../../../model/status/classes/Status.md).[`constructor`](../../../model/status/classes/Status.md#constructor)

## Properties

### name

> **name**: `string` = `'vulnerable'`

Defined in: [src/core/battle/statuses/statuses.ts:21](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/statuses/statuses.ts#L21)

Class Field Declaration Of Status Name -- Used for keying statuses in Combatant by name and other checks. 
All new statuses must override this with their own unique name!

#### Overrides

[`Status`](../../../model/status/classes/Status.md).[`name`](../../../model/status/classes/Status.md#name)

## Methods

### getStatusMultipliers()

> **getStatusMultipliers**(`level`): [`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

Defined in: [src/core/battle/statuses/statuses.ts:23](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/statuses/statuses.ts#L23)

#### Parameters

##### level

`number`

#### Returns

[`DamageMultipliers`](../../../model/battle/type-aliases/DamageMultipliers.md)

#### Overrides

[`Status`](../../../model/status/classes/Status.md).[`getStatusMultipliers`](../../../model/status/classes/Status.md#getstatusmultipliers)
