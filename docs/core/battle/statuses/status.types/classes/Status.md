[**daemon**](../../../../../README.md)

***

# Abstract Class: Status

Defined in: [src/core/battle/statuses/status.types.ts:13](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L13)

Represents an abstract status effect in the battle engine.

A `Status` defines a type of effect that can be applied to an actor in the game,
with a specific duration and optional icon.
- Statuses can change the damage multipliers for an actor (as provided by their getStatusMultipliers method)
- Statuses can also perform a (post damage eval) side effect callback, defined by their applyPostEffect method.

## Extended by

- [`VulnerableStatus`](../../statuses/classes/VulnerableStatus.md)
- [`PreparedStatus`](../../statuses/classes/PreparedStatus.md)
- [`ManiaStatus`](../../statuses/classes/ManiaStatus.md)

## Constructors

### Constructor

> **new Status**(`type`, `duration`, `icon?`): `Status`

Defined in: [src/core/battle/statuses/status.types.ts:18](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L18)

#### Parameters

##### type

`string`

##### duration

`number` = `1`

##### icon?

`string`

#### Returns

`Status`

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

***

### duration

> **duration**: `number`

Defined in: [src/core/battle/statuses/status.types.ts:16](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L16)

***

### icon?

> `optional` **icon**: `string`

Defined in: [src/core/battle/statuses/status.types.ts:15](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L15)

***

### type

> **type**: `string`

Defined in: [src/core/battle/statuses/status.types.ts:14](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L14)

## Methods

### getStatusMultipliers()

> `abstract` **getStatusMultipliers**(`level`): [`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)

Defined in: [src/core/battle/statuses/status.types.ts:25](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L25)

Applies effect multipliers based on level, where level = stack depth (amount of times effect applied)

#### Parameters

##### level

`number`

#### Returns

[`MultiplierSet`](../../../engine/battle.types/type-aliases/MultiplierSet.md)

***

### tick()

> **tick**(): `boolean`

Defined in: [src/core/battle/statuses/status.types.ts:32](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/statuses/status.types.ts#L32)

Reduce duration

#### Returns

`boolean`
