[**daemon**](../../../../../README.md)

***

# Class: Combatant

Defined in: [src/core/battle/model/combatant.ts:29](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L29)

The `Combatant` class tracks the health and status effects of a combatant in the battle system. It provides methods for taking damage,
healing, adding and extending status effects, and ticking or reaping expired statuses.

## Remarks

Statuses are handled in a "stack" of durations, where each time the same status is applied it's duration is individually tracked.
The 'level' of a status is then determined by how many simulatenous instances of said status are currently in the duration stack and nonzero

## Example

```typescript
const c = new Combatant(100);
c.takeDamage(20);
c.heal(10);
c.addStatus(new Status, 3);
c.tickStatuses();
c.reapExpiredStatuses();
```

## Constructors

### Constructor

> **new Combatant**(`maxHealth`): `Combatant`

Defined in: [src/core/battle/model/combatant.ts:34](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L34)

#### Parameters

##### maxHealth

`number`

#### Returns

`Combatant`

## Properties

### maxHealth

> `readonly` **maxHealth**: `number`

Defined in: [src/core/battle/model/combatant.ts:30](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L30)

## Accessors

### activeStatuses

#### Get Signature

> **get** **activeStatuses**(): \[[`Status`](../../status/classes/Status.md), `number`\][]

Defined in: [src/core/battle/model/combatant.ts:98](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L98)

Returns an array of active (non zero duration) Statuses, along with their level as a tuple

##### Returns

\[[`Status`](../../status/classes/Status.md), `number`\][]

***

### health

#### Get Signature

> **get** **health**(): `number`

Defined in: [src/core/battle/model/combatant.ts:50](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L50)

##### Returns

`number`

***

### healthPercent

#### Get Signature

> **get** **healthPercent**(): `number`

Defined in: [src/core/battle/model/combatant.ts:46](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L46)

##### Returns

`number`

***

### isDead

#### Get Signature

> **get** **isDead**(): `boolean`

Defined in: [src/core/battle/model/combatant.ts:54](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L54)

##### Returns

`boolean`

## Methods

### addStatus()

> **addStatus**(`status`, `duration`): `void`

Defined in: [src/core/battle/model/combatant.ts:67](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L67)

Adds a status effect to the combatant with a specified duration.
If the status already exists, the duration is added to its duration stack.
Otherwise, the status is initialized with the given duration.

#### Parameters

##### status

[`Status`](../../status/classes/Status.md)

The status effect to add.

##### duration

`number` = `1`

The duration of the status effect (default is 1).

#### Returns

`void`

***

### extendStatus()

> **extendStatus**(`status`, `amount`): `void`

Defined in: [src/core/battle/model/combatant.ts:134](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L134)

Extends the duration of an existing status effect on the combatant.

#### Parameters

##### status

The status to extend, specified as a string key or a Status object.

`string` | [`Status`](../../status/classes/Status.md)

##### amount

`number` = `1`

The amount to add to each duration in the status's duration stack. Defaults to 1.

#### Returns

`void`

#### Remarks

If the specified status does not exist on the combatant, this method does nothing.

***

### getStatusAndLevel()

> **getStatusAndLevel**(`name`): (`undefined` \| `number` \| [`Status`](../../status/classes/Status.md))[]

Defined in: [src/core/battle/model/combatant.ts:90](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L90)

Retrieves the status object and its active level for a given status name.

#### Parameters

##### name

`string`

The name of the status to look up.

#### Returns

(`undefined` \| `number` \| [`Status`](../../status/classes/Status.md))[]

A tuple containing the status object (or `undefined` if not found) and the number of active duration stacks (level).

***

### getStatusLevel()

> **getStatusLevel**(`name`): `number`

Defined in: [src/core/battle/model/combatant.ts:109](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L109)

#### Parameters

##### name

`string`

#### Returns

`number`

***

### getStatusLevelIncludingExpired()

> **getStatusLevelIncludingExpired**(`name`): `number`

Defined in: [src/core/battle/model/combatant.ts:119](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L119)

#### Parameters

##### name

`string`

#### Returns

`number`

***

### heal()

> **heal**(`amount`): `void`

Defined in: [src/core/battle/model/combatant.ts:42](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L42)

#### Parameters

##### amount

`number`

#### Returns

`void`

***

### reapExpiredStatuses()

> **reapExpiredStatuses**(): `void`

Defined in: [src/core/battle/model/combatant.ts:150](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L150)

Removes expired statuses from the `statuses` map.
Iterates through all statuses and deletes any status whose `durationStack`
does not contain any positive duration values (i.e., all durations are zero or less).

#### Returns

`void`

#### Remarks

This method is intended to clean up statuses that are no longer active
based on their duration stacks.

***

### takeDamage()

> **takeDamage**(`amount`): `void`

Defined in: [src/core/battle/model/combatant.ts:38](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L38)

#### Parameters

##### amount

`number`

#### Returns

`void`

***

### tickStatuses()

> **tickStatuses**(): `void`

Defined in: [src/core/battle/model/combatant.ts:78](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/combatant.ts#L78)

#### Returns

`void`
