[**daemon**](../../../../../README.md)

***

# Class: VulnerableStatus

Defined in: [src/core/battle/statuses/statuses.ts:7](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/statuses.ts#L7)

Represents an abstract status effect in the battle engine.

A `Status` defines a type of effect that can be applied to an actor in the game,
with a specific duration and optional icon.
- Statuses can change the damage multipliers for an actor (as provided by their getStatusMultipliers method)
- Statuses can also perform a (post damage eval) side effect callback, defined by their applyPostEffect method.

## Extends

- [`Status`](../../status.types/classes/Status.md)

## Constructors

### Constructor

> **new VulnerableStatus**(`duration`): `VulnerableStatus`

Defined in: [src/core/battle/statuses/statuses.ts:8](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/statuses.ts#L8)

#### Parameters

##### duration

`number` = `1`

#### Returns

`VulnerableStatus`

#### Overrides

[`Status`](../../status.types/classes/Status.md).[`constructor`](../../status.types/classes/Status.md#constructor)

## Properties

### applyPostEffect()?

> `optional` **applyPostEffect**: (`self`, `opponent`, `level`) => `void`

Defined in: [src/core/battle/statuses/status.types.ts:27](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L27)

#### Parameters

##### self

[`Actor`](../../../engine/actor/classes/Actor.md)

##### opponent

[`Actor`](../../../engine/actor/classes/Actor.md)

##### level

`number`

#### Returns

`void`

#### Inherited from

[`Status`](../../status.types/classes/Status.md).[`applyPostEffect`](../../status.types/classes/Status.md#applyposteffect)

***

### duration

> **duration**: `number`

Defined in: [src/core/battle/statuses/status.types.ts:16](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L16)

#### Inherited from

[`Status`](../../status.types/classes/Status.md).[`duration`](../../status.types/classes/Status.md#duration)

***

### icon?

> `optional` **icon**: `string`

Defined in: [src/core/battle/statuses/status.types.ts:15](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L15)

#### Inherited from

[`Status`](../../status.types/classes/Status.md).[`icon`](../../status.types/classes/Status.md#icon)

***

### type

> **type**: `string`

Defined in: [src/core/battle/statuses/status.types.ts:14](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L14)

#### Inherited from

[`Status`](../../status.types/classes/Status.md).[`type`](../../status.types/classes/Status.md#type)

## Methods

### getStatusMultipliers()

> **getStatusMultipliers**(`level`): [`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)

Defined in: [src/core/battle/statuses/statuses.ts:12](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/statuses.ts#L12)

Applies effect multipliers based on level, where level = stack depth (amount of times effect applied)

#### Parameters

##### level

`number`

#### Returns

[`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)

#### Overrides

[`Status`](../../status.types/classes/Status.md).[`getStatusMultipliers`](../../status.types/classes/Status.md#getstatusmultipliers)

***

### tick()

> **tick**(): `boolean`

Defined in: [src/core/battle/statuses/status.types.ts:32](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L32)

Reduce duration

#### Returns

`boolean`

#### Inherited from

[`Status`](../../status.types/classes/Status.md).[`tick`](../../status.types/classes/Status.md#tick)
